import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthApiService } from 'src/app/services/api/auth-api/auth-api.service';
import { AuthService } from 'src/app/services/auth/auth.service';


export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  
  return authService.isAuthenticated().then(res => {

    if(!res){
      router.navigateByUrl("/login-register");
    }

    return true;
  });
}

export const canActivateChild: CanActivateChildFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => AuthGuard(route, state);