import { Component, OnInit,OnDestroy } from "@angular/core";

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { UrlService } from "../../shared/url.service";
import { InvoicesService } from "../invoices.service";
import { Invoice } from "../invoice.model";
import { Order } from "../../Orders/order.model";
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: "app-invoice-create",
  templateUrl: "./invoice-create.component.html",
  styleUrls: ["./invoice-create.component.css"]
})
export class InvoiceCreateComponent implements OnInit, OnDestroy  {
  previousUrl: Observable<string> = this.urlService.previousUrl$;
  private authStatusSub: Subscription;
isLoading=false;
  invoice:Invoice;
      gen_InvoiceNo_Val = "";
lastInvoiceNo="";
maxInvoices=0;
private lastInvoiceNoSub: Subscription;
  editMode = false;
  form:FormGroup;
  private invoiceId:string;
  orderId:string;
  orderBillNo:string;
order:Order={
    _id:null,
  billNo:"",
  clientName: "",
  clientPhoneNo: "",
  clientAddress:"",
  clientGSTIN:"",
  isInvoiceCreated:false,
  relatedInvoiceId:"",
  totalCost:0,
  totalProfit:0,
   paymentType:"Cash",
  amountPaid:0,
  purchasedDate:"",
  lastUpdatedDate:"",
  businessType:"",
  businessType_copy:"",
  transaction:"",
  listOfItems: [],
  creator:""
    }
    prev_URl=""

  constructor(private invoicesService: InvoicesService, public activatedRoute: ActivatedRoute,private urlService: UrlService,   private router: Router,private authService: AuthService) {}
onCancel() {
    ////console.log("cancelled");
    this.router.navigate(["/invoices/all"]);
    // this.orderForm.reset();
  }
getTodaysDate() {
    let todaysDate_datetime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    let date_str = todaysDate_datetime.getDate().toString();
    let month_str = (todaysDate_datetime.getMonth() + 1).toString();
    let year_str = todaysDate_datetime.getFullYear().toString();
    if (month_str.length == 1) {
      month_str = "0" + month_str;
    }
    if (date_str.length == 1) {
      date_str = "0" + date_str;
    }
    let todaysDate_string = year_str + "-" + month_str + "-" + date_str;

    return todaysDate_string;
  }
  isNumeric(num) {
    return !isNaN(num);
  }
  padLeft(nr, n, str) {
    return Array(n - String(nr).length + 1).join(str || "0") + nr;
  }

  ngOnInit() {
     this.urlService.previousUrl$.subscribe((previousUrl: string) => {
       this.prev_URl = previousUrl;
      //console.log('previous url: ', previousUrl);
    });


this.invoicesService.getOrderInfo().subscribe(orderInfo => {
      
      this.order = orderInfo;
      //console.log("this.order");
      //console.log(this.order);

      if(this.prev_URl== "/orders/all"){
        this.orderId=this.order._id;
        this.orderBillNo=this.order.billNo;
      }
/*
  if(this.prev_URl== "/orders/all"){
        this.order = orderInfo;
      //console.log(this.order);
      }else{
        this.order={
          _id:null,
        billNo:"",
        clientName: "",
        clientPhoneNo: "",
        clientAddress:"",
        clientGSTIN:"",
        isInvoiceCreated:false,
        relatedInvoiceId:"",
        totalCost:0,
        totalProfit:0,
        amountPaid:0,
        purchasedDate:"",
        lastUpdatedDate:"",
        businessType:"",
        transaction:"",
        listOfItems: []
          }
      }
 */
    
    });
this.authStatusSub=this.authService
                          .getAuthStatusListener()
                          .subscribe(authStatus=>{
                            this.isLoading=false;
                          });
						  
    

    this.form=new FormGroup({
     
      SGST:new FormControl(9),
      CGST:new FormControl(9, {validators:[]}),
      IGST:new FormControl(0),
	  eWayBillNo:new FormControl(null),
	  vehicleNo:new FormControl(null),
	  transporterName:new FormControl(null)
	  
    })
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap)=>{
      if(paramMap.has('invoiceId')){
        this.editMode=true;
        this.invoiceId=paramMap.get('invoiceId');
        this.isLoading=true;
        this.invoicesService.getInvoice(this.invoiceId)
            .subscribe(invoiceData=>{
              this.isLoading=false;
              //console.log(invoiceData);
              const transformedInvoiceData: any=invoiceData
              this.invoice=transformedInvoiceData;
			  this.orderId=this.invoice.orderId;
        this.orderBillNo=this.invoice.orderBillNo;
        this.gen_InvoiceNo_Val = this.invoice.invoiceNo;
              this.form.setValue({
                                   
                                  SGST:this.invoice.SGST,
                                  CGST:this.invoice.CGST,
                                  IGST:this.invoice.IGST,
								  eWayBillNo:this.invoice.eWayBillNo,
								  vehicleNo:this.invoice.vehicleNo,
								  transporterName:this.invoice.transporterName
                                })
              //console.log(this.invoice)
            });
       } else {
        this.editMode=false;
        this.invoiceId=null;
		
      }
    });
    /*if (!this.editMode) {
      this.invoicesService.getLastInvoiceNo();
      this.lastInvoiceNoSub = this.invoicesService
        .getlastInvoiceInfoUpdateListener()
        .subscribe(
          (lastInvoiceData: {
            message: string;
            lastInvoiceNo: string;
            maxInvoices: number;
          }) => {
            //console.log("lastInvoiceData")
            //console.log(lastInvoiceData)
            //this.isLoading = false;
            this.lastInvoiceNo = lastInvoiceData.lastInvoiceNo;
            this.maxInvoices = lastInvoiceData.maxInvoices;
            
            let maxInvoiceCount = this.maxInvoices;
            let lastBillNo_num = 0;
            if(this.lastInvoiceNo!="" && this.isNumeric(this.lastInvoiceNo)){
            	lastBillNo_num=Number(this.lastInvoiceNo)
            }
            //console.log("lastBillNo_num")
            //console.log(lastBillNo_num)
            //console.log("maxInvoiceCount")
            //console.log(maxInvoiceCount)
            if (lastBillNo_num >= maxInvoiceCount) {
                  this.gen_InvoiceNo_Val =
                    this.padLeft(lastBillNo_num + 1, 5, "0");
                  //console.log("last bill no");
                } else {
                  this.gen_InvoiceNo_Val =
                    this.padLeft(maxInvoiceCount + 1, 5, "0");
                  //console.log("max invoice");
                }
         
          
          }
        );
    }*/
  }

  onSaveInvoice() {
    //console.log(this.form.value);
    if (this.form.invalid) {
      return;
    }
   this.isLoading=true;
   const invoice:Invoice={
   _id:this.invoiceId,
   invoiceNo:this.gen_InvoiceNo_Val,
    orderId:this.orderId,
    orderBillNo:this.orderBillNo,
    
    SGST: this.form.value.SGST,
    CGST: this.form.value.CGST,
    IGST:this.form.value.IGST,
    eWayBillNo:this.form.value.eWayBillNo,
    vehicleNo:this.form.value.vehicleNo,
    transporterName:this.form.value.transporterName,
    lastUpdatedDate:this.getTodaysDate(),
    creator:null
   }
     if(!this.editMode){
      this.invoicesService.addInvoice(invoice,this.order);
    } else {
      this.invoicesService.updateInvoice(invoice,this.order);
    }
    //console.log(invoice);
    this.form.reset();
  }
  ngOnDestroy(){
	this.authStatusSub.unsubscribe();
}
}
