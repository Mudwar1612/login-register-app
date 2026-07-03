import { Component, OnInit } from '@angular/core';
import { Profile } from "../auth/service/profile";
import { Router } from "@angular/router";
import { Auth } from "../auth/auth";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})

export class Admin {
  sidebarOpen = false;
  activeMenu = 'dashboard';
  user: any;
  users: any[] = [];
  otpList: any[] = [];

  constructor(private auth: Auth, private router: Router, private profile: Profile) {}


  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  changeMenu(menu: string) {
    console.log("MENU DIKLIK:", menu);
    this.activeMenu = menu;
    if (menu === 'users') {
      this.loadUsers();
    }
    if (menu === 'otp') {
     this.loadOtp(); 
    }
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profile.getProfile().subscribe({
      next:(res:any) => {
        this.user = res;
        console.log(this.user);
      },
      error:(err:any) => {
        console.log(err);
      }
    });
  }

  loadUsers() {
    this.auth.getUsers().subscribe({
      next: (res: any) => {
        this.users = res;
        console.log("DATA USER :", this.users);
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  loadOtp() {
    this.auth.getOtp().subscribe({
      next:(res:any) => {
        this.otpList = res;
        console.log(this.otpList);
      },
      error:(err:any) => {
        console.log(err);
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate( ['/'] );
  }
}
