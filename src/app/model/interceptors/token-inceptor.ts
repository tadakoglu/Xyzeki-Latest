import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(public xyzekiAuthService: XyzekiAuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        request = request.clone({
            setHeaders: { Authorization: `Bearer ${this.xyzekiAuthService.AccessToken}` }
        });

        return next.handle(request);
    }
}