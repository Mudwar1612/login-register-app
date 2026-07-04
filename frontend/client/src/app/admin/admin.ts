import { Component, OnInit } from '@angular/core';
import { Profile } from "../auth/service/profile";
import { Router } from "@angular/router";
import { Auth } from "../auth/auth";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})

export class Admin {
  sidebarOpen = false;
  showEditModal = false;
  activeMenu = 'dashboard';
  user: any;
  users: any[] = [];
  search = '';
  selectedUsers: number[] = [];
  selectedUser: any = {};
  editData = {username:'', email:'', role:'', password:''};
  showSuspendMenu = false;
  otpList: any[] = [];

  constructor(private auth: Auth, private router: Router, private profile: Profile) {}

  get filteredUsers() {
    return this.users.filter((u: any) =>
      u.username
      .toLowerCase()
      .includes(this.search.toLowerCase())

      ||

      u.email
      .toLowerCase()
      .includes(this.search.toLowerCase())
    );
  }

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

  toggleUser(id: number) {
    if (this.selectedUsers.includes(id)) {
      this.selectedUsers = this.selectedUsers.filter(
        x => x !== id
      );
    } else {
      this.selectedUsers.push(id);
    }
    console.log(this.selectedUsers);
  }

  selectAll(event: any) {
    if (event.target.checked) {
      this.selectedUsers = this.users.map(
        (u: any) => u.id
      );
    } else {
      this.selectedUsers = [];
    }
    console.log(this.selectedUsers);
  }

  openEditModal() {
    if (this.selectedUsers.length !=1) {
      alert("Pilih tepat 1 user.");
      return;
    }
    const id = this.selectedUsers[0];
    this.selectedUser = this.users.find(
      (u:any) => u.id===id
    );
    this.editData = {
      username:this.selectedUser.username,
      email:this.selectedUser.email,
      role:this.selectedUser.role,
      password:''
    };
    this.showEditModal = true;
  }

  saveUser() {
    this.auth.updateUser(

      this.selectedUser.id,

      this.editData

    ).subscribe({

        next:(res:any)=>{

            alert(res.message);

            this.showEditModal=false;

            this.loadUsers();

            this.selectedUsers=[];

        },

        error:(err:any)=>{

            console.log(err);

        }

    });
  }

  suspend(days:number){
    this.auth.suspendUsers(
      this.selectedUsers,
      days
    ).subscribe({
      next:(res:any)=>{
        alert(res.message);
        this.loadUsers();
        this.selectedUsers=[];
      },
        error:(err:any)=>{
        console.log(err);
      }
    });
  }

  toggleSuspendMenu() {
    this.showSuspendMenu = !this.showSuspendMenu;
  }

  closeEditModal() {
    this.showEditModal = false;
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
