"""
Flask MCP Client - Backend for Jigsaw Circuit Board Design
Uses Dedalus SDK to interact with LLM and MCP server for component search
"""

import os
import json
import uuid
import re
from typing import Dict, Optional, List, Tuple
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
from dedalus_labs import Dedalus, DedalusRunner

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
DEDALUS_API_KEY = os.getenv("DEDALUS_API_KEY")
MCP_SERVER_REGISTRY_ID = os.getenv("MCP_SERVER_REGISTRY_ID")
PORT = int(os.getenv("PORT", "3001"))
MODEL = os.getenv("MODEL", "openai/gpt-5")

# Validate required environment variables
if not DEDALUS_API_KEY:
    raise ValueError("DEDALUS_API_KEY environment variable is required")
if not MCP_SERVER_REGISTRY_ID:
    raise ValueError("MCP_SERVER_REGISTRY_ID environment variable is required")

# Initialize Dedalus client
dedalus_client = Dedalus()
dedalus_runner = DedalusRunner(dedalus_client)

# In-memory state management
# Structure: {queryId: {query: str, messages: List[str], status: str}}
query_state: Dict[str, Dict] = {}

# BOM file path
BOM_FILE = "bom.json"


def load_bom() -> List[Dict]:
    """Load BOM from JSON file."""
    if os.path.exists(BOM_FILE):
        try:
            with open(BOM_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []


def save_bom(bom: List[Dict]) -> None:
    """Save BOM to JSON file."""
    with open(BOM_FILE, "w") as f:
        json.dump(bom, f, indent=2)


def detect_context_request(text: str) -> bool:
    """
    Detect if LLM response is asking for more context.
    Looks for question patterns or explicit requests for information.
    """
    text_lower = text.lower()
    
    # Patterns that indicate context request
    context_patterns = [
        r"i need (more|additional|further)",
        r"what (is|are|do|does|can)",
        r"can you (provide|tell|share|specify)",
        r"please (provide|specify|tell|share)",
        r"could you (provide|tell|share|specify)",
        r"i (would|will) need",
        r"to (better|properly|accurately)",
        r"more (information|details|context|specifications)",
        r"additional (information|details|context|specifications)",
        r"what (are|is) your",
        r"tell me (about|more)",
    ]
    
    # Check if text contains question marks and context patterns
    has_question = "?" in text
    matches_pattern = any(re.search(pattern, text_lower) for pattern in context_patterns)
    
    # If it's a short response with questions, likely context request
    if has_question and (matches_pattern or len(text.split()) < 50):
        return True
    
    return False


def parse_component_from_reasoning(reasoning: str) -> Tuple[str, str]:
    """
    Extract component ID and name from reasoning text.
    Returns (component_id, component_name)
    """
    reasoning_lower = reasoning.lower()
    
    # Component mapping
    component_keywords = {
        "mcu": ("mcu", "Microcontroller"),
        "microcontroller": ("mcu", "Microcontroller"),
        "processor": ("mcu", "Microcontroller"),
        "power": ("power", "Power Management"),
        "regulator": ("power", "Power Management"),
        "ldo": ("power", "Power Management"),
        "sensor": ("sensors", "Sensor"),
        "temperature": ("sensors", "Temperature Sensor"),
        "humidity": ("sensors", "Humidity Sensor"),
        "memory": ("memory", "Memory"),
        "flash": ("memory", "Flash Memory"),
        "antenna": ("antenna", "Antenna"),
        "wifi": ("antenna", "WiFi Antenna"),
        "capacitor": ("passives", "Capacitor"),
        "resistor": ("passives", "Resistor"),
        "connector": ("connector", "Connector"),
        "usb": ("connector", "USB Connector"),
    }
    
    for keyword, (comp_id, comp_name) in component_keywords.items():
        if keyword in reasoning_lower:
            return (comp_id, comp_name)
    
    return ("unknown", "Component")


@app.route("/mcp/query", methods=["POST"])
def mcp_query():
    """
    Handle initial chat query.
    Request: {query: string}
    Response: {type: "response"|"context_request", queryId?: string, message: string}
    """
    try:
        data = request.get_json()
        if not data or "query" not in data:
            return jsonify({"error": "Missing 'query' field"}), 400
        
        query = data["query"]
        query_id = f"query_{uuid.uuid4().hex[:12]}"
        
        # Build prompt for component design assistance
        prompt = f"""You are an expert electronic circuit board design assistant. 
The user wants to design a circuit board with the following requirements:
{query}

Help them by:
1. Providing recommendations for components
2. Asking clarifying questions if you need more information about power requirements, interfaces, size constraints, etc.
3. Using the search_components tool to find compatible parts when you have enough information

If you need more information to provide a good recommendation, ask a specific question.
Otherwise, provide your recommendation."""

        # Call Dedalus SDK
        result = dedalus_runner.run(
            input=prompt,
            model=MODEL,
            mcp_servers=[MCP_SERVER_REGISTRY_ID],
            stream=False
        )
        
        response_text = result.final_output
        
        # Store query state
        query_state[query_id] = {
            "query": query,
            "messages": [{"role": "user", "content": query}, {"role": "assistant", "content": response_text}],
            "status": "active"
        }
        
        # Detect if this is a context request
        is_context_request = detect_context_request(response_text)
        
        if is_context_request:
            return jsonify({
                "type": "context_request",
                "queryId": query_id,
                "message": response_text
            }), 200
        else:
            return jsonify({
                "type": "response",
                "message": response_text
            }), 200
            
    except Exception as e:
        app.logger.error(f"Error in /mcp/query: {str(e)}")
        return jsonify({"error": str(e), "code": "INTERNAL_ERROR"}), 500


@app.route("/mcp/continue", methods=["POST"])
def mcp_continue():
    """
    Handle context response to continue conversation.
    Request: {context: string, queryId: string}
    Response: {type: "response"|"context_request", queryId?: string, message: string}
    """
    try:
        data = request.get_json()
        if not data or "context" not in data or "queryId" not in data:
            return jsonify({"error": "Missing 'context' or 'queryId' field"}), 400
        
        context = data["context"]
        query_id = data["queryId"]
        
        # Check if query exists
        if query_id not in query_state:
            return jsonify({"error": "Query ID not found", "code": "NOT_FOUND"}), 404
        
        state = query_state[query_id]
        original_query = state["query"]
        messages = state["messages"]
        
        # Build continuation prompt with full conversation history
        conversation_history = "\n".join([
            f"{msg['role']}: {msg['content']}" for msg in messages
        ])
        
        prompt = f"""Previous conversation:
{conversation_history}

User provided context: {context}

Continue the conversation. If you now have enough information, provide your recommendation using the search_components tool if needed.
If you still need more information, ask another specific question."""

        # Call Dedalus SDK
        result = dedalus_runner.run(
            input=prompt,
            model=MODEL,
            mcp_servers=[MCP_SERVER_REGISTRY_ID],
            stream=False
        )
        
        response_text = result.final_output
        
        # Update state
        state["messages"].append({"role": "user", "content": context})
        state["messages"].append({"role": "assistant", "content": response_text})
        
        # Detect if this is a context request
        is_context_request = detect_context_request(response_text)
        
        if is_context_request:
            return jsonify({
                "type": "context_request",
                "queryId": query_id,
                "message": response_text
            }), 200
        else:
            return jsonify({
                "type": "response",
                "message": response_text
            }), 200
            
    except Exception as e:
        app.logger.error(f"Error in /mcp/continue: {str(e)}")
        return jsonify({"error": str(e), "code": "INTERNAL_ERROR"}), 500


@app.route("/mcp/component-analysis", methods=["POST"])
def mcp_component_analysis():
    """
    Handle streaming component analysis.
    Request: {query: string, contextQueryId?: string, context?: string}
    Response: SSE stream with reasoning, selection, complete, error, context_request events
    """
    try:
        data = request.get_json()
        if not data or "query" not in data:
            return jsonify({"error": "Missing 'query' field"}), 400
        
        query = data["query"]
        context_query_id = data.get("contextQueryId")
        context = data.get("context")
        
        # Build analysis prompt
        if context_query_id and context:
            # Resuming with context
            prompt = f"""Analyze and select components for this circuit board design: {query}

Context provided: {context}

Perform hierarchical component analysis:
1. Start with core components (microcontroller, power management)
2. Then supporting components (sensors, memory, antennas)
3. Finally passive components (capacitors, resistors, connectors)

For each component:
- Think through requirements (send reasoning updates)
- Use search_components tool to find compatible parts
- Select the best component based on specifications

Output your reasoning as you analyze each component."""
        else:
            prompt = f"""Analyze and select components for this circuit board design: {query}

Perform hierarchical component analysis:
1. Start with core components (microcontroller, power management)
2. Then supporting components (sensors, memory, antennas)
3. Finally passive components (capacitors, resistors, connectors)

For each component:
- Think through requirements (send reasoning updates)
- Use search_components tool to find compatible parts
- Select the best component based on specifications

Output your reasoning as you analyze each component."""

        def generate():
            try:
                # Run with streaming
                result = dedalus_runner.run(
                    input=prompt,
                    model=MODEL,
                    mcp_servers=[MCP_SERVER_REGISTRY_ID],
                    stream=True
                )
                
                current_component = None
                current_component_name = None
                reasoning_buffer = ""
                hierarchy_level = 0
                components_selected = []
                bom = load_bom()
                
                # Iterate over streaming result
                # Note: We'll need to inspect the actual structure, but this is a reasonable approach
                for update in result:
                    # Convert update to string to inspect
                    update_str = str(update)
                    
                    # Try to extract text/reasoning
                    if hasattr(update, 'text'):
                        text = update.text
                    elif hasattr(update, 'content'):
                        text = update.content
                    elif isinstance(update, str):
                        text = update
                    else:
                        # Try to get any text-like attribute
                        text = getattr(update, 'delta', getattr(update, 'message', str(update)))
                    
                    if text and text.strip():
                        reasoning_buffer += text
                        
                        # Update current component from reasoning
                        comp_id, comp_name = parse_component_from_reasoning(reasoning_buffer)
                        if comp_id != "unknown":
                            current_component = comp_id
                            current_component_name = comp_name
                            # Set hierarchy level based on component type
                            if comp_id in ["mcu"]:
                                hierarchy_level = 0
                            elif comp_id in ["power", "sensors"]:
                                hierarchy_level = 1
                            elif comp_id in ["memory", "antenna"]:
                                hierarchy_level = 2
                            else:
                                hierarchy_level = 3
                        
                        # Send reasoning update
                        yield f"data: {json.dumps({
                            'type': 'reasoning',
                            'componentId': current_component or 'analyzing',
                            'componentName': current_component_name or 'Component',
                            'reasoning': text.strip(),
                            'hierarchyLevel': hierarchy_level
                        })}\n\n"
                    
                    # Check for tool calls/results
                    # This will need to be adjusted based on actual SDK structure
                    if hasattr(update, 'tool_call') or 'tool' in update_str.lower():
                        # Tool is being called - component selection may be coming
                        pass
                    
                    if hasattr(update, 'tool_result') or 'result' in update_str.lower():
                        # Try to extract tool result
                        try:
                            if hasattr(update, 'result'):
                                result_data = update.result
                            elif hasattr(update, 'tool_result'):
                                result_data = update.tool_result
                            else:
                                # Try to parse from string representation
                                result_data = None
                            
                            # If we have result data, try to parse PartObject[]
                            if result_data:
                                # Result data might be JSON string or dict
                                if isinstance(result_data, str):
                                    try:
                                        result_data = json.loads(result_data)
                                    except:
                                        pass
                                
                                # Look for component data in result
                                if isinstance(result_data, dict):
                                    # Check if this looks like PartObject data
                                    if 'mpn' in result_data or (isinstance(result_data.get('content'), list) and len(result_data.get('content', [])) > 0):
                                        # Parse PartObject from result
                                        if 'content' in result_data:
                                            # MCP tool result format
                                            content = result_data['content']
                                            if isinstance(content, list) and len(content) > 0:
                                                # First content item might be text with JSON
                                                text_content = content[0].get('text', '') if isinstance(content[0], dict) else str(content[0])
                                                try:
                                                    components = json.loads(text_content)
                                                    if isinstance(components, list) and len(components) > 0:
                                                        part_data = components[0]
                                                        # Validate PartObject format
                                                        if 'mpn' in part_data and 'manufacturer' in part_data:
                                                            # Send selection update
                                                            yield f"data: {json.dumps({
                                                                'type': 'selection',
                                                                'componentId': current_component or 'component',
                                                                'componentName': current_component_name or 'Component',
                                                                'partData': part_data,
                                                                'hierarchyLevel': hierarchy_level
                                                            })}\n\n"
                                                            
                                                            # Add to BOM
                                                            if part_data['mpn'] not in [c.get('mpn') for c in bom]:
                                                                bom.append(part_data)
                                                                save_bom(bom)
                                                            
                                                            components_selected.append(part_data)
                                                except:
                                                    pass
                        except Exception as e:
                            app.logger.debug(f"Error parsing tool result: {e}")
                
                # Send completion
                yield f"data: {json.dumps({
                    'type': 'complete',
                    'message': f'Component analysis complete. Selected {len(components_selected)} components.'
                })}\n\n"
                
            except Exception as e:
                app.logger.error(f"Error in component analysis stream: {str(e)}")
                yield f"data: {json.dumps({
                    'type': 'error',
                    'message': f'Analysis failed: {str(e)}'
                })}\n\n"
        
        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no'
            }
        )
        
    except Exception as e:
        app.logger.error(f"Error in /mcp/component-analysis: {str(e)}")
        return jsonify({"error": str(e), "code": "INTERNAL_ERROR"}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)

