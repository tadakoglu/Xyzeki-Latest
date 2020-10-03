import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';


export class ResponseInterceptor implements HttpInterceptor {
    constructor(public xyzekiAuthService: XyzekiAuthService, public router: Router) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const started = Date.now();
        return next.handle(req).pipe(
            tap(event => {
                if (event instanceof HttpResponse) {
                    // do stuff with response if you want
                    const elapsed = Date.now() - started;
                    console.log(`Request for ${req.urlWithParams} took ${elapsed} ms.`);
                }
            }, (err: any) => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status === 401) {
                        // request token for second time
                       
                        this.router.navigate(['/login'])
                        // redirect to the login route
                        // or show a modal
                    }
                }
            })
        )
    }
}