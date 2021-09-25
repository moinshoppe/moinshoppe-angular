import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription, Observable } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { UrlService } from "./../shared/url.service";
import { ShopService } from "./shop.service";
import { Shop } from "./shop.model";
import { AuthService } from "./../auth/auth.service";

@Component({
  selector: "app-shop",
  templateUrl: "./shop.component.html",
  styleUrls: ["./shop.component.css"]
})
export class ShopComponent implements OnInit, OnDestroy {
  previousUrl: Observable<string> = this.urlService.previousUrl$;

  userId: string;
  isLoading = false;
  shops = [];
  totalPosts = 0; //total no of posts
  postsPerPage = 1; //current page
  currentPage = 1;
  pageSizeOptions = [1, 5, 10];
  shopAddress = [];
  shopConditions = [];
  private shopSub: Subscription;
  userIsAuthenticated = false;
  private authStatusSub: Subscription;
private userSub: Subscription;
users:any[]=[];

  constructor(
    private shopService: ShopService,
    private urlService: UrlService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      //console.log("previous url: ", previousUrl);
    });

    // this.isLoading = true;
    this.shopService.getShops(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.shopSub = this.shopService
      .getShopUpdateListener()
      .subscribe((shopData: { shops: Shop[]; shopCount: number }) => {
        this.isLoading = false;
        if (shopData.shops.length > 0) {
          this.shops = [shopData.shops[0]];
          this.shopAddress = shopData.shops[0].shopAddress.split("\n");
          let ar = [];
          for (let i = 0; i < this.shopAddress.length; i++) {
            if (i == this.shopAddress.length - 1) {
              this.shopAddress[i] = this.shopAddress[i].trim() + ".";
            } else {
              this.shopAddress[i] = this.shopAddress[i].trim() + ",";
            }
          }
          if(shopData.shops[0].shopConditions!=null){
            this.shopConditions = shopData.shops[0].shopConditions.split("\n");
          }
        } else {
          this.shops = shopData.shops;
        }

        this.totalPosts = shopData.shopCount;
        // //console.log(this.shops);
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
this.authService.getUsers();
this.userSub = this.authService.getUserUpdateListener()
.subscribe((userData) => {
  this.users = userData.users;
  //console.log(this.users);
});

  }
  getUserEmail(userId:string){
	let result="";
	if(userId!=""){
    if(this.users.length>0){
      for(let i=0;i<this.users.length;i++){
        if(this.users[i]._id==userId){
          result=this.users[i].email;
          break;
        }
      }
    }
	}
  return result;
}

  onChangedPage(pageData: PageEvent) {
    //console.log(pageData);
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.shopService.getShops(this.postsPerPage, this.currentPage);
  }

  OnDelete(shopId: string) {
    this.isLoading = true;
    this.shopService.deleteShop(shopId).subscribe(
      () => {
        this.shopService.getShops(this.postsPerPage, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy() {
    this.shopSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    this.userSub.unsubscribe();
  }
}
