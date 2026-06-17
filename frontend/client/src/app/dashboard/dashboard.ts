import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from "@angular/router";
import { Auth } from "../auth/auth";
import { Profile } from "../auth/service/profile";

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{
  user:any;

  constructor(private auth:Auth, private router:Router, private profile:Profile, private cd:ChangeDetectorRef){}

  ngOnInit(){
    this.profile.getProfile()
    .subscribe({
      next:(data:any)=>{
        this.user=data;
        this.cd.detectChanges();
      },
      error:(err)=>{
      }
    });
  }

  logout(){
    this.auth.logout();
    this.router.navigate([
      '/'
    ]);
  }
}
