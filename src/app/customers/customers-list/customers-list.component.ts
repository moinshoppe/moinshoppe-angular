import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription,Observable } from "rxjs";
import { PageEvent } from '@angular/material/paginator';
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { UrlService } from "../../shared/url.service";
import { CustomersService } from "../customers.service";
import { Customer } from "../customer.model";
import { OrdersService } from "../../Orders/orders.service";
import { AuthService } from '../../auth/auth.service';
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-customers-list",
  templateUrl: "./customers-list.component.html",
  styleUrls: ["./customers-list.component.css"]
})
export class CustomersListComponent implements OnInit, OnDestroy {
  userId:string;
  isLoading = false;
  customers = [];
  totalPosts=0; //total no of posts
  postsPerPage=10; //current page
  currentPage=1;
  pageSizeOptions=[10,15,20]
  private customerSub: Subscription;
  userIsAuthenticated=false;
  private authStatusSub:Subscription;
  searchText_Value="";
  form:FormGroup;
  private userSub: Subscription;
users:any[]=[];


  constructor(private customersService: CustomersService, private ordersService:OrdersService, private router:Router, private urlService: UrlService, private authService:AuthService,private dialog: MatDialog ) {}

  ngOnInit() {
     this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      //console.log('previous url: ', previousUrl);
    });
    
    // this.isLoading = true;
    this.customersService.getCustomers(this.postsPerPage, this.currentPage);
    this.userId=this.authService.getUserId();
    this.customerSub = this.customersService
      .getCustomerUpdateListener()
      .subscribe((customerData:{customers:Customer[], customerCount:number}) => {
        this.isLoading = false;
        this.customers = customerData.customers;
        this.totalPosts=customerData.customerCount;
        // //console.log(this.customers);
      });

      this.form = new FormGroup({
      searchText: new FormControl(this.searchText_Value)
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

  onAddCustomer(){
     this.router.navigate(["/customers/new"]);
  }

onSearchCustomer() {
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
    
    this.customersService.getCustomersWithFilters(
      this.postsPerPage,
      this.currentPage,
      searchText
    );
    this.customerSub = this.customersService
      .getCustomerUpdateListener()
      .subscribe((customerData: { customers: Customer[]; customerCount: number }) => {
        this.isLoading = false;
        this.customers = customerData.customers;
        this.totalPosts = customerData.customerCount;
        //console.log(this.customers);
      });
  }

  onChangedPage(pageData: PageEvent){
    //console.log(pageData)
    this.isLoading=true;
    this.currentPage=pageData.pageIndex+1;
    this.postsPerPage=pageData.pageSize;
    this.customersService.getCustomers(this.postsPerPage, this.currentPage)
  }

  OnDelete(customerId: string,customerName:string) {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Confirm Remove Customer",
        message: "Are you sure, you want to remove a customer: "+customerName
      }
    });
    confirmDialog.afterClosed().subscribe(result => {
      console.log(result);
      if (result === true) {
        this.isLoading=true;
        this.customersService.deleteCustomer(customerId)
                      .subscribe(()=>{
                    this.customersService.getCustomers(this.postsPerPage, this.currentPage)
                  },()=>{
                      this.isLoading=false;
                    });
      }
    });
    
  }

  OnOrderAdd(customer:Customer){
    this.ordersService.setCustomerInfo(customer);
     this.router.navigate(["/orders/new"]);
  }

  OnSelectCustomersOrderList(customer:Customer){
    this.ordersService.setCustomerInfo(customer);
     this.router.navigate(["/orders/all"]);
  }

  ngOnDestroy() {
    this.customerSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    this.userSub.unsubscribe();
  }
}
