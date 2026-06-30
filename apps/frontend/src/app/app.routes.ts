import {Routes} from "@angular/router";
import {LoginComponent} from "./pages/login/login.component";
import {SignupComponent} from "./pages/signup/signup.component";
import {ProfileComponent} from "./pages/profile/profile.component";
import {canActivate} from "./guards/auth.guard";
import {ProductsComponent} from "./products/products/products.component";
import {CreateProductComponent} from "./products/create-product/create-product.component";
import {FormProductComponent} from "./products/form-product/form-product.component";
import {ProductComponent} from "./products/product/product.component";
import {UpdateProductComponent} from "./products/update-product/update-product.component";

export const appRoutes: Routes = [
  {path: '', redirectTo: 'products', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'profile', component: ProfileComponent, canActivate: [canActivate]},
  {path: 'products', component: ProductsComponent},
  {path: 'products/create', component: CreateProductComponent, canActivate: [canActivate]},
  {path: 'products/form', component: FormProductComponent, canActivate: [canActivate]},
  {path: 'products/:id', component: ProductComponent},
  {path: 'products/:id/update', component: UpdateProductComponent, canActivate: [canActivate]},
  {path: '**', redirectTo: 'products'},
];