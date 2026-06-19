import { Routes } from '@angular/router';

import { AuthLayout } from "./auth/auth-layout/auth-layout";
import { Login } from "./auth/login/login";
import { Register } from "./auth/register/register";
import { Dashboard } from "./dashboard/dashboard";
import { authGuard } from "./guards/auth-guard";

export const routes: Routes = [
    {path:'', component:AuthLayout,
        children: [
            {path:'', component:Login},
        ]
    },
    {path:'register', component:Register},
    {path:'dashboard', component:Dashboard, canActivate:[authGuard]},
];
