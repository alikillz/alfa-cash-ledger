import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppConfig, DEFAULT_CONFIG } from '../models/app-config.model';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private configSubject = new BehaviorSubject<AppConfig>(DEFAULT_CONFIG);
  public config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<void> {
    return this.http
      .get<AppConfig>('assets/config/app-config.json')
      .pipe(
        map((config) => ({ ...DEFAULT_CONFIG, ...config })),
        tap((config) => this.configSubject.next(config))
      )
      .toPromise()
      .then(() => undefined)
      .catch((error) => {
        console.warn('Failed to load external config, using defaults', error);
        this.configSubject.next(DEFAULT_CONFIG);
      });
  }

  getConfig(): AppConfig {
    return this.configSubject.value;
  }

  getValue<T extends keyof AppConfig>(key: T): AppConfig[T] {
    return this.configSubject.value[key];
  }

  isFeatureEnabled(feature: string): boolean {
    const features: { [key: string]: boolean } = {
      ocr: this.getValue('enableOCR'),
      offline: this.getValue('enableOfflineMode'),
      backups: this.getValue('enableBackups'),
    };

    return features[feature] || false;
  }
}
