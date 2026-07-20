import {bootstrapApplication} from "@angular/platform-browser";
import {AppComponent} from "./app/app.component";
import {provideHttpClient} from "@angular/common/http";
import {provideRouter, withViewTransitions} from "@angular/router";
import {appRoutes} from "./app/app.routes";
import {provideZonelessChangeDetection} from "@angular/core";

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(appRoutes, withViewTransitions()),
  ]
})
  .catch(err => console.error(err));