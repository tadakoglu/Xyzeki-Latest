import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { XyzekiAuthService } from  '../../auth-services/xyzeki-auth-service';
import { PrivateTalkMessage } from '../../private-talk-message.model';

@Injectable()
export class SaveLastSeenGuardService implements CanDeactivate<PrivateTalkMessage> {
  canDeactivate(
    component: PrivateTalkMessage,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
  /**
   *
   */
  constructor(public xyzekiAuthService : XyzekiAuthService ) {


  }
}

