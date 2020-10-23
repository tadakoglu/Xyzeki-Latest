
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { XyzekiAuthHelpersService } from '../../auth-services/xyzeki-auth-helpers-service';
import { XyzekiAuthService } from '../../auth-services/xyzeki-auth-service';
import { DataService } from '../shared/data.service';


@Injectable()
export class LoadToMemoryService implements CanActivate {
  constructor(private dataService: DataService,private router: Router, public xyzekiAuthService: XyzekiAuthService, public xyzekiAuthHelpersService: XyzekiAuthHelpersService) {

    if (this.dataService.loadCredidentalsToMemoryTry == 0) { // only for the first time when app loads.
      this.dataService.loadCredidentalsToMemoryTry++;
      this.xyzekiAuthHelpersService.LoadCredidentalsToMemory();
    }

  }
 
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return true;
  }
}
