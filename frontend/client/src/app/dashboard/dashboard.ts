import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../auth/auth';
import { Profile } from '../auth/service/profile';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  user: any;
  editMode = false;
  editUser: any = {};

  constructor(
    private auth: Auth,
    private router: Router,
    private profile: Profile,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.profile.getProfile().subscribe({
      next: (data: any) => {
        this.user = data;
        this.editUser = { ...data };
        this.cd.detectChanges();
      },
      error: (err) => {},
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  updateProfile() {
    this.profile.updateProfile(this.editUser).subscribe({
      next: (res: any) => {
        this.user = res;
        this.editMode = false;
        alert('Profile Updated');
      },
      error: (err) => {
        console.log(err);
        alert('Update Gagal');
      },
    });
  }
}
