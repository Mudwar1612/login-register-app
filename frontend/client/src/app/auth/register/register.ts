import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from "@angular/common";
import { RouterLink } from "@angular/router";


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
  loading=false;
  errorMessage='';

  constructor(private auth:Auth, private cd:ChangeDetectorRef){}
  
  next(){
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
      !this.username ||
      !this.email ||
      !this.password
    ){
      this.errorMessage =
      'Semua data wajib diisi';
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
        alert('Register berhasil');

        this.username='';
        this.email='';
        this.password='';
        this.cd.detectChanges();
      },

      error:(err)=>{
        this.loading=false;
        this.errorMessage = 'Register gagal';
      }
    });
  }
}
