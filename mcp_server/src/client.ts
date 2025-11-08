/**
 * Nexar Supply API Client
 * Handles OAuth2 authentication and GraphQL queries
 */
import axios, { AxiosInstance } from 'axios';
import { PartObject, NexarSearchResponse, NexarTokenResponse } from './types.js';

export class NexarClient {
  private clientId: string;
  private clientSecret: string;
  private tokenUrl: string = 'https://identity.nexar.com/connect/token';
  private apiUrl: string = 'https://api.nexar.com/graphql';
  private accessToken: string | null = null;
  private axiosInstance: AxiosInstance;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    
    if (!clientId || !clientSecret) {
      throw new Error('NEXAR_CLIENT_ID and NEXAR_CLIENT_SECRET must be set');
    }

    this.axiosInstance = axios.create({
      timeout: 30000,
    });
  }

  /**
   * Get OAuth2 access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await this.axiosInstance.post<NexarTokenResponse>(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'supply',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        }
      );

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Nexar authentication failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search for components using Nexar GraphQL API
   * Returns components in PartObject format
   */
  async searchComponents(query: string, limit: number = 10): Promise<PartObject[]> {
    const token = await this.getAccessToken();

    const graphqlQuery = `
      query SearchParts($query: String!, $limit: Int!) {
        supSearch(
          q: $query
          limit: $limit
        ) {
          results {
            part {
              mpn
              manufacturer {
                name
              }
              shortDescription
              medianPrice1000 {
                price
                currency
              }
              specs {
                attribute {
                  shortname
                }
                value {
                  text
                }
              }
              bestDatasheet {
                url
              }
            }
          }
        }
      }
    `;

    const variables = { query, limit };

    try {
      const response = await this.axiosInstance.post<NexarSearchResponse>(
        this.apiUrl,
        {
          query: graphqlQuery,
          variables,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (response.data.errors) {
        const errorMessages = response.data.errors.map((e) => e.message).join(', ');
        throw new Error(`Nexar API errors: ${errorMessages}`);
      }

      const results = response.data.data?.supSearch?.results || [];
      const components: PartObject[] = [];

      for (const result of results) {
        const part = result.part;
        if (!part) continue;

        // Extract basic info
        const mpn = part.mpn || '';
        const manufacturer = part.manufacturer?.name || '';
        const description = part.shortDescription || `${manufacturer} ${mpn}`;

        // Extract price
        const priceData = part.medianPrice1000;
        const price = priceData?.price ?? 0.0;
        const currency = priceData?.currency || 'USD';

        // Extract specs
        const specs = part.specs || [];
        let voltage: string | undefined;
        let packageType: string | undefined;
        const interfaces: string[] = [];

        for (const spec of specs) {
          const attrName = spec.attribute?.shortname?.toLowerCase() || '';
          const value = spec.value?.text || '';

          if (attrName.includes('voltage') || attrName.includes('vdd')) {
            voltage = value;
          } else if (attrName.includes('package') || attrName.includes('case')) {
            packageType = value;
          } else if (
            attrName.includes('interface') ||
            attrName.includes('protocol') ||
            attrName.includes('communication')
          ) {
            if (value) {
              interfaces.push(...value.split(',').map((i) => i.trim()).filter(Boolean));
            }
          }
        }

        // Get datasheet
        const datasheet = part.bestDatasheet?.url;

        // Build PartObject matching frontend types.ts
        const component: PartObject = {
          mpn,
          manufacturer,
          description,
          price: typeof price === 'number' ? price : parseFloat(String(price)) || 0.0,
          currency,
          quantity: 1,
        };

        if (voltage) component.voltage = voltage;
        if (packageType) component.package = packageType;
        if (interfaces.length > 0) component.interfaces = interfaces;
        if (datasheet) component.datasheet = datasheet;

        components.push(component);
      }

      return components;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Nexar API request failed: ${error.message}`);
      }
      throw error;
    }
  }
}

