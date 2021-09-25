import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription,Observable } from "rxjs";
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from "@angular/material/dialog";
import { UrlService } from "../../shared/url.service";
import { InvoicesService } from "../invoices.service";
import { Invoice } from "../invoice.model";
import { OrdersService } from "../../Orders/orders.service";
import { Order } from "../../Orders/order.model";
import { AuthService } from '../../auth/auth.service';
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-invoices-list",
  templateUrl: "./invoices-list.component.html",
  styleUrls: ["./invoices-list.component.css"]
})
export class InvoicesListComponent implements OnInit, OnDestroy {
  previousUrl: Observable<string> = this.urlService.previousUrl$;
userId:string;

  isLoading = false;
  invoices = [];
  totalPosts=0; //total no of posts
  postsPerPage=10; //current page
  currentPage=1;
  pageSizeOptions=[10,15,20]
  private invoiceSub: Subscription;
  userIsAuthenticated=false;
  private authStatusSub:Subscription;
  private userSub: Subscription;
  users:any[]=[];
  
  constructor(private invoicesService: InvoicesService,private urlService: UrlService, private ordersService:OrdersService, private authService:AuthService,private dialog: MatDialog) {}

  ngOnInit() {
    
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      //console.log('previous url: ', previousUrl);
    });

    // this.isLoading = true;
    //console.log("invoices list ooninit")
    this.invoicesService.getInvoices(this.postsPerPage, this.currentPage);
    //console.log(this.postsPerPage+", "+this.currentPage);
    this.userId=this.authService.getUserId();
    this.invoiceSub = this.invoicesService
      .getInvoiceUpdateListener()
      .subscribe((invoiceData:{invoices:Invoice[], invoiceCount:number}) => {
        this.isLoading = false;
        this.invoices = invoiceData.invoices;
        this.totalPosts=invoiceData.invoiceCount;
        //console.log(this.invoices);
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
  onChangedPage(pageData: PageEvent){
    //console.log(pageData)
    this.isLoading=true;
    this.currentPage=pageData.pageIndex+1;
    this.postsPerPage=pageData.pageSize;
    this.invoicesService.getInvoices(this.postsPerPage, this.currentPage)
  }
  dateConverter(date: string) {
    let result = "";
    let actualDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    if (date != null) {
      actualDate = new Date(date);
    }

    result = actualDate.toString().substring(0, 15);

    return result;
  }


  OnDelete(invoiceId: string, orderId:string,invoiceNo:string) {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Confirm Remove Invoice",
        message: "Are you sure, you want to remove an invoice: "+invoiceNo
      }
    });
    confirmDialog.afterClosed().subscribe(result => {
      console.log(result);
      if (result === true) {
        this.isLoading=true;
    this.invoicesService.deleteInvoice(invoiceId)
                      .subscribe(()=>{
                    this.invoicesService.getInvoices(this.postsPerPage, this.currentPage)
                    this.ordersService.getOrder(orderId).subscribe(orderData => {
      let orderToBeUpdated:any=orderData;
      orderToBeUpdated.isInvoiceCreated=false;
      orderToBeUpdated.relatedInvoiceId=null;
      //console.log("invoice list delete item");
      //console.log(orderToBeUpdated)
      this.ordersService.updateOrder(orderToBeUpdated);
    })
                  },()=>{
                      this.isLoading=false;
                    });
      }
    });
    
    
  }

  ngOnDestroy() {
    this.invoiceSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    this.userSub.unsubscribe();
  }
}
