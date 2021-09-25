import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Subject} from 'rxjs';
import { AuthData } from './auth-data.model';
import { Router } from '@angular/router';
import {map} from 'rxjs/operators';
import {environment} from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/users";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated=false;
  private token;
  private tokenTimer:any;
  private userId:string;
  private userEmail:string;
  private authStatusListener = new Subject<boolean>();
  private users: User[] = [];
  private usersUpdated = new Subject<{users:User[],userCount:number}>();

  constructor(private httpClient:HttpClient, private router:Router) { 

  }

  getToken(){
    return this.token;
  }

  getIsAuth(){
    return this.isAuthenticated;
  }

  getUserId(){
    return this.userId;
  }
  getUserEmail(){
    // if(this.userId!=null){
    //   return this.userEmail;
    // }
    //console.log("email")
    //console.log(this.userId)
    //console.log(this.userEmail)
    return this.userEmail;
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  createUser(email:string, password:string){
    const authData:AuthData={email:email, password:password}
    this.httpClient.post(BACKEND_URL+"/signup", authData)
                    .subscribe(()=>{
                      this.router.navigate(['/']);
                    }, error => {
                      this.authStatusListener.next(false);
                    });
  }
  loginUser(email:string, password:string){
    const authData:AuthData={email:email, password:password}
    this.httpClient.post<{token:string, expiresIn: number, userId: string}>(BACKEND_URL+"/login", authData)
                    .subscribe(response=>{
                      // //console.log(response);
                      const token = response.token;
                      this.token=token;
                      if(token){
                        const expiresInDuration = response.expiresIn;
                        //console.log(expiresInDuration)
                        this.setAuthTimer(expiresInDuration);
                        this.isAuthenticated=true;
                        this.userId =response.userId;
                        this.userEmail=email;
                        this.authStatusListener.next(true);
                        const now= new Date();
                        const expirationDate= new Date(now.getTime()+expiresInDuration*1000);
                        //console.log(expirationDate);
                        this.saveAuthData(token, expirationDate, this.userId);
                        this.router.navigate(['/']);
                      }
                    }, error => {
                      this.authStatusListener.next(false);
                    });
  }
   resetPassword(data:any){
 this.httpClient.put(BACKEND_URL+"/reset", data)
                    .subscribe(()=>{
					//console.log("Password Updated");
                      //this.logout();
                      this.router.navigate(['/']);
                    }, error => {
                      this.authStatusListener.next(false);
                      this.logout();
                    });
				}
  getUsers(){
    this.httpClient
      .get<{ message: string; users: User[] ,maxUsers:number}>(BACKEND_URL)
       .pipe(map((userData)=>{
            return { 
              users: userData.users,
              maxUsers:userData.maxUsers
            };
          }))
      .subscribe(postData => {
        this.users = postData.users;
        
        //console.log(postData);
        this.usersUpdated.next({
                                    users:[...this.users],
                                    userCount: postData.maxUsers
                                  });
        
      });
  }
  getUserUpdateListener() {
    return this.usersUpdated.asObservable();
  }
getUser(id: string) {
    //console.log(id);

    return this.httpClient.get<{userEmail:string}>(BACKEND_URL+"/email/" + id);
  }
  autoAuthUser(){
    const authInformation = this.getAuthData();
    if(!authInformation){
      return;
    }
    const now=new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if(expiresIn>0){
      this.token=authInformation.token;
      this.isAuthenticated=true;
      this.userId=authInformation.userId;
      this.setAuthTimer(expiresIn/1000);
      this.authStatusListener.next(true);
    }
  }

  logout(){
    this.token=null;
    this.isAuthenticated=false;
    this.authStatusListener.next(false);
    this.userId=null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private setAuthTimer(duration:number){
    //console.log("setting Timer: "+duration);
    this.tokenTimer = setTimeout(()=>{
      this.logout();
    }, duration*1000);
  }

  private saveAuthData(token:string, expirationDate:Date, userId:string){
    localStorage.setItem('token',token);
    localStorage.setItem('expiration',expirationDate.toISOString());
    localStorage.setItem('userId',userId);
  }

  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData(){
    const token=localStorage.getItem("token");
    const expirationDate=localStorage.getItem("expiration");
    const userId=localStorage.getItem("userId");

    if(!token || !expirationDate){
      return;
    }
    return {
      token:token,
      expirationDate: new Date(expirationDate),
      userId:userId
    }
  }

}
export interface User{
    email:string;
}