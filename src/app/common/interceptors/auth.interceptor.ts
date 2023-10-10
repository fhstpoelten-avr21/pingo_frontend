import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, from, map, of, switchMap, throwError } from "rxjs";
import { StorageService } from "src/app/services/storage/storage.service";

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {

    constructor(private storageService: StorageService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return from(this.storageService.getData('token')).pipe(
            switchMap(token => {
                //Authentication by setting header with token value
                if (token) {
                    request = request.clone({
                        setHeaders: {
                            'Authorization': token
                        }
                    });
                }

                return next.handle(request).pipe(
                    map((event: HttpEvent<any>) => {
                        if (event instanceof HttpResponse) {
                            // console.log('event--->>>', event);
                        }
                        return event;
                    }),
                    catchError((error, event) => {
                        return throwError(() => error);
                    }));
            })
        )
    }


}