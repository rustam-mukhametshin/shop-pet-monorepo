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
  {path: '', redirectTo: 'products', pathMatch: 'full',},
  {path: 'login', component: LoginComponent, title: 'Login',},
  {path: 'signup', component: SignupComponent, title: 'Signup',},
  {path: 'profile', component: ProfileComponent, title: 'Profile', canActivate: [canActivate]},
  {path: 'products', component: ProductsComponent, title: 'Products',},
  {path: 'products/create', component: CreateProductComponent, title: 'Create', canActivate: [canActivate]},
  {path: 'products/form', component: FormProductComponent, title: 'Form', canActivate: [canActivate]},
  {path: 'products/:id', component: ProductComponent, title: 'Product',},
  {path: 'products/:id/update', component: UpdateProductComponent, title: 'Update product', canActivate: [canActivate]},
  {path: '**', redirectTo: 'products'},
];