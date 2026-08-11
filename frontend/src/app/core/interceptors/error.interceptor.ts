import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error) {
        if (typeof error.error === 'string') {
          try {
            const parsed = JSON.parse(error.error);
            errorMessage = parsed.message || errorMessage;
          } catch {
            errorMessage = error.error;
          }
        } else if (error.error.validationErrors && Object.keys(error.error.validationErrors).length > 0) {
          const firstKey = Object.keys(error.error.validationErrors)[0];
          errorMessage = error.error.validationErrors[firstKey];
        } else if (error.error.message) {
          errorMessage = error.error.message;
        }
      }

      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        toastService.error('Session expired. Please log in again.');
        authService.logout();
      } else if (error.status === 403) {
        toastService.error('Access Denied: You do not have permission for this action.');
      } else if (error.status >= 400 && error.status < 500) {
        toastService.error(errorMessage);
      } else if (error.status >= 500) {
        toastService.error('Internal Server Error: ' + errorMessage);
      }

      return throwError(() => error);
    })
  );
};
