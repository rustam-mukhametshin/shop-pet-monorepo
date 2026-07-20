import {bootstrapApplication} from "@angular/platform-browser";
import {AppComponent} from "./app/app.component";
import {provideHttpClient} from "@angular/common/http";
import {provideRouter, withViewTransitions} from "@angular/router";
import {appRoutes} from "./app/app.routes";
import {provideBrowserGlobalErrorListeners, provideZonelessChangeDetection} from "@angular/core";

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(appRoutes, withViewTransitions()),
    provideBrowserGlobalErrorListeners()
  ]
})
  .catch(err => console.error(err));