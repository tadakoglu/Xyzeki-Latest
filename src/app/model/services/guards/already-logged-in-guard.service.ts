import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { XyzekiAuthService } from '../../auth-services/xyzeki-auth-service';


@Injectable()
export class AlreadyLoggedInGuardService implements CanActivate {
  constructor(private router: Router, public xyzekiAuthService: XyzekiAuthService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.xyzekiAuthService.LoggedIn) {
      this.router.navigateByUrl('/isler');
      return false;
    }
    else {
      return true;
    }
  }
}
