import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { catchError, take } from 'rxjs/operators';
import { empty, Observable } from 'rxjs';
import { ContainersService } from '../services/containers.service';


@Injectable()
export class ContainersResolverService implements Resolve<any> {
  constructor(private service: ContainersService) { }
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.service.showContainers().pipe(catchError((error) => {
      return empty();
    }), take(1))
  }
}
