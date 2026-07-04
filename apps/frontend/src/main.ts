import {bootstrapApplication} from "@angular/platform-browser";
import {AppComponent} from "./app/app.component";
import {provideHttpClient} from "@angular/common/http";
import {provideRouter, withViewTransitions} from "@angular/router";
import {appRoutes} from "./app/app.routes";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(appRoutes, withViewTransitions()),
    provideAnimationsAsync()
  ]
})
  .catch(err => console.error(err));