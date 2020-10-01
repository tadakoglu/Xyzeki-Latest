import { Injectable } from '@angular/core';
import { CanActivate, Route, UrlSegment, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { XyzekiAuthService } from '../../xyzeki-auth-service';

@Injectable()
export class AuthGuardAdminService implements CanActivate {

  constructor(private router: Router, public xyzekiAuthService: XyzekiAuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.xyzekiAuthService.Username == 'tadakoglu') {
      return true;
    }
    else {
      this.router.navigateByUrl('/giris');
      return false;
    }
  }




}
