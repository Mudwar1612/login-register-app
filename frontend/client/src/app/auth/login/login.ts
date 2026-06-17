import { Component } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { Auth } from '../auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username= '';
  password= '';
  loading=false;
  errorMessage='';

  constructor(private auth:Auth, private router:Router){}

  login(){
    if(!this.username || !this.password){
      this.errorMessage = 'Username dan Password wajib diisi';
      return;
    }

    this.loading=true;
    this.errorMessage='';

    const data={
      username:this.username,
      password:this.password
    };

    console.log('KIRIM DATA:', data);

    this.auth.login(data)

    .subscribe({
        next:(res:any)=>{
        this.auth.saveToken(res.access);
        console.log('SUCCESS:', res);
        this.loading=false;
        this.router.navigate(['/dashboard']);
      },

      error:(err)=>{
        console.log('STATUS:', err.status);
        console.log('BODY:', err.error);
        
        this.loading=false;
        this.errorMessage = err.error?.detail || 'Username atau Password salah';
      },

      complete:()=> {
        this.loading=false;
      },
    });
  }
}
