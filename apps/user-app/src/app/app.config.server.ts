import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';
import { TRANSLOCO_LOADER } from '@jsverse/transloco';
import { appConfig } from './app.config';
import { TranslocoServerLoader } from './core/transloco-server.loader';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: TRANSLOCO_LOADER, useClass: TranslocoServerLoader },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
