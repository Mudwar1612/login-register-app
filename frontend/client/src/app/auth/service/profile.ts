import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private api = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get(this.api + 'profile/');
  }

  updateProfile(data: any) {
    return this.http.put(this.api + 'profile/', data);
  }
}
