import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject,Subject } from "rxjs";
import { Router } from "@angular/router";
import {map} from 'rxjs/operators';
import { Invoice } from "./invoice.model";
import { Order } from "../Orders/order.model";
import { OrdersService } from "../Orders/orders.service";
import {environment} from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/invoices";

@Injectable()
export class InvoicesService {
  private invoices: Invoice[] = [];
  private invoicesUpdated = new Subject<{invoices:Invoice[],invoiceCount:number}>();
  private lastInvoiceInfoUpdated = new Subject<{
    message: string;
    lastInvoiceNo: string;
    maxInvoices: number;
  }>();
  constructor(private httpClient: HttpClient, private router: Router, private ordersService: OrdersService) {}
private orderNewInvoice = new BehaviorSubject<Order>(
    {
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
  );
 

  setOrderInfo(order:Order){
    this.orderNewInvoice.next(order);
  }
getOrderInfo(){
  return this.orderNewInvoice.asObservable();
}

  getInvoices(postsPerPage:number, currentPage: number) {
    // return [...this.invoices];
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    //console.log(queryParams)
    this.httpClient
      .get<{ message: string; invoices: Invoice[] ,maxInvoices:number}>(
        BACKEND_URL+queryParams
      )
       .pipe(map((invoiceData)=>{
            return { 
              invoices: invoiceData.invoices,
              maxInvoices:invoiceData.maxInvoices
            };
          }))
      .subscribe(postData => {
        this.invoices = postData.invoices;
        
        //console.log(postData);
        this.invoicesUpdated.next({
                                    invoices:[...this.invoices],
                                    invoiceCount: postData.maxInvoices
                                  });;
        
      });
  }

getLastInvoiceNo() {
    this.httpClient
      .get<{ message: string; lastInvoiceNo: string; maxInvoices: number }>(
        BACKEND_URL+"/genid"
      )
      .subscribe(data => {
        //console.log("getLastInvoiceNo");
        //console.log(data);
        this.lastInvoiceInfoUpdated.next({
          message: data.message,
          lastInvoiceNo: data.lastInvoiceNo,
          maxInvoices: data.maxInvoices
        });
      });
  }
  getlastInvoiceInfoUpdateListener() {
    return this.lastInvoiceInfoUpdated.asObservable();
  }

  getInvoice(id: string) {
    //console.log(id);

    return this.httpClient.get<{
      invoice:Invoice
    }>(BACKEND_URL+"/" + id);
  }

  getInvoiceUpdateListener() {
    return this.invoicesUpdated.asObservable();
  }

   addInvoice(invoice:Invoice, order:Order) {
    
    //const invoice: Invoice = { _id: null, invoiceName: invoiceName, invoiceSellingPrice: invoiceSellingPrice,invoiceCostPrice:invoiceCostPrice,invoiceQuantity:invoiceQuantity };
    this.httpClient
      .post<{ message: string; invoiceId: string }>(
        BACKEND_URL,
        invoice
      )
	   .subscribe(responseData => {
        /*const invoice : Invoice ={	
              _id:responseData.invoiceId, 	
              itemName:itemName, 	
              itemPrice:itemPrice
            }	*/
        //console.log(responseData);
        invoice._id = responseData.invoiceId;
        this.invoices.push(invoice);

        this.invoicesUpdated.next({
          invoices: [...this.invoices],
          invoiceCount: this.invoices.length
        });
		this.router.navigate(["/invoices/all"]);
		
		let orderToBeUpdated=order;
		
		orderToBeUpdated.relatedInvoiceId=responseData.invoiceId;
		if(responseData.invoiceId!=null){
			orderToBeUpdated.isInvoiceCreated=true;
		}
		
		//console.log(orderToBeUpdated)
    this.ordersService.updateOrderFromInvoiceService(
            orderToBeUpdated
          );
    });
  }


  updateInvoice(invoice:Invoice, order:Order) {
	const _id = invoice._id;
    this.httpClient
      .put(BACKEND_URL+"/" + _id, invoice)
      .subscribe(response => {
		// const updatedInvoices = [...this.invoices];
    //     const oldInvoiceIndex = updatedInvoices.findIndex(p => p._id === _id);
    //     const invoice_new: Invoice = invoice;
    //     updatedInvoices[oldInvoiceIndex] = invoice_new;
    //     this.invoices = updatedInvoices;
    //     // this.postsUpdated.next([...this.posts]);
    //     this.invoicesUpdated.next({
    //       invoices: [...this.invoices],
    //       invoiceCount: updatedInvoices.length
    //     });
        
       this.router.navigate(["/invoices/all"]);

      let orderToBeUpdated=order;
		if(orderToBeUpdated.relatedInvoiceId!=invoice._id){
      orderToBeUpdated.relatedInvoiceId=invoice._id;
    }
    
		if(orderToBeUpdated.relatedInvoiceId!=null){
			orderToBeUpdated.isInvoiceCreated=true;
		}else{
      orderToBeUpdated.isInvoiceCreated=false;
    }
		
		//console.log(orderToBeUpdated)
    this.ordersService.updateOrderFromInvoiceService(
            orderToBeUpdated
          );
    });

      
  }
 
  deleteInvoice(invoiceId: string) {
    return this.httpClient
      .delete(BACKEND_URL+"/" + invoiceId);
  }
}
