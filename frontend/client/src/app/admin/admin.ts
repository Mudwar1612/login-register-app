import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Profile } from '../auth/service/profile';
import { Router } from '@angular/router';
import { Auth } from '../auth/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  sidebarOpen = false;
  showEditModal = false;
  showDeleteModal = false;
  showDeleteOTPModal = false;
  showMessage = false;
  showSuspendMenu = false;

  activeMenu = 'dashboard';
  message = '';

  search = '';
  user: any;
  users: any[] = [];

  selectedUsers: number[] = [];
  selectedUser: any = {};
  latestUsers: any[] = [];
  editData = { username: '', email: '', role: '', password: '' };

  searchOtp = '';
  selectedOTP: number[] = [];
  filteredOTP: any[] = [];
  latestOTP: any[] = [];
  otpList: any[] = [];

  totalUsers = 0;
  activeUsers = 0;
  suspendUsers = 0;
  totalOTP = 0;
  activeOTP = 0;
  usedOTP = 0;

  constructor(
    private auth: Auth,
    private router: Router,
    private profile: Profile,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadUsers();
    this.loadOtp();
  }

  get filteredUsers() {
    return this.users.filter(
      (u: any) =>
        u.username.toLowerCase().includes(this.search.toLowerCase()) ||
        u.email.toLowerCase().includes(this.search.toLowerCase()),
    );
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.cdr.detectChanges();
  }

  changeMenu(menu: string) {
    this.activeMenu = menu;
    if (menu === 'users') {
      this.loadUsers();
    }
    if (menu === 'otp') {
      this.loadOtp();
    }
  }

  loadProfile() {
    this.profile.getProfile().subscribe({
      next: (res: any) => {
        this.user = res;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  loadUsers() {
    this.auth.getUsers().subscribe({
      next: (res: any) => {
        this.users = res;
        this.latestUsers = [...this.users].sort((a: any, b: any) => b.id - a.id).slice(0, 5);
        this.totalUsers = this.users.length;
        this.activeUsers = this.users.filter((user: any) => user.status === 'Active').length;
        this.suspendUsers = this.users.filter((user: any) => user.status === 'Suspended').length;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  toggleUser(id: number) {
    if (this.selectedUsers.includes(id)) {
      this.selectedUsers = this.selectedUsers.filter((x) => x !== id);
    } else {
      this.selectedUsers.push(id);
    }
  }

  selectAll(event: any) {
    if (event.target.checked) {
      this.selectedUsers = this.users.map((u: any) => u.id);
    } else {
      this.selectedUsers = [];
    }
  }

  openEditModal() {
    if (this.selectedUsers.length != 1) {
      return;
    }
    const id = this.selectedUsers[0];
    this.selectedUser = this.users.find((u: any) => u.id === id);
    this.editData = {
      username: this.selectedUser.username,
      email: this.selectedUser.email,
      role: this.selectedUser.role,
      password: '',
    };
    this.showEditModal = true;
  }

  saveUser() {
    this.auth.updateUser(this.selectedUser.id, this.editData).subscribe({
      next: (res: any) => {
        this.showEditModal = false;
        this.loadUsers();
        this.selectedUsers = [];
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  suspend(days: number) {
    this.auth.suspendUsers(this.selectedUsers, days).subscribe({
      next: (res: any) => {
        this.loadUsers();
        this.selectedUsers = [];
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  toggleSuspendMenu() {
    this.showSuspendMenu = !this.showSuspendMenu;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  deleteUsers() {
    this.auth.deleteUsers(this.selectedUsers).subscribe({
      next: (res: any) => {
        this.closeDeleteModal();
        this.selectedUsers = [];
        this.loadUsers();
        this.message = res.message || 'User berhasil dihapus.';
        this.showMessage = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.showMessage = false;
          this.message = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: any) => {
        console.log(err);
        this.message = 'Gagal menghapus user.';
        this.showMessage = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.showMessage = false;
          this.message = '';
          this.cdr.detectChanges();
        }, 3000);
      },
    });
  }

  openDeleteModal() {
    if (this.selectedUsers.length == 0) {
      return;
    }
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  loadOtp() {
    this.auth.getOtp().subscribe({
      next: (res: any) => {
        this.otpList = res;
        this.filteredOTP = res;
        this.totalOTP = this.otpList.length;
        this.latestOTP = [...this.otpList].sort((a: any, b: any) => b.id - a.id).slice(0, 5);
        this.activeOTP = this.otpList.filter((item: any) => !item.is_used).length;
        this.usedOTP = this.otpList.filter((item: any) => item.is_used).length;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  searchOTPData() {
    if (this.searchOtp.trim() == '') {
      this.filteredOTP = this.otpList;
      return;
    }
    const keywoard = this.searchOtp.toLowerCase();
    this.filteredOTP = this.otpList.filter(
      (item: any) => item.email.toLowerCase().includes(keywoard) || item.otp.includes(keywoard),
    );
  }

  toggleOTP(id: number, event: any) {
    if (event.target.checked) {
      if (!this.selectedOTP.includes(id)) {
        this.selectedOTP.push(id);
      }
    } else {
      this.selectedOTP = this.selectedOTP.filter((item) => item !== id);
    }
  }

  toggleAllOTP(event: any) {
    if (event.target.checked) {
      this.selectedOTP = this.filteredOTP.map((item: any) => item.id);
    } else {
      this.selectedOTP = [];
    }
  }

  openDeleteOTPModal() {
    if (this.selectedOTP.length === 0) {
      this.message = 'Pilih OTP terlebih dahulu.';
      this.showMessage = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.showMessage = false;
        this.message = '';
        this.cdr.detectChanges();
      }, 3000);
      return;
    }
    this.showDeleteOTPModal = true;
  }

  closeDeleteOTPModal() {
    this.showDeleteOTPModal = false;
  }

  deleteOTP() {
    this.auth.deleteOTP(this.selectedOTP).subscribe({
      next: (res: any) => {
        this.showDeleteOTPModal = false;
        this.selectedOTP = [];
        this.loadOtp();
        this.message = res.message || 'OTP berhasil dihapus.';
        this.showMessage = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.showMessage = false;
          this.message = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err: any) => {
        console.error(err);
        this.showDeleteOTPModal = false;
        this.message = 'Gagal menghapus OTP.';
        this.showMessage = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.showMessage = false;
          this.message = '';
          this.cdr.detectChanges();
        }, 3000);
      },
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
