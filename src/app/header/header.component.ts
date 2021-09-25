import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  userEmail:string="";
  breakpoint: number;
  private authListenerSubs: Subscription;
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.breakpoint = 1;
    this.breakpoint = window.innerWidth <= 900 ? 1 : 4;

    this.userIsAuthenticated = this.authService.getIsAuth();

     if (this.userIsAuthenticated) {
      this.authService
        .getUser(this.authService.getUserId())
        .subscribe(userEmailData => {
          this.userEmail = userEmailData.userEmail;
          // this.userEmail=this.userEmail.substring(0,this.userEmail.search("@"))
        });
    }
    
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        if(this.userIsAuthenticated && this.authService.getUserId()!=""){
  this.authService.getUser(this.authService.getUserId())
            .subscribe(userEmailData=>{
              this.userEmail=userEmailData.userEmail;
              // this.userEmail=this.userEmail.substring(0,this.userEmail.search("@"))
            });
  }
      });
  }
  onLogout() {
    this.authService.logout();
  }
  onResize(event) {
    this.breakpoint = 1;
    if (event.target.innerWidth >= 900) {
      this.breakpoint = 4;
    }
    // this.breakpoint = event.target.innerWidth >= 650 ? 5 : 1;
    // console.log("event.target.innerWidth");
    // console.log(event.target.innerWidth);
    // console.log("this.breakpoint");
    // console.log(this.breakpoint);
  }
  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }
}
