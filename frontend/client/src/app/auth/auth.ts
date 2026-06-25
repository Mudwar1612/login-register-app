import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})

export class Auth {
  private api ='http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient){}

  register(data:any) {
    return this.http.post(this.api + 'register/', data);
  }

  sendOtp(email:string) {
    return this.http.post(`${this.api}send-otp/`, {email: email} );
  }

  verifyOtp(email:string, otp:string) {
    return this.http.post(`${this.api}verify-otp/`, {email:email, otp:otp} );
  }

  checkUsername(username:string) {
    return this.http.post(`${this.api}check-username/`, {username:username} );
  }

  login(data:any) {
    return this.http.post(this.api + 'login/', data);
  }

  saveToken(token:string) {
    localStorage.setItem('access', token);
  }

  saveSession(res:any){
    localStorage.setItem('access', res.access);
    localStorage.setItem('refresh', res.refresh);
    localStorage.setItem('role', res.role);
    localStorage.setItem('username', res.username);
    localStorage.setItem('email', res.email);
  }

  getToken() {
    return localStorage.getItem('access');
  }

  getRole(){
    return localStorage.getItem('role');
  }

  refreshToken() {
    const refresh =localStorage.getItem('refresh');
    
    return this.http.post(this.api + 'token/refresh/', {refresh:refresh});
  }

  logout(){
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
  }

  getUsers(){
    return this.http.get(
    this.api + 'admin/users/'
    );
  }
}
