import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from "@angular/common";
import { RouterLink, Router} from "@angular/router";


import { Auth } from '../auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, NgClass, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  step=1;
  username='';
  email='';
  password='';
  showPassword = false;
  loading=false;
  errorMessage='';

  constructor(private auth:Auth, private cd:ChangeDetectorRef, private router:Router, private zone:NgZone){}
  
  next(){

    this.errorMessage = '';

    if(this.step === 1){
      if (!this.email) {
        this.errorMessage = 'Email wajib diisi';
        return;
      }
    }

    if(this.step === 2){
      if(!this.username){
        this.errorMessage = 'Username wajib diisi';
        return;
      }
    }

    if (this.step === 3){
      if (!this.password){
        this.errorMessage = 'Password wajib diisi';
        return;
      }
    }

    if(this.step < 3){
      this.step++;
    }
  }

  back(){
    if(this.step > 1){
      this.step--;
    }
  }
  
  register(){
    if(
      !this.password
    ){
      this.errorMessage =
      'Password wajib diisi';
      return;
    }

    this.loading=true;
    this.errorMessage = '';
    const data={
      username:this.username,
      email:this.email,
      password:this.password
    };

    this.auth.register(data)
    .subscribe({
      next:(res)=>{
        this.loading=false;
        alert('Register berhasil, Silahkan login!');

        this.username='';
        this.email='';
        this.password='';
        this.step=1;
        this.cd.detectChanges();
        this.zone.run(() => {
          this.router.navigate(['/']);
        });
      },

      error:(err)=>{
        this.loading=false;
        this.errorMessage = 'Register gagal';
      }
    });
  }
}
