import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const token = localStorage.getItem('access');
  const router = inject(Router);
  if (token) {
    return true;
  }
  router.navigate(['/']);
  return false;
};
