import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable} from 'rxjs';


@Injectable()
export class XyzekiTimeInterceptor implements HttpInterceptor {

    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(this.injectBrowserTime(request));
    }

    injectBrowserTime(request: HttpRequest<any>) { // Via headers
        let browser_time = new Date().toISOString()
        return request.clone(
            {
                setHeaders: {
                    Xyzeki_Browser_Time: browser_time
                }

            }
        )
    }
    // injectBrowserTime(request: HttpRequest<any>) { // Via params
    //     let browser_time = new Date().toISOString()
    //     return request.clone(
    //         {
    //             setParams: {
    //                 Xyzeki_Browser_Time: browser_time
    //             }

    //         }
    //     )

    // }
   

}


