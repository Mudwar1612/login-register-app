import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { Auth } from "../auth/auth";

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})

export class Admin {
  constructor(private auth: Auth, private router: Router) {}

  ngOnInit(): void {
  }

  logout() {}
}
