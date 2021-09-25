import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription,Observable } from "rxjs";
import { FormControl, FormGroup } from "@angular/forms";
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from "@angular/material/dialog";
import { UrlService } from "../../shared/url.service";
import { ItemsService } from "../items.service";
import { Item } from "../item.model";
import { Router } from "@angular/router";
import { AuthService } from '../../auth/auth.service';
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-items-list",
  templateUrl: "./items-list.component.html",
  styleUrls: ["./items-list.component.css"]
})
export class ItemsListComponent implements OnInit, OnDestroy {
  previousUrl: Observable<string> = this.urlService.previousUrl$;
  userId:string;
 form: FormGroup;
searchText_Value=""
  isLoading = false;
  items = [];
  totalPosts=0; //total no of posts
  postsPerPage=10; //current page
  currentPage=1;
  pageSizeOptions=[10,15,20]
  private itemSub: Subscription;
  userIsAuthenticated=false;
  private authStatusSub:Subscription;
  private userSub: Subscription;
  users:any[]=[];

  constructor(private itemsService: ItemsService,private urlService: UrlService, private router:Router, private authService:AuthService,private dialog: MatDialog) {}

  ngOnInit() {
    
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      //console.log('previous url: ', previousUrl);
    });

this.form = new FormGroup({
      searchText: new FormControl(this.searchText_Value)
    });
    
    // this.isLoading = true;
    this.itemsService.getItems(this.postsPerPage, this.currentPage);
    this.userId=this.authService.getUserId();
    this.itemSub = this.itemsService
      .getItemUpdateListener()
      .subscribe((itemData:{items:Item[], itemCount:number}) => {
        this.isLoading = false;
        this.items = itemData.items;
        this.totalPosts=itemData.itemCount;
        // //console.log(this.items);
      });

    this.userIsAuthenticated=this.authService.getIsAuth();
        this.authStatusSub=this.authService.getAuthStatusListener()
                              .subscribe(isAuthenticated=>{
                                this.userIsAuthenticated=isAuthenticated;
                                this.userId=this.authService.getUserId();
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
  onAddItem(){
     this.router.navigate(["/items/new"]);
  }
  onSearchItem() {
    //console.log(this.form.value);
    let searchText = "";
   
    this.totalPosts = 0;
    this.postsPerPage = 5; //current page
    this.currentPage = 1;
    if (this.form.value.searchText != null) {
      searchText = this.form.value.searchText;
    }
    
    this.searchText_Value = searchText;
    
    //console.log(searchText);
    
    this.itemsService.getItemsWithFilters(
      this.postsPerPage,
      this.currentPage,
      searchText
    );
    this.itemSub = this.itemsService
      .getItemUpdateListener()
      .subscribe((itemData: { items: Item[]; itemCount: number }) => {
        this.isLoading = false;
        this.items = itemData.items;
        this.totalPosts = itemData.itemCount;
        //console.log(this.items);
      });
  }

  onChangedPage(pageData: PageEvent){
    //console.log(pageData)
    this.isLoading=true;
    this.currentPage=pageData.pageIndex+1;
    this.postsPerPage=pageData.pageSize;
    this.itemsService.getItems(this.postsPerPage, this.currentPage)
  }

  OnDelete(itemId: string,itemName:string) {
     const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Confirm Remove Item",
        message: "Are you sure, you want to remove an item: "+itemName
      }
    });
    confirmDialog.afterClosed().subscribe(result => {
      console.log(result);
      if (result === true) {
        
        this.isLoading=true;
    this.itemsService.deleteItem(itemId)
                      .subscribe(()=>{
                    this.itemsService.getItems(this.postsPerPage, this.currentPage)
                  },()=>{
                      this.isLoading=false;
                    });;
      }
    });
    
  }

  ngOnDestroy() {
    this.itemSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    this.userSub.unsubscribe();
  }
}
