import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Invoice } from "../../Invoices/invoice.model";
import { InvoicesService } from "../../Invoices/invoices.service";
import { Order } from "../../Orders/order.model";
import { OrdersService } from "../../Orders/orders.service";
import { UrlService } from "../../shared/url.service";
import { Shop } from "../../shop/shop.model";
import { ShopService } from "../../shop/shop.service";

@Component({
  selector: "app-invoice-view",
  templateUrl: "./invoice-view.component.html",
  styleUrls: ["./invoice-view.component.css"]
})
export class InvoiceViewComponent implements OnInit, OnDestroy {
  invoiceId = null;
  orderId = null;
  editMode = false;
  isLoading = false;
  postsPerPage = 1; //current page
  currentPage = 1;
  invoice: Invoice;
  order: Order = {
    _id: null,
    billNo: "",
    clientName: "",
    clientPhoneNo: "",
    clientAddress: "",
    clientGSTIN: "",
    isInvoiceCreated: false,
    relatedInvoiceId: "",
    totalCost: 0,
    totalProfit: 0,
    paymentType: "Cash",
    amountPaid: 0,
    purchasedDate: "",
    lastUpdatedDate: "",
    businessType: "",
    businessType_copy: "",
    transaction: "",
    listOfItems: [],
    creator: ""
  };
  shop: Shop = {
    _id: null,
    shopName: "",
    shopAddress: "",
    shopGSTIN: "",
    shopPhoneNo: "",
    shopEmail: "",
    shopConditions: "",
    creator: ""
  };
  shopAddress = [];
  shopConditions = [];
  totalCost_Val = 0;
  totalCost_order = 0;
  SGST_invoice = 0;
  CGST_invoice = 0;
  IGST_invoice = 0;
  SGST_Val = 0;
  CGST_Val = 0;
  IGST_Val = 0;
  totalCostApprox = 0;
  invoiceNo_value = "";
  data = null;
  data1 = null;
  private shopSub: Subscription;

  constructor(
    private urlService: UrlService,
    private invoicesService: InvoicesService,
    private ordersService: OrdersService,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    public shopService: ShopService
  ) {}

  ngOnInit() {
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      //  this.prev_URl = previousUrl;
      //console.log("previous url: ", previousUrl);
    });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("invoiceId")) {
        this.editMode = true;
        this.invoiceId = paramMap.get("invoiceId");
        this.isLoading = true;
        this.shopService.getShops(this.postsPerPage, this.currentPage);
        this.shopSub = this.shopService
          .getShopUpdateListener()
          .subscribe((shopData: { shops: Shop[]; shopCount: number }) => {
            this.isLoading = false;
            if (shopData.shops.length > 0) {
              this.shop = shopData.shops[0];
              this.shopAddress = shopData.shops[0].shopAddress.split("\n");

              // for(let i=0;i<this.shopAddress.length;i++ ){
              //   if(i==this.shopAddress.length-1){
              //     this.shopAddress[i]=this.shopAddress[i].trim()+"."
              //   }else{
              //     this.shopAddress[i]=this.shopAddress[i].trim()+","
              //   }

              // }
              if (shopData.shops[0].shopConditions != null) {
                this.shopConditions = shopData.shops[0].shopConditions.split(
                  "\n"
                );
              }
            }

            //this.totalPosts=shopData.shopCount;
            // //console.log(this.shops);
          });
        this.invoicesService
          .getInvoice(this.invoiceId)
          .subscribe(invoiceData => {
            this.isLoading = false;
            //console.log(invoiceData);
            const transformedInvoiceData: any = invoiceData;
            this.invoice = transformedInvoiceData;
            this.orderId = this.invoice.orderId;

            if (this.invoice) {
              this.SGST_invoice = this.invoice.SGST;
              this.CGST_invoice = this.invoice.CGST;
              this.IGST_invoice = this.invoice.IGST;
            }
            if (this.invoice.orderBillNo != "") {
              this.invoiceNo_value = this.invoice.orderBillNo.substring(
                this.invoice.orderBillNo.search("-") + 1
              );
            }
            //console.log(this.invoice);
            if (this.orderId != null) {
              this.ordersService.getOrder(this.orderId).subscribe(orderData => {
                let transformedOrderData: any = orderData;
                this.order = transformedOrderData;
                if (this.order) {
                   this.totalCost_order=Number((this.order.totalCost / (1+((this.SGST_invoice+this.CGST_invoice+this.IGST_invoice)/100))).toFixed(2));
                  this.SGST_Val = Number(
                    (this.totalCost_order *(this.SGST_invoice/100)).toFixed(
                      2
                    )
                  );
                  this.CGST_Val = 
                  Number(
                    ((this.CGST_invoice * this.totalCost_order) / 100).toFixed(
                      2
                    )
                  );
                  this.IGST_Val = Number(
                    ((this.IGST_invoice * this.totalCost_order) / 100).toFixed(
                      2
                    )
                  );
                }
                //console.log(this.order);
                this.data1 = JSON.stringify(this.order);
              });
            }
            this.data = JSON.stringify(this.invoice);
          });
      }
      //console.log(this.invoice);
    });
  }
  onCancel() {
    //console.log("cancelled");
    this.router.navigate(["/invoices/all"]);
    // this.orderForm.reset();
  }
  getTotalCost() {
    this.totalCost_Val = Number(
      (
        this.totalCost_order +
        this.SGST_Val +
        this.CGST_Val +
        this.IGST_Val
      ).toFixed(2)
    );

    return this.totalCost_Val;
  }
  getTotalCostApprox() {
    // let totalCostApprox=0;
    // if(this.totalCost_Val!=0){
    //   totalCostApprox=Math.round(this.totalCost_Val);
    // }
    return Math.round(this.totalCost_Val);
  }
  numberInWords(num) {
    let a = [
      "",
      "one ",
      "two ",
      "three ",
      "four ",
      "five ",
      "six ",
      "seven ",
      "eight ",
      "nine ",
      "ten ",
      "eleven ",
      "twelve ",
      "thirteen ",
      "fourteen ",
      "fifteen ",
      "sixteen ",
      "seventeen ",
      "eighteen ",
      "nineteen "
    ];
    let b = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety"
    ];
    if ((num = num.toString()).length > 9) return "overflow";
    let n: any = ("000000000" + num)
      .substr(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    var str = "";
    str +=
      n[1] != 0
        ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "crore "
        : "";
    str +=
      n[2] != 0
        ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "lakh "
        : "";
    str +=
      n[3] != 0
        ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "thousand "
        : "";
    str +=
      n[4] != 0
        ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "hundred "
        : "";
    str +=
      n[5] != 0
        ? (str != "" ? "and " : "") +
          (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) +
          "only "
        : "";
    return str;
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
printPage() {
    window.print();
  }
  print() {
    let printContents, popupWin;
    printContents = document.getElementById("print-section").innerHTML;
    popupWin = window.open("", "_blank", "top=0,left=0,height=100%,width=auto");
    popupWin.document.open();

    popupWin.document.write(`
      <html>
        <head>
        <title>INVOICE</title>
          <style>
          body{  width: 99%;}
          table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  /* border: 1px solid #ddd; */
}

 .rowStyle {
border: 1px solid black;
  text-align: center;
  padding: 8px;
}
            
:host {
  display: block;
  margin-top: 1rem;
}

.info-text {
  text-align: center;
}

mat-spinner {
  margin: auto;
}


mat-grid-tile {
  /* background: lightblue; */
  border: 1px solid rgba(0, 0, 0, 0.8); 
}


.myheaderStyle{
 background-color:#404040;
 color:white;
 font-weight: bold;

}

.grid-container {
  display: grid;
  grid-template-columns: auto auto auto;
  /*background-color: #2196F3;*/
  padding: 10px;margin-top:-40px;margin-bottom: -40px;
}
.grid-item {
  /* background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.8); */
  padding: 20px;
  /*font-size: 30px;*/
  text-align: center;
}

strong{
  color:#404040;
}
.grid-container-1 {
  display: grid;
  grid-template-columns: auto;
  /*background-color: #2196F3;*/
  padding: 10px;margin-top:-40px;margin-bottom: -40px;
}
.grid-container-2 {
  display: grid;
  grid-template-columns: auto auto;
  /*background-color: #2196F3;*/
  padding: 10px;margin-top:-40px;margin-bottom: -40px;
}
.grid-container-3 {
  display: grid;
  grid-template-columns: auto auto auto;
  /*background-color: #2196F3;*/
  padding: 10px;margin-top:-40px;margin-bottom: -40px;
}
.grid-container-4 {
  display: grid;
  grid-template-columns: auto auto auto auto;
  /*background-color: #2196F3;*/
  padding: 10px;margin-top:-40px;margin-bottom: -40px;
}
.grid-item-center {
  /* background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.8); */
  padding: 20px;
  /*font-size: 30px;*/
  text-align: center;
}
.grid-item-left {
 /* background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.8); */
  padding: 20px;
  /*font-size: 30px;*/
  text-align: left;
}
.grid-item-right {
 /* background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.8); */
  padding: 20px;
  /*font-size: 30px;*/
  text-align: right;
}
          </style>
        </head>
    <body onload="window.print()">${printContents}</body>
      </html>`);
    popupWin.document.close();
  }

  ngOnDestroy() {
    this.shopSub.unsubscribe();
  }
}
