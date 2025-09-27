import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { ProductsComponent } from './features/products/products.component';
import { AuthGuard } from './core/auth/auth.guard';
import { StockComponent } from './features/stock/stock.component';
import { FinancialComponent } from './features/finances/finance.component';
import { PdvComponent } from './features/pdv/pdv.component';
import { SuppliersComponent } from './features/suppliers/suppliers.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';



export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'trocar-senha',
    loadComponent: () => import('./features/login/change-password.component').then(m => m.ChangePasswordComponent)
  },
  
  // Dashboard inicial
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  
  // Áreas protegidas
  { path: 'produtos', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'fornecedores', component: SuppliersComponent, canActivate: [AuthGuard] },
  { path: 'estoque', component: StockComponent, canActivate: [AuthGuard] },
  { path: 'financeiro', component: FinancialComponent, canActivate: [AuthGuard] },
  { path: 'pdv', component: PdvComponent, canActivate: [AuthGuard] },

  
  { path: '**', redirectTo: 'login' },
];