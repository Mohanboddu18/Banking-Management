import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as string[] | undefined;

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  const hasRequiredRole = authService.hasAnyRole(expectedRoles);
  if (hasRequiredRole) {
    return true;
  }

  // Redirect to appropriate home page based on user type
  if (authService.isCustomer()) {
    router.navigate(['/customer/dashboard']);
  } else if (authService.isManager()) {
    router.navigate(['/manager/dashboard']);
  } else if (authService.isEmployee()) {
    router.navigate(['/employee/dashboard']);
  } else {
    router.navigate(['/auth/login']);
  }

  return false;
};
