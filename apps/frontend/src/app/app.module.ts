import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import {RouterLinkActive, RouterLinkWithHref, RouterModule, Routes} from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ProductsComponent } from './products/products/products.component';
import { CreateProductComponent } from './products/create-product/create-product.component';
import { UpdateProductComponent } from './products/update-product/update-product.component';
import { FormProductComponent } from './products/form-product/form-product.component';
import { ProductComponent } from './products/product/product.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { MenuComponent } from './components/menu/menu.component';

const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'products', component: ProductsComponent },
  { path: 'products/create', component: CreateProductComponent, canActivate: [AuthGuard] },
  { path: 'products/form', component: FormProductComponent, canActivate: [AuthGuard] },
  { path: 'products/:id', component: ProductComponent },
  { path: 'products/:id/update', component: UpdateProductComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'products' },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ProductsComponent,
    CreateProductComponent,
    UpdateProductComponent,
    FormProductComponent,
    ProductComponent,
    ProfileComponent,
    MenuComponent,
  ],
  imports: [BrowserModule, HttpClientModule, ReactiveFormsModule, RouterModule.forRoot(routes), RouterLinkWithHref, RouterLinkActive],
  bootstrap: [AppComponent],
})
export class AppModule {}
