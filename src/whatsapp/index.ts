// Main WhatsApp Integration Hub

// Business API (Facebook Business Manager)
export * as BusinessAPI from './business-api';

// Shared types and utilities
export * from './shared/types';

// Factory function to get the appropriate WhatsApp service
export function getWhatsAppService(provider: 'business-api' = 'business-api') { // Default and only option is business-api
  switch (provider) {
    case 'business-api':
      return import('./business-api');
    default:
      // This case should ideally not be reached if an invalid provider is passed.
      // However, to be safe, we can throw an error or log a warning.
      console.warn(`Invalid WhatsApp provider: ${provider}. Defaulting to business-api.`);
      return import('./business-api');
  }
}

// Configuration helper
export interface WhatsAppProviderConfig {
  provider: 'business-api'; // Only business-api is supported
  businessApi?: {
    phoneNumberId: string;
    accessToken: string;
    businessAccountId: string;
  };
  // openSource related config removed
}

export class WhatsAppManager {
  private provider: 'business-api'; // Only business-api
  private config: WhatsAppProviderConfig;

  constructor(config: WhatsAppProviderConfig) {
    this.provider = config.provider; // Should always be 'business-api'
    if (config.provider !== 'business-api') {
      console.warn("Attempted to initialize WhatsAppManager with a non-business-api provider. Forcing to 'business-api'.");
      this.provider = 'business-api';
    }
    this.config = config;
  }

  async getService() {
    // No need to switch, always return business-api service
    return await import('./business-api');
  }

  getProvider(): 'business-api' {
    return this.provider; // Will always be 'business-api'
  }

  updateConfig(newConfig: Partial<WhatsAppProviderConfig>) {
    // Ensure provider cannot be changed from business-api if included in newConfig
    if (newConfig.provider && newConfig.provider !== 'business-api') {
      console.warn("Attempted to update provider to non-business-api. Provider change ignored.");
      delete newConfig.provider; // Remove invalid provider update
    }
    this.config = { ...this.config, ...newConfig };
    // Ensure the provider in config is always 'business-api'
    this.config.provider = 'business-api';
  }
} 