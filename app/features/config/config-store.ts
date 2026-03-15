import { ApiConfig } from "../../types/types";

export class ConfigStore {
  private apiConfig: ApiConfig;

  setApiConfig(config: ApiConfig) {
    this.apiConfig = config;
  }

  getApiConfig(): ApiConfig {
    return this.apiConfig;
  }

  static instance: ConfigStore;
  static getInstance() {
    if (!ConfigStore.instance) {
      ConfigStore.instance = new ConfigStore();
    }
    return ConfigStore.instance;
  }
}