import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription, Observable } from "rxjs";
import { FormControl, FormGroup } from "@angular/forms";
import { PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import { UrlService } from "../../shared/url.service";
import { OrdersService } from "../orders.service";
import { Order } from "../order.model";
import { Customer } from "../../customers/customer.model";
import { ActivatedRoute, Router } from "@angular/router";
import { InvoicesService } from "../../Invoices/invoices.service";
import { AuthService } from "../../auth/auth.service";
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-orders-list",
  templateUrl: "./orders-list.component.html",
  styleUrls: ["./orders-list.component.css"]
})
export class OrdersListComponent implements OnInit, OnDestroy {
  previousUrl: Observable<string> = this.urlService.previousUrl$;
  userId: string;
  prev_URl = "";
  isLoading = false;
  isInvoiceCreated_Value = false;
  orders = [];
  totalPosts = 0; //total no of posts
  postsPerPage = 5; //current page
  currentPage = 1;
  pageSizeOptions = [5, 10, 20];
  private orderSub: Subscription;
  userIsAuthenticated = false;
  private authStatusSub: Subscription;
  searchText_Value = "";
  searchType_Value = "All";
  form: FormGroup;
  customer: Customer = {
    _id: null,
    customerName: "",
    customerPhoneNo: "",
    customerAddress: "",
    customerEmail: "",
    customerGSTIN: "",
    creator: ""
  };
  private userSub: Subscription;
  users: any[] = [];

  constructor(
    private ordersService: OrdersService,
    private activatedRoute: ActivatedRoute,
    private urlService: UrlService,
    private invoicesService: InvoicesService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  OnOrderAdd(order: Order) {
    this.invoicesService.setOrderInfo(order);
    if (order.relatedInvoiceId != null && order.relatedInvoiceId != "") {
      this.router.navigate(["/invoices/edit/" + order.relatedInvoiceId]);
    } else {
      this.router.navigate(["/invoices/new"]);
    }

    //check whether is Inovice created true -> view/edit or new invoice
  }

  onAddOrder_route() {
    this.router.navigate(["/orders/new"]);
  }

  ngOnInit() {
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      this.prev_URl = previousUrl;
      //console.log("ORDERS LIST previous url: ", previousUrl);
    });

    //this.orders=this.ordersService.get_Orders();
    //above line to be commented
    // this.isLoading = true;

    this.ordersService.getCustomerInfo().subscribe(customerInfo => {
      this.customer = customerInfo;
      // //console.log(this.customer);
    });
    let searchTextValue = "";
    let searchTypeValue = "All";

    if (
      this.customer.customerPhoneNo != "" &&
      this.prev_URl == "/customers/all"
    ) {
      searchTextValue = this.customer.customerPhoneNo;
      this.searchText_Value = this.customer.customerPhoneNo;
    }

    this.form = new FormGroup({
      searchText: new FormControl(searchTextValue),
      searchType: new FormControl(searchTypeValue)
    });

    // if (this.customer.customerName != "") {
    //   this.ordersService.getOrdersWithFilters(
    //     this.postsPerPage,
    //     this.currentPage,
    //     searchTextValue,
    //     searchTypeValue
    //   );
    //   this.ordersService.getOrdersWithFilters(
    //     this.postsPerPage,
    //     this.currentPage,
    //     searchTextValue,
    //     searchTypeValue
    //   );
    //   this.orderSub = this.ordersService
    //     .getOrderUpdateListener()
    //     .subscribe((orderData: { orders: Order[]; orderCount: number }) => {
    //       this.isLoading = false;
    //       this.orders = orderData.orders;
    //       this.totalPosts = orderData.orderCount;
    //       //console.log("using customer name");
    //       //console.log(this.orders);
    //     });
    // } else {
    this.ordersService.getOrders(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.orderSub = this.ordersService
      .getOrderUpdateListener()
      .subscribe((orderData: { orders: Order[]; orderCount: number }) => {
        this.isLoading = false;
        this.orders = orderData.orders;
        this.totalPosts = orderData.orderCount;
        // //console.log(this.orders);
      });
    // }

    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
    this.authService.getUsers();
    this.userSub = this.authService
      .getUserUpdateListener()
      .subscribe(userData => {
        this.users = userData.users;
        //console.log(this.users);
      });
  }
  getUserEmail(userId: string) {
    let result = "";
    if (userId != "") {
      if (this.users.length > 0) {
        for (let i = 0; i < this.users.length; i++) {
          if (this.users[i]._id == userId) {
            result = this.users[i].email;
            break;
          }
        }
      }
    }
    return result;
  }
  onSearchOrder() {
    //console.log(this.form.value);
    let searchText = "";
    let searchType = "";
    this.totalPosts = 0;
    this.postsPerPage = 5; //current page
    this.currentPage = 1;
    if (this.form.value.searchText != null) {
      searchText = this.form.value.searchText;
    }
    if (this.form.value.searchType != "All") {
      searchType = this.form.value.searchType;
    }
    this.searchText_Value = searchText;
    this.searchType_Value = this.form.value.searchType;
    //console.log(searchText);
    //console.log(searchType);
    // if(searchText!="" || searchType!=""){

    //   //console.log("calling function")
    // }
    this.ordersService.getOrdersWithFilters(
      this.postsPerPage,
      this.currentPage,
      searchText,
      searchType
    );
    this.orderSub = this.ordersService
      .getOrderUpdateListener()
      .subscribe((orderData: { orders: Order[]; orderCount: number }) => {
        this.isLoading = false;
        this.orders = orderData.orders;
        this.totalPosts = orderData.orderCount;
        //console.log(this.orders);
      });
  }
  onChangedPage(pageData: PageEvent) {
    //console.log("*** chekcing pageData");
    //console.log(pageData);
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;

    if (this.searchText_Value != "" || this.searchType_Value != "All") {
      this.ordersService.getOrdersWithFilters(
        this.postsPerPage,
        this.currentPage,
        this.searchText_Value,
        this.searchType_Value
      );
    } else {
      this.ordersService.getOrders(this.postsPerPage, this.currentPage);
    }
  }

  OnDelete(orderId: string, relatedInvoiceId: string) {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Confirm Remove Order",
        message: "Are you sure, you want to remove an order: "
      }
    });
    confirmDialog.afterClosed().subscribe(result => {
      console.log(result);
      if (result === true) {
        this.isLoading = true;
    //console.log(orderId);
    //console.log(relatedInvoiceId);
    this.ordersService.deleteOrder(orderId).subscribe(
      () => {
        this.ordersService.getOrders(this.postsPerPage, this.currentPage);

        if (relatedInvoiceId != null && relatedInvoiceId != "") {
          this.invoicesService.deleteInvoice(relatedInvoiceId).subscribe(
            () => {
              this.invoicesService.getInvoices(
                this.postsPerPage,
                this.currentPage
              );
            },
            () => {
              //this.isLoading=false;
              //console.log("on Delete -> order deleting invoice");
            }
          );
        }
      },
      () => {
        this.isLoading = false;
      }
    );
      }
    });
    
  }

  dateConverter(date: string) {
    let result = "";
    let actualDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    if (date != null) {
      actualDate = new Date(date);
    }

    result = actualDate.toString().substring(0, 15);

    return result;
  }

  ngOnDestroy() {
    this.orderSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    this.userSub.unsubscribe();
  }
}
