import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from "@angular/router";

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})

export class AuthLayout {
  selectedLanguage = 'English (United States)';

  languages = ['English (United States)', 'Indonesia', 'Japanese'];

  dropdownOpen = false;

  changeLanguage (lang:string) {
    this.selectedLanguage = lang;
    this.dropdownOpen = false;
  }
}
