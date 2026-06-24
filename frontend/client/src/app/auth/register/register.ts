import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from "@angular/common";
import { RouterLink, Router} from "@angular/router";
import { interval, Subscription } from 'rxjs';

import { Auth } from '../auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, NgClass, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})

export class Register {
  step = 1;
  username = '';
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';
  otp:string = '';
  otpSent = false;
  emailVerified = false;
  timer = 0;
  timerInterval: any;
  timerSubscription?: Subscription;


  constructor(private auth:Auth, private cd:ChangeDetectorRef, private router:Router, private zone:NgZone) {}
  
  sendOtp() {
    if (!this.email) {
      this.errorMessage = 'Email wajib diisi';
      return;
    }

    if (!this.email.includes('@')) {
      this.errorMessage = 'Format email tidak valid';
      return;
    }

    this.auth.sendOtp (this.email)
    .subscribe ( {
      next: (res) => {
        this.otpSent = true;
        this.errorMessage = '';
        this.startTimer();
      },

      error: (err) => {
        this.errorMessage = 'Gagal mengirim OTP';
      }
    });  
  }

  formatTimer() {
    const minutes = Math.floor (this.timer / 60);
    const seconds = this.timer % 60;
    return `${minutes}:${seconds < 10 ? '0': ''}${seconds}`;
  }

  startTimer() {
    this.timer = 180;
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = interval (1000)
    .subscribe( () => {
      this.timer--;
      this.cd.detectChanges();
      if (this.timer <= 0) {
        this.stopTimer();
        this.timerSubscription?.unsubscribe();
        this.otpSent = false;
        this.errorMessage = 'OTP sudah kadaluarsa, silahkan kirim ulang';
        this.cd.detectChanges();
      }
    });
  }

  stopTimer() {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = undefined;
    this.timer = 0;
  }

  next() {
    this.errorMessage = '';
    if (this.step === 1) {
      if (!this.email) {
        this.errorMessage = 'Email wajib diisi';
        return;
      }
      if (!this.otpSent) {
        this.sendOtp();
        return;
      }
      if (!this.otp) {
        this.errorMessage = 'Kode OTP wajib diisi';
        return;
      }
      if (this.otp.length !== 6) {
        this.errorMessage='OTP harus 6 digit';
        return;
      }
      this.auth.verifyOtp (
        this.email,
        this.otp
      )
      .subscribe ({
        next: (res) => {
          this.emailVerified = true;
          this.stopTimer();
          this.errorMessage = '';
          this.step = 2;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.errorMessage =
          err.error.message;
        }
      });
      return;
    }

    if (this.step === 2) {
      if (!this.username) {
        this.errorMessage = 'Username wajib diisi';
        return;
      }
      this.auth.checkUsername(this.username)
      .subscribe ( {
        next: (res) => {
          this.errorMessage = '';
          this.step = 3;
          this.cd.detectChanges();
        },

        error: (err) => {
          this.errorMessage = err.error.message || 'Username sudah ada';
          this.cd.detectChanges();
        }
      });
      return;
    }

    if (this.step === 3) {
      if (!this.password) {
        this.errorMessage = 'Password wajib diisi';
        return;
      }
      this.register();
      return;
    }
  }

  back() {
    this.errorMessage = '';
    if (this.step === 2) {
      this.step = 1;
      return;
    }

    if (this.step === 3) {
      this.step = 2;
      return;
    }
  }
  
  register() {
    if (!this.password) {
      this.errorMessage ='Password wajib diisi';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const data = {
      username:this.username,
      email:this.email,
      password:this.password
    };

    this.auth.register(data)
    .subscribe ( {
      next: (res) => {
        this.loading = false;
        alert('Register berhasil, Silahkan login!');
        this.username = '';
        this.email = '';
        this.password = '';
        this.step = 1;
        this.cd.detectChanges();
        this.zone.run ( () => {
          this.router.navigate(['/']);
        });
      },
      
      error: (err) => {
        this.loading=false;
        this.errorMessage = 'Register gagal';
      }
    });
  }
}