import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { XyzekiAuthService } from '../../xyzeki-auth-service';


@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, public xyzekiAuthService: XyzekiAuthService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.xyzekiAuthService.LoggedIn) {
      return true;
    }
    else {
      this.router.navigateByUrl('/giris');
      return false;
    }
  }
}
