import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { XyzekiAuthHelpersService } from '../../auth-services/xyzeki-auth-helpers-service';
import { XyzekiAuthService } from '../../auth-services/xyzeki-auth-service';


@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, public xyzekiAuthService: XyzekiAuthService, public xyzekiAuthHelpersService: XyzekiAuthHelpersService) {



  }
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
