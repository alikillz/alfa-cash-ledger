import { AppConfigService } from '../services/app-config.service';

export function initializeApp(appConfigService: AppConfigService) {
  return (): Promise<any> => {
    return appConfigService.loadConfig();
  };
}
