from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
import time
import random
from typing import Dict

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store active queries for context requests
active_queries: Dict[str, dict] = {}
query_id_counter = 0

# Mock components data (matching frontend mock)
MOCK_COMPONENTS = [
    {
        "id": "mcu",
        "name": "Microcontroller",
        "hierarchy": 0,
        "reasoning": [
            "Analyzing project requirements: need WiFi/BT, sufficient GPIO, and low power consumption",
            "Comparing ESP32-S3 vs ESP32-C3: ESP32-S3 offers better performance and more pins",
            "Checking availability: ESP32-S3-WROOM-1 is in stock at multiple suppliers",
            "Validating compatibility: 3.3V operation matches power supply design",
        ],
        "partData": {
            "mpn": "ESP32-S3-WROOM-1-N8R2",
            "manufacturer": "Espressif Systems",
            "description": "WiFi and Bluetooth 5.0 enabled 32-bit microcontroller with dual-core processor",
            "price": 2.89,
            "currency": "USD",
            "voltage": "3.0V ~ 3.6V",
            "package": "48-QFN",
            "interfaces": ["I2C", "SPI", "UART", "WiFi", "Bluetooth 5.0"],
            "datasheet": "https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf",
            "quantity": 1,
        },
        "position": {"x": 300, "y": 200},
    },
    {
        "id": "power",
        "name": "Power Management",
        "hierarchy": 1,
        "reasoning": [
            "Calculating power budget: MCU needs 3.3V @ 240mA, sensors need 3.3V @ 50mA",
            "USB-C input is 5V, need LDO regulator with 600mA capacity",
            "AP2112K-3.3 provides 600mA with low dropout voltage",
            "Checking thermal performance: AP2112K handles 600mA without overheating",
        ],
        "partData": {
            "mpn": "AP2112K-3.3TRG1",
            "manufacturer": "Diodes Incorporated",
            "description": "600mA low dropout voltage regulator with enable pin",
            "price": 0.45,
            "currency": "USD",
            "voltage": "2.5V ~ 6.0V input, 3.3V output",
            "package": "SOT-25",
            "interfaces": [],
            "datasheet": "https://www.diodes.com/assets/Datasheets/AP2112.pdf",
            "quantity": 1,
        },
        "position": {"x": 200, "y": 220},
    },
    {
        "id": "sensors",
        "name": "Temperature Sensor",
        "hierarchy": 1,
        "reasoning": [
            "Project requires temperature and humidity sensing with high accuracy",
            "BME280 provides temperature, humidity, and pressure in single package",
            "I2C interface compatible with ESP32-S3, only needs 2 GPIO pins",
            "Validating accuracy: ±3% RH and ±1°C meets project requirements",
        ],
        "partData": {
            "mpn": "BME280",
            "manufacturer": "Bosch Sensortec",
            "description": "Digital humidity, pressure and temperature sensor with I2C and SPI interfaces",
            "price": 3.95,
            "currency": "USD",
            "voltage": "1.71V ~ 3.6V",
            "package": "LGA-8",
            "interfaces": ["I2C", "SPI"],
            "datasheet": "https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme280-ds002.pdf",
            "quantity": 1,
        },
        "position": {"x": 400, "y": 220},
    },
    {
        "id": "memory",
        "name": "Flash Memory",
        "hierarchy": 2,
        "reasoning": [
            "ESP32-S3 has 8MB flash, but project needs additional storage for data logging",
            "W25Q128 provides 16MB SPI flash with fast read/write speeds",
            "SPI interface uses 4 pins, compatible with ESP32-S3 SPI peripheral",
            "Verifying endurance: 100K write cycles sufficient for logging application",
        ],
        "partData": {
            "mpn": "W25Q128JVSIQ",
            "manufacturer": "Winbond Electronics",
            "description": "128M-bit serial flash memory with SPI interface",
            "price": 1.25,
            "currency": "USD",
            "voltage": "2.7V ~ 3.6V",
            "package": "SOIC-8",
            "interfaces": ["SPI"],
            "datasheet": "https://www.winbond.com/resource-files/w25q128jv%20revf%2003272018%20plus.pdf",
            "quantity": 1,
        },
        "position": {"x": 300, "y": 120},
    },
    {
        "id": "antenna",
        "name": "WiFi Antenna",
        "hierarchy": 2,
        "reasoning": [
            "ESP32-S3 requires external antenna for optimal WiFi/BT range",
            "Ceramic chip antenna provides good performance in compact form factor",
            "ANT-2.4-CHP-T tuned for 2.4GHz ISM band with 2dBi gain",
            "Placement verified: antenna position optimized for RF performance",
        ],
        "partData": {
            "mpn": "ANT-2.4-CHP-T",
            "manufacturer": "Antenova",
            "description": "2.4GHz ceramic chip antenna with 2dBi gain for WiFi and Bluetooth applications",
            "price": 0.85,
            "currency": "USD",
            "voltage": "N/A",
            "package": "Chip",
            "interfaces": [],
            "datasheet": "https://www.antenova.com/datasheets/ANT-2.4-CHP-T.pdf",
            "quantity": 1,
        },
        "position": {"x": 380, "y": 150},
    },
    {
        "id": "passives",
        "name": "Passives & Caps",
        "hierarchy": 3,
        "reasoning": [
            "Decoupling capacitors needed: 100nF for each IC power pin, 10µF bulk capacitor",
            "0603 package size provides good balance of size and capacitance",
            "X7R dielectric suitable for temperature range and voltage rating",
            "Calculating total: 8x 100nF + 2x 10µF = 10 capacitors total",
        ],
        "partData": {
            "mpn": "0603-X7R-100nF-50V",
            "manufacturer": "Generic",
            "description": "100nF X7R ceramic capacitor in 0603 package, 50V rating",
            "price": 0.12,
            "currency": "USD",
            "voltage": "50V",
            "package": "0603",
            "interfaces": [],
            "quantity": 10,
        },
        "position": {"x": 220, "y": 150},
    },
    {
        "id": "connector",
        "name": "USB-C Connector",
        "hierarchy": 3,
        "reasoning": [
            "USB-C connector needed for power input and programming interface",
            "USB4105-GF-A provides USB 2.0 data and 5V power in compact package",
            "24-pin connector with proper mechanical retention",
            "Verifying compatibility: matches ESP32-S3 USB-C design guidelines",
        ],
        "partData": {
            "mpn": "USB4105-GF-A",
            "manufacturer": "GCT",
            "description": "USB Type-C connector with 24 pins, USB 2.0 data and 5V power",
            "price": 0.65,
            "currency": "USD",
            "voltage": "5V",
            "package": "SMT",
            "interfaces": ["USB 2.0"],
            "datasheet": "https://gct.co/files/drawings/usb4105.pdf",
            "quantity": 1,
        },
        "position": {"x": 250, "y": 300},
    },
]


@app.route("/mcp/query", methods=["POST"])
def mcp_query():
    """Handle MCP query requests"""
    global query_id_counter
    
    data = request.get_json()
    query = data.get("query", "")
    
    # Simulate random context request (10% chance)
    if random.random() < 0.1:
        query_id_counter += 1
        query_id = f"query_{query_id_counter}_{int(time.time() * 1000)}"
        active_queries[query_id] = {"query": query, "timestamp": time.time()}
        
        return jsonify({
            "type": "context_request",
            "queryId": query_id,
            "message": f'I need more information to process your query: "{query}". Please provide additional context about your requirements.'
        })
    
    # Otherwise return a response
    return jsonify({
        "type": "response",
        "message": f'Response to: "{query}" - Analysis complete. Components have been selected and validated.'
    })


@app.route("/mcp/continue", methods=["POST"])
def mcp_continue():
    """Handle MCP continue requests (context provided)"""
    data = request.get_json()
    context = data.get("context", "")  # Context provided by user
    query_id = data.get("queryId", "")
    
    # Check if query exists
    query_data = active_queries.get(query_id)
    if not query_data:
        return jsonify({
            "type": "error",
            "message": "Query ID not found. It may have expired."
        }), 404
    
    # Simulate random additional context request (30% chance)
    if random.random() < 0.3:
        return jsonify({
            "type": "context_request",
            "queryId": query_id,
            "message": "Thank you for the context. I need one more piece of information: What is your preferred budget range?"
        })
    
    # Return final response
    original_query = query_data.get("query", "")
    active_queries.pop(query_id, None)  # Clean up
    
    return jsonify({
        "type": "response",
        "message": f'Thank you for providing the context. Based on your query "{original_query}" and the context you provided, here is the final response.'
    })


@app.route("/mcp/component-analysis", methods=["POST"])
def component_analysis():
    """Handle component analysis requests with SSE streaming"""
    global query_id_counter
    
    data = request.get_json()
    query = data.get("query", "")  # User's original query
    context_query_id = data.get("contextQueryId")
    context = data.get("context", "")  # Context provided if resuming
    
    # Simulate context request (10% chance if no context provided)
    if not context_query_id and random.random() < 0.1:
        query_id_counter += 1
        query_id = f"query_{query_id_counter}_{int(time.time() * 1000)}"
        
        def generate_context_request():
            yield f"data: {json.dumps({
                'type': 'context_request',
                'queryId': query_id,
                'message': 'I need more information about your power requirements. What is your target voltage range?'
            })}\n\n"
        
        return Response(
            generate_context_request(),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    
    # Stream component analysis
    def generate_analysis():
        reasoning_delay = 2.0  # 2 seconds between reasoning updates
        selection_delay = 5.0   # 5 seconds before selection
        
        for component in MOCK_COMPONENTS:
            # Send reasoning updates (2-4 per component)
            reasoning_count = random.randint(2, 4)
            
            for i in range(reasoning_count):
                reasoning_snippet = component["reasoning"][i] if i < len(component["reasoning"]) else component["reasoning"][-1]
                
                yield f"data: {json.dumps({
                    'type': 'reasoning',
                    'componentId': component['id'],
                    'componentName': component['name'],
                    'reasoning': reasoning_snippet,
                    'hierarchyLevel': component['hierarchy']
                })}\n\n"
                
                time.sleep(reasoning_delay)
            
            # Send selection update
            time.sleep(selection_delay)
            
            yield f"data: {json.dumps({
                'type': 'selection',
                'componentId': component['id'],
                'componentName': component['name'],
                'partData': component['partData'],
                'position': component['position'],
                'hierarchyLevel': component['hierarchy']
            })}\n\n"
        
        # Send completion
        time.sleep(0.5)
        yield f"data: {json.dumps({
            'type': 'complete',
            'message': 'Component analysis complete. All components validated and optimized.'
        })}\n\n"
    
    return Response(
        generate_analysis(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "jigsaw-backend"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)

