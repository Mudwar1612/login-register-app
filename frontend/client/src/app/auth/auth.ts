import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private api = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(this.api + 'register/', data);
  }

  sendOtp(email: string) {
    return this.http.post(`${this.api}send-otp/`, { email: email });
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post(`${this.api}verify-otp/`, { email: email, otp: otp });
  }

  checkUsername(username: string) {
    return this.http.post(`${this.api}check-username/`, { username: username });
  }

  login(data: any) {
    return this.http.post(this.api + 'login/', data);
  }

  saveToken(token: string) {
    localStorage.setItem('access', token);
  }

  saveSession(res: any) {
    localStorage.setItem('access', res.access);
    localStorage.setItem('refresh', res.refresh);
    localStorage.setItem('role', res.role);
    localStorage.setItem('username', res.username);
    localStorage.setItem('email', res.email);
  }

  getToken() {
    return localStorage.getItem('access');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  refreshToken() {
    const refresh = localStorage.getItem('refresh');

    return this.http.post(this.api + 'token/refresh/', { refresh: refresh });
  }

  getUsers() {
    return this.http.get(this.api + 'admin/users/');
  }

  updateUser(id: number, data: any) {
    return this.http.put(this.api + 'admin/users/' + id + '/', data);
  }

  suspendUsers(ids: any, days: number) {
    return this.http.post(this.api + 'admin/users/suspend/', {
      users: ids,
      days: days,
    });
  }

  deleteUsers(ids: any) {
    return this.http.request('DELETE', this.api + 'admin/users/delete/', {
      body: {
        users: ids,
      },
    });
  }

  getOtp() {
    return this.http.get(this.api + 'admin/otp/');
  }

  deleteOTP(ids: any) {
    return this.http.delete(this.api + 'admin/otp/delete/', {
      body: {
        ids: ids,
      },
    });
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
  }
}
