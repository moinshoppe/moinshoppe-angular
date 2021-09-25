import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
// import { AuthRoutingModule } from './auth-routing.module';
import { RouterModule } from '@angular/router';

import { SignupComponent } from "./signup/signup.component";
import { LoginComponent } from "./login/login.component";
import { AuthService } from "./auth.service";
import { ResetComponent } from './reset/reset.component';


@NgModule({
    declarations :[
		SignupComponent,
		LoginComponent,
		ResetComponent
    
      ],
      imports:[
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule
      ],
      providers:[
        AuthService
      ]
  })
export class AuthModule { }