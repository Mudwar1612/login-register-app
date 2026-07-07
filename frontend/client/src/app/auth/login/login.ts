import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Auth } from '../auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private auth: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  login() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username dan Password wajib diisi';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const data = {
      username: this.username,
      password: this.password,
    };

    this.auth
      .login(data)

      .subscribe({
        next: (res: any) => {
          this.auth.saveSession(res);
          this.loading = false;
          this.cdr.detectChanges();
          if (res.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },

        error: (err: any) => {
          this.loading = false;
          this.errorMessage = err.error?.detail || 'Username atau Password salah';
          this.cdr.detectChanges();
        },

        complete: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
}
