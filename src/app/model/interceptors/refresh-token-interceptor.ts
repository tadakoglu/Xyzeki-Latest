import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { switchMap, take, filter } from 'rxjs/operators';
import { XyzekiAuthHelpersService } from '../auth-services/xyzeki-auth-helpers-service';
import { XyzekiAuthService } from '../auth-services/xyzeki-auth-service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private refreshTokenInProgress = false;
    private refreshTokenSubject: Subject<any> = new BehaviorSubject<any>(null);

    constructor(public authService: AuthService, public xyzekiAuthService: XyzekiAuthService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (request.url.indexOf('refresh') !== -1) { // refresh token isteklerine bir şey iliştirmeden(token vb.) aynen ilet.
            return next.handle(request);
        }
        else if (request.url.indexOf('login') !== -1) // login isteklerine bir şey iliştirmeden(token vb.) aynen ilet
        {
            return next.handle(request);
        }
        else if (request.url.indexOf('register') !== -1) // register isteklerine bir şey iliştirmeden(token vb.) aynen ilet
        {
            return next.handle(request);
        }
        //...(şifremi unuttum vb. eklenecek)

        const accessExpired = this.xyzekiAuthService.isAccessTokenExpired();
        const refreshExpired = this.xyzekiAuthService.isRefreshTokenExpired();

        if (accessExpired && refreshExpired) { // normal token ve refresh token her ikisininn süresi bittiyse herhangi bir şey yapma aynen ilet
            return next.handle(request);        // ya da log out olup observable error fırlatılabilir.
        }
        if (accessExpired && !refreshExpired) { // normal token süresi bitti ancak REFRESH tokeninki bitmediyse
            if (!this.refreshTokenInProgress) {
                this.refreshTokenInProgress = true;
                this.refreshTokenSubject.next(null);
                return this.authService.requestAccessToken().pipe(
                    switchMap((authResponse) => {
                        this.authService.saveToken(AuthService.TOKEN_NAME, authResponse.accessToken);
                        this.authService.saveToken(AuthService.REFRESH_TOKEN_NAME, authResponse.refreshToken);
                        this.refreshTokenInProgress = false;
                        this.refreshTokenSubject.next(authResponse.accessToken);
                        return next.handle(this.injectToken(request));
                    }),
                );
            } else {
                return this.refreshTokenSubject.pipe(
                    filter(result => result !== null),
                    take(1),
                    switchMap((accessToken) => {
                        return next.handle(this.injectToken(request))
                    })
                );
            }
        }

        if (!accessExpired) { // normal tokenin süresi bitmediyse onu isteğe iliştir.
            return next.handle(this.injectToken(request));
        }
    }

    injectToken(request: HttpRequest<any>) {
        const token = this.xyzekiAuthService.Token
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

}


