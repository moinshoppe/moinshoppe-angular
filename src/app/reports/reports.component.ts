import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { UrlService } from "../shared/url.service";
import { ErrorComponent } from "../error/error.component";
import { InvoicesService } from "../Invoices/invoices.service";
import { Invoice } from "../Invoices/invoice.model";
import { OrdersService } from "../Orders/orders.service";
import { Order } from "../Orders/order.model";
import { ExportExcelService } from "../shared/export-excel.service";
@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.css"]
})
export class ReportsComponent implements OnInit, OnDestroy {
  previousUrl: Observable<string> = this.urlService.previousUrl$;
  private authStatusSub: Subscription;
  private invoiceSub: Subscription;
  private orderSub: Subscription;
  totalPosts = 0; //total no of posts
  postsPerPage = 1000; //current page
  currentPage = 1;
  pageSizeOptions = [10, 15, 20];
  isLoading = false;
  form: FormGroup;

  invoices = [];
  invoices_copy = [];
  orders = [];
  orders_copy = [];

  dataForExcel = [];

  constructor(
    public activatedRoute: ActivatedRoute,
    private urlService: UrlService,
    private router: Router,
    private authService: AuthService,
    private invoicesService: InvoicesService,
    private ordersService: OrdersService,
    public exportExcelService: ExportExcelService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      ////console.log("previous url: ", previousUrl);
    });

    this.invoicesService.getInvoices(this.postsPerPage, this.currentPage);
    this.invoiceSub = this.invoicesService
      .getInvoiceUpdateListener()
      .subscribe(
        (invoiceData: { invoices: Invoice[]; invoiceCount: number }) => {
          this.isLoading = false;
          this.invoices = invoiceData.invoices;
          this.invoices_copy = invoiceData.invoices;
          for (var i = 0; i < this.invoices_copy.length; i++) {
            this.invoices_copy[i].invoiceDate = this.invoices_copy[
              i
            ].lastUpdatedDate;
          }
          // this.totalPosts=invoiceData.invoiceCount;

          // //console.log(this.invoices_copy);
        }
      );
    this.ordersService.getOrders(this.postsPerPage, this.currentPage);
    this.orderSub = this.ordersService
      .getOrderUpdateListener()
      .subscribe((orderData: { orders: Order[]; orderCount: number }) => {
        this.isLoading = false;
        this.orders = orderData.orders;
        this.orders_copy = orderData.orders;
        for (var i = 0; i < this.orders_copy.length; i++) {
          this.orders_copy[i]._id = this.orders_copy[i].relatedInvoiceId;
        }
        // this.totalPosts = orderData.orderCount;
        // //console.log(this.orders_copy);
      });

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      reportName: new FormControl(null, {
        validators: [Validators.required]
      })
    });
  }
  onCancel() {
    //////console.log("cancelled");
    this.router.navigate(["/"]);
    // this.orderForm.reset();
  }

  onSubmitReport() {
    this.isLoading = true;
    //console.log(this.form.value.reportName);
    if (this.form.value.reportName == "Invoices") {
      let Invoice_Order_Data = [];
      let Invoice_Order_Data_Result = [];
      let reqd_data = [
        "invoiceNo",
        "invoiceDate",
        "listOfItems",
        "HSNcode",
        "SGST",
        "CGST",
        "IGST",
        "amt",
        "eWayBillNo",
        "vehicleNo",
        "transporterName"
      ];
      //console.log(this.invoices_copy);
      //console.log(this.orders_copy);
      Invoice_Order_Data = this.joinObjectsArray(
        this.invoices_copy,
        this.orders_copy
      );
      if(Invoice_Order_Data.length>0){

        for (var i = 0; i < Invoice_Order_Data.length; i++) {
          let data = {};
          let tCost = 0;
          let tCostTax = 0;
          if (!Invoice_Order_Data_Result.includes(data)) {
            Invoice_Order_Data_Result.push(data);
          }
          Invoice_Order_Data_Result[i]["S_No"] = i + 1;
          for (var j = 0; j < reqd_data.length; j++) {
            var str_invoiceDesc = "";
            if (reqd_data[j] == "listOfItems") {
              str_invoiceDesc = "";
              for (
                var k = 0;
                k < Invoice_Order_Data[i][reqd_data[j]].length;
                k++
              ) {
                str_invoiceDesc =
                  str_invoiceDesc +
                  Invoice_Order_Data[i][reqd_data[j]][k]["itemName"] +
                  "\t=\t" +
                  Invoice_Order_Data[i][reqd_data[j]][k]["itemSellingPrice"] +
                  "\t*\t" +
                  Invoice_Order_Data[i][reqd_data[j]][k]["quantity"] +
                  "\t=\t" +
                  Invoice_Order_Data[i][reqd_data[j]][k]["spCost"] +
                  "\n";
                tCost = tCost + Invoice_Order_Data[i][reqd_data[j]][k]["spCost"];
              }
              Invoice_Order_Data_Result[i][
                "invoiceDescription(price * quantity)"
              ] = str_invoiceDesc;
            } else if (reqd_data[j] == "amt") {
              tCostTax =
                tCost /
                (1 +
                  (Invoice_Order_Data_Result[i]["SGST"] +
                    Invoice_Order_Data_Result[i]["CGST"] +
                    Invoice_Order_Data_Result[i]["IGST"]) /
                  100);
              Invoice_Order_Data_Result[i]["Amount"] = Number(
                tCostTax.toFixed(2)
              );
              Invoice_Order_Data_Result[i]["SGST_Amount"] = Number(
                ((tCostTax * Invoice_Order_Data_Result[i]["SGST"]) / 100).toFixed(
                  2
                )
              );
              Invoice_Order_Data_Result[i]["CGST_Amount"] = Number(
                ((tCostTax * Invoice_Order_Data_Result[i]["CGST"]) / 100).toFixed(
                  2
                )
              );
              Invoice_Order_Data_Result[i]["IGST_Amount"] = Number(
                ((tCostTax * Invoice_Order_Data_Result[i]["IGST"]) / 100).toFixed(
                  2
                )
              );
              Invoice_Order_Data_Result[i]["Total_Amount"] = Number(
                (
                  tCostTax +
                  Invoice_Order_Data_Result[i]["SGST_Amount"] +
                  Invoice_Order_Data_Result[i]["CGST_Amount"] +
                  Invoice_Order_Data_Result[i]["IGST_Amount"]
                ).toFixed(0)
              );
            } else {
              Invoice_Order_Data_Result[i][reqd_data[j]] =
                Invoice_Order_Data[i][reqd_data[j]];
            }
          }
        }
      }else{
        Invoice_Order_Data_Result=[{
          S_No:"NO DATA AVAILABLE",
          invoiceNo:"",
          invoiceDate:"",
        "invoiceDescription(price * quantity)":"",
        HSNcode:"",
        SGST:"",
        CGST:"",
        IGST:"",
        Amount:"",
        SGST_Amount:"",
        CGST_Amount:"",
        IGST_Amount:"",
        Total_Amount:"",
        eWayBillNo:"",
        vehicleNo:"",
        transporterName:""
        }]
      }
      //console.log(Invoice_Order_Data_Result);
      // this.excelService.exportAsExcelFile(Invoice_Order_Data_Result, "Invoice");
      this.dataForExcel = [];
      Invoice_Order_Data_Result.forEach((row: any) => {
        //console.log("row");
        //console.log(row);
        //console.log(Object.values(row));
        this.dataForExcel.push(Object.values(row));
      });
      //console.log("dataForExcel");
      //console.log(this.dataForExcel);
      let reportData = {
        title: "Invoice",
        data: this.dataForExcel,
        headers: Object.keys(Invoice_Order_Data_Result[0])
      };

      this.exportExcelService.exportExcel(reportData);
      // console.log(Invoice_Order_Data_Result);
    }
    if (this.form.value.reportName == "Non-GST-Bills") {
      let Non_GST_Bills = [];
      let Non_GST_Bills_Result = [];
      for (var i = 0; i < this.orders_copy.length; i++) {
        if (
          this.orders_copy[i].businessType == "Sell" &&
          !(this.orders_copy[i].relatedInvoiceId != "")
        ) {
          Non_GST_Bills.push(this.orders_copy[i]);
        }
      }
      let reqd_data = [
        "purchasedDate",
        "billNo",
        "clientName",
        "clientPhoneNo",
        "listOfItems",
        "totalCost",
        "amountPaid"
      ];
      if (Non_GST_Bills.length > 0) {
        for (var i = 0; i < Non_GST_Bills.length; i++) {
          let data = {};
          let tCost = 0;
          if (!Non_GST_Bills_Result.includes(data)) {
            Non_GST_Bills_Result.push(data);
          }
          Non_GST_Bills_Result[i]["S_No"] = i + 1;
          for (var j = 0; j < reqd_data.length; j++) {
            var str_invoiceDesc = "";
            if (reqd_data[j] == "listOfItems") {
              str_invoiceDesc = "";
              for (var k = 0; k < Non_GST_Bills[i][reqd_data[j]].length; k++) {
                str_invoiceDesc =
                  str_invoiceDesc +
                  Non_GST_Bills[i][reqd_data[j]][k]["itemName"] +
                  "\t=\t" +
                  Non_GST_Bills[i][reqd_data[j]][k]["itemSellingPrice"] +
                  "\t*\t" +
                  Non_GST_Bills[i][reqd_data[j]][k]["quantity"] +
                  "\t=\t" +
                  Non_GST_Bills[i][reqd_data[j]][k]["spCost"] +
                  "\n";
                tCost = tCost + Non_GST_Bills[i][reqd_data[j]][k]["spCost"];
              }
              Non_GST_Bills_Result[i][
                "invoiceDescription(price * quantity)"
              ] = str_invoiceDesc;
            } else {
              Non_GST_Bills_Result[i][reqd_data[j]] =
                Non_GST_Bills[i][reqd_data[j]];
            }
          }
        }
      } else {
        Non_GST_Bills_Result=[{
          S_No:"NO DATA AVAILABLE",
          purchasedDate:"",
          billNo:"",
          clientName:"",
          clientPhoneNo:"",
          "invoiceDescription(price * quantity)":"",
          totalCost:"",
          amountPaid:""

        }]
      }
      // this.excelService.exportAsExcelFile(
      //   Non_GST_Bills_Result,
      //   "Non-GST-Bills"
      // );
      //console.log(Non_GST_Bills_Result);
      this.dataForExcel = [];
      Non_GST_Bills_Result.forEach((row: any) => {
        //console.log("row");
        //console.log(row);
        //console.log(Object.values(row));
        this.dataForExcel.push(Object.values(row));
      });
      //console.log("dataForExcel");
      // console.log(Non_GST_Bills_Result);
      //console.log(this.dataForExcel);
      let reportData = {
        title: "Non-GST-Bills",
        data: this.dataForExcel,
        headers: Object.keys(Non_GST_Bills_Result[0])
      };

      this.exportExcelService.exportExcel(reportData);
    }
    if (this.form.value.reportName == "Purchase History") {
      let Purchase_History = [];
      let Purchase_History_Result = [];
      for (var i = 0; i < this.orders_copy.length; i++) {
        if (this.orders_copy[i].businessType == "Buy") {
          Purchase_History.push(this.orders_copy[i]);
        }
      }
      let reqd_data = [
        "purchasedDate",
        "billNo",
        "clientName",
        "clientPhoneNo",
        "listOfItems",
        "totalCost",
        "amountPaid"
      ];
      if(Purchase_History.length>0){

        for (var i = 0; i < Purchase_History.length; i++) {
          let data = {};
          let tCost = 0;
          if (!Purchase_History_Result.includes(data)) {
            Purchase_History_Result.push(data);
          }
          Purchase_History_Result[i]["S_No"] = i + 1;
          for (var j = 0; j < reqd_data.length; j++) {
            var str_invoiceDesc = "";
            if (reqd_data[j] == "listOfItems") {
              str_invoiceDesc = "";
              for (var k = 0; k < Purchase_History[i][reqd_data[j]].length; k++) {
                str_invoiceDesc =
                  str_invoiceDesc +
                  Purchase_History[i][reqd_data[j]][k]["itemName"] +
                  "\t=\t" +
                  Purchase_History[i][reqd_data[j]][k]["itemCostPrice"] +
                  "\t*\t" +
                  Purchase_History[i][reqd_data[j]][k]["quantity"] +
                  "\t=\t" +
                  Purchase_History[i][reqd_data[j]][k]["cpCost"] +
                  "\n";
                tCost = tCost + Purchase_History[i][reqd_data[j]][k]["cpCost"];
              }
              Purchase_History_Result[i][
                "invoiceDescription(price * quantity)"
              ] = str_invoiceDesc;
            } else {
              Purchase_History_Result[i][reqd_data[j]] =
                Purchase_History[i][reqd_data[j]];
            }
          }
        }
      }else{
        Purchase_History_Result=[{
          S_No:"NO DATA AVAILABLE",
          purchasedDate:"",
          billNo:"",
          clientName:"",
          clientPhoneNo:"",
        "invoiceDescription(price * quantity)":"",
        totalCost:"",
        amountPaid:""
        }]
      }
      //this.excelService.exportAsExcelFile(
      //   Purchase_History_Result,
      //   "Purchase-History"
      // );
      this.dataForExcel = [];
      Purchase_History_Result.forEach((row: any) => {
        //console.log("row");
        //console.log(row);
        //console.log(Object.values(row));
        this.dataForExcel.push(Object.values(row));
      });
      //console.log("dataForExcel");
      //console.log(this.dataForExcel);
      let reportData = {
        title: "Purchase History",
        data: this.dataForExcel,
        headers: Object.keys(Purchase_History_Result[0])
      };

      this.exportExcelService.exportExcel(reportData);
      // console.log(Purchase_History_Result);
    }
    if (this.form.value.reportName == "Advance/Balance Payment") {
      let AB_Payment = [];
      let AB_Payment_Result = [];
      for (var i = 0; i < this.orders_copy.length; i++) {
        if (this.orders_copy[i].totalCost != this.orders_copy[i].amountPaid) {
          AB_Payment.push(this.orders_copy[i]);
        }
      }
      let reqd_data = [
        "purchasedDate",
        "businessType",
        "relatedInvoiceId",
        "billNo",
        "clientName",
        "clientPhoneNo",
        "listOfItems",
        "totalCost",
        "amountPaid",
        "type"
      ];
      if(AB_Payment.length>0){

        for (var i = 0; i < AB_Payment.length; i++) {
          let data = {};
          let tCost = 0;
          if (!AB_Payment_Result.includes(data)) {
            AB_Payment_Result.push(data);
          }
          AB_Payment_Result[i]["S_No"] = i + 1;
          for (var j = 0; j < reqd_data.length; j++) {
            var str_invoiceDesc = "";
            if (reqd_data[j] == "listOfItems") {
              str_invoiceDesc = "";
              for (var k = 0; k < AB_Payment[i][reqd_data[j]].length; k++) {
                str_invoiceDesc =
                  str_invoiceDesc +
                  AB_Payment[i][reqd_data[j]][k]["itemName"] +
                  "\t=\t" +
                  AB_Payment[i][reqd_data[j]][k]["itemCostPrice"] +
                  "\t*\t" +
                  AB_Payment[i][reqd_data[j]][k]["quantity"] +
                  "\t=\t" +
                  AB_Payment[i][reqd_data[j]][k]["cpCost"] +
                  "\n";
                tCost = tCost + AB_Payment[i][reqd_data[j]][k]["cpCost"];
              }
              AB_Payment_Result[i][
                "invoiceDescription(price * quantity)"
              ] = str_invoiceDesc;
            } else if (reqd_data[j] == "relatedInvoiceId") {
              if (AB_Payment[i][reqd_data[j]] != "") {
                AB_Payment_Result[i]["Bill Type"] = "GST";
              } else {
                AB_Payment_Result[i]["Bill Type"] = "Non-GST";
              }
            } else if (reqd_data[j] == "type") {
              if (AB_Payment[i]["totalCost"] > AB_Payment[i]["amountPaid"]) {
                AB_Payment_Result[i]["Advance / Balance Amount"] =
                  AB_Payment[i]["totalCost"] - AB_Payment[i]["amountPaid"];
                AB_Payment_Result[i]["Advance / Balance Type"] = "Balance";
              } else {
                AB_Payment_Result[i]["Advance / Balance Amount"] =
                  AB_Payment[i]["amountPaid"] - AB_Payment[i]["totalCost"];
                AB_Payment_Result[i]["Advance / Balance Type"] = "Advance";
              }
            } else {
              AB_Payment_Result[i][reqd_data[j]] = AB_Payment[i][reqd_data[j]];
            }
          }
        }
      }else{
        AB_Payment_Result=[{
          S_No:"NO DATA AVAILABLE",
          purchasedDate:"",
          businessType:"",
          "Bill Type":"",
          billNo:"",
          clientName:"",
          clientPhoneNo:"",
          "invoiceDescription(price * quantity)":"",
          totalCost:"",
          amountPaid:"",
          "Advance / Balance Amount":"",
          "Advance / Balance Type":""
        }]
      }
      // this.excelService.exportAsExcelFile(
      //   AB_Payment_Result,
      //   "Advance-Balance-Payment"
      // );
      this.dataForExcel = [];
      AB_Payment_Result.forEach((row: any) => {
        //console.log("row");
        //console.log(row);
        //console.log(Object.values(row));
        this.dataForExcel.push(Object.values(row));
      });
      //console.log("dataForExcel");
      //console.log(this.dataForExcel);
      let reportData = {
        title: "Advance / Balance Payment",
        data: this.dataForExcel,
        headers: Object.keys(AB_Payment_Result[0])
      };

      this.exportExcelService.exportExcel(reportData);
      // console.log(AB_Payment_Result);
    }
    if (this.form.value.reportName == "Profit") {
      let Profit = [];
      let Profit_Result = [];
      for (var i = 0; i < this.orders_copy.length; i++) {
        if (this.orders_copy[i].businessType == "Sell") {
          Profit.push(this.orders_copy[i]);
        }
      }
      let reqd_data = [
        "purchasedDate",
        "relatedInvoiceId",
        "billNo",
        "clientName",
        "clientPhoneNo",
        "listOfItems",
        "totalCost",
        "amountPaid",
        "totalProfit",
        "obtainedProfit"
      ];
      if(Profit.length>0){

        for (var i = 0; i < Profit.length; i++) {
          let data = {};
          let tCost = 0;
          if (!Profit_Result.includes(data)) {
            Profit_Result.push(data);
          }
          Profit_Result[i]["S_No"] = i + 1;
          for (var j = 0; j < reqd_data.length; j++) {
            var str_invoiceDesc = "";
            if (reqd_data[j] == "listOfItems") {
              str_invoiceDesc = "";
              for (var k = 0; k < Profit[i][reqd_data[j]].length; k++) {
                str_invoiceDesc =
                  str_invoiceDesc +
                  Profit[i][reqd_data[j]][k]["itemName"] +
                  "\t=\t" +
                  Profit[i][reqd_data[j]][k]["itemCostPrice"] +
                  "\t*\t" +
                  Profit[i][reqd_data[j]][k]["quantity"] +
                  "\t=\t" +
                  Profit[i][reqd_data[j]][k]["cpCost"] +
                  "\n";
                tCost = tCost + Profit[i][reqd_data[j]][k]["cpCost"];
              }
              Profit_Result[i][
                "invoiceDescription(price * quantity)"
              ] = str_invoiceDesc;
            } else if (reqd_data[j] == "relatedInvoiceId") {
              if (Profit[i][reqd_data[j]] != "") {
                Profit_Result[i]["Bill Type"] = "GST";
              } else {
                Profit_Result[i]["Bill Type"] = "Non-GST";
              }
            } else if (reqd_data[j] == "totalProfit") {
              Profit_Result[i]["expectedProfit"] = Profit[i][reqd_data[j]];
            } else if (reqd_data[j] == "obtainedProfit") {
              Profit_Result[i]["obtainedProfit"] =
                Profit[i]["totalProfit"] +
                (Profit[i]["amountPaid"] - Profit[i]["totalCost"]);
            } else {
              Profit_Result[i][reqd_data[j]] = Profit[i][reqd_data[j]];
            }
          }
        }
      }else{
        Profit_Result=[{
          S_No:"NO DATA AVAILABLE",
          purchasedDate:"",
          "Bill Type":"",
          billNo:"",
          clientName:"",
          clientPhoneNo:"",
          "invoiceDescription(price * quantity)":"",
          totalCost:"",
          amountPaid:"",
          expectedProfit:"",
          obtainedProfit:""
        }]
      }
      // this.excelService.exportAsExcelFile(Profit_Result, "Profit");
      //console.log(Profit_Result);
      this.dataForExcel = [];
      Profit_Result.forEach((row: any) => {
        //console.log("row");
        //console.log(row);
        //console.log(Object.values(row));
        this.dataForExcel.push(Object.values(row));
      });
      //console.log("dataForExcel");
      //console.log(this.dataForExcel);
      let reportData = {
        title: "Profit",
        data: this.dataForExcel,
        headers: Object.keys(Profit_Result[0])
      };

      this.exportExcelService.exportExcel(reportData);
      // console.log(Profit_Result);
    }
    this.form.reset();
    this.isLoading = false;
  }

  joinObjectsArray(arr1,arr2){
    let result=[];
    for(let i=0;i<arr1.length;i++){
      for(let j=0;j<arr2.length;j++){
        if((Object.values(arr1[i]._id)).toString()===(Object.values(arr2[j]._id)).toString()){
          result.push(this.MergeObjects(arr1[i],arr2[j]))
          break;
        }
          
      }
    }
    return result;
  }

  MergeObjects(obj1, obj2){return {...obj1,...obj2} }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    // if(this.invoiceSub){
    // }
    this.invoiceSub.unsubscribe();
    // if(this.orderSub){
    // }
    this.orderSub.unsubscribe();
  }
}
