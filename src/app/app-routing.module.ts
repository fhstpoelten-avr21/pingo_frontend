import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard, canActivateChild } from './common/guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'pingo',
    loadChildren: () => import('./pages/pingo/pingo.module').then( m => m.PingoPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule),
    canActivateChild: [AuthGuard]
  },
  {
    path: 'login-register',
    loadChildren: () => import('./pages/login-register/login-register.module').then( m => m.LoginRegisterPageModule)
  },
  {
    path: 'qr-scan',
    loadChildren: () => import('./pages/qr-scan/qr-scan.module').then( m => m.QrScanPageModule)
  },
  {
    path: 'profile-update',
    loadChildren: () => import('./pages/profile-update/profile-update.module').then( m => m.ProfileUpdatePageModule),
    canActivateChild: [AuthGuard]

  },
  {
    path: 'join',
    loadChildren: () => import('./pages/join/join.module').then( m => m.JoinPageModule)
  },
  {
    path: '**',
    redirectTo: '/welcome'
},
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then( m => m.WelcomePageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
