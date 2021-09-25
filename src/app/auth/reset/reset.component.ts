import { Component, OnDestroy,  OnInit } from '@angular/core';
import {FormGroup, FormControl, Validators, FormGroupDirective} from '@angular/forms';
import { Subscription } from "rxjs";
import {  Router } from "@angular/router";
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../auth.service';
import { ErrorComponent } from '../../error/error.component';
@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent implements OnInit, OnDestroy {
hide0=true;
hide=true;
hide1=true;
userIsAuthenticated = false;
userId="";
private authListenerSubs: Subscription;
private authStatusSub:Subscription;
  constructor(private authService: AuthService,private dialog:MatDialog, private router:Router) { }

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    //console.log("this.authService.getIsAuth()");
    //console.log(this.authService.getIsAuth())
    // this.authStatusSub = this.authService
    //   .getAuthStatusListener()
    //   .subscribe(authStatus => {
    //     //console.log("authStatus")
    //     //console.log(authStatus)
    //   });
     //console.log("this.authService.getUserId()");
    //console.log(this.authService.getUserId());
    this.userId=this.authService.getUserId();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
		this.userId=this.authService.getUserId();
    // //console.log("isAuthenticated");
    // //console.log(isAuthenticated);
    // //console.log("this.authService.getUserId()");
    //     //console.log(this.authService.getUserId());

      });
  }
 form = new FormGroup(
    {
      oldPassword:new FormControl('', {validators: [Validators.required]}),
      password: new FormControl('', {validators:[Validators.required,Validators.minLength(4)]}),
      confirm: new FormControl('',{validators: [Validators.required,Validators.minLength(4)]}),
    },
    passwordMatchValidator
  );

  passwordErrorMatcher = {
    isErrorState: (control: FormControl, form: FormGroupDirective): boolean => {
      const controlInvalid = control.touched && control.invalid;
      const formInvalid = control.touched && this.form.get('confirm').touched && this.form.invalid;
      return controlInvalid || formInvalid;
    }
  }

  confirmErrorMatcher = {
    isErrorState: (control: FormControl, form: FormGroupDirective): boolean => {
      const controlInvalid = control.touched && control.invalid;
      const formInvalid = control.touched && this.form.get('password').touched && this.form.invalid;
      return controlInvalid || formInvalid;
    }
  }

  getErrorMessage(controlName: string) {
    if (this.form.controls[controlName].hasError('minlength')) {
      return 'Must be at least 4 characters'
    }

    return 'Passwords must match'
  }

  onSubmitResetPassword(){

    if((this.form.value.oldPassword==this.form.value.newPassword)||(this.form.value.oldPassword==this.form.value.confirm)){

this.dialog.open(ErrorComponent,{data:{message: "Old Password and New Password are same. Kindly update it."}})
 
    }

    if(this.form.invalid){
      return;
    }
    
    let data:any={
      userId:this.userId,
      oldPassword:this.form.value.oldPassword,
      newPassword:this.form.value.password,
      confirmNewPassword:this.form.value.confirm
    }
    //console.log(this.form.value)
    //console.log(data);
   this.authService.resetPassword(data);
  }

onCancel() {
    //console.log("cancelled");
    this.router.navigate(["/orders/all"]);
    // this.orderForm.reset();
  }


  ngOnDestroy(){
    this.authListenerSubs.unsubscribe();
  }
}

function passwordMatchValidator(g: FormGroup) {
  const password = g.get('password').value;
  const confirm = g.get('confirm').value
  return password === confirm ? null : { mismatch: true };
}