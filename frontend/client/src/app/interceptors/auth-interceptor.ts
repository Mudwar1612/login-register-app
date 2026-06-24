import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access');
  let request = req;
  if (token) {
    request = req.clone({
      setHeaders: {Authorization: `Bearer ${token}`}
    });
  }

  return next(request).pipe(
    catchError(error => {
      if (error.status===401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/';
      }
      return throwError( () => error);
    })
  );
};
