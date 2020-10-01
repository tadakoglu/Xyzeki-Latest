import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { XyzekiAuthService } from '../xyzeki-auth-service';
import { Observable } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(public xyzekiAuthService: XyzekiAuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        request = request.clone({
            setHeaders: { Authorization: `Bearer ${this.xyzekiAuthService.Token}` }
        });

        return next.handle(request);
    }
}