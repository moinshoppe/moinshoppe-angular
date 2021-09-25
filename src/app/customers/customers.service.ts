import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Router } from "@angular/router";
import {map} from 'rxjs/operators';
import { Customer } from "./customer.model";
import {environment} from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/customers";

@Injectable()
export class CustomersService {
  private customers: Customer[] = [];
  private customersUpdated = new Subject<{customers:Customer[],customerCount:number}>();
  private customersPhoneNos:CustomersPhoneNo[]=[];
  private customerPhoneNosUpdated = new Subject<{customersPhoneNos:CustomersPhoneNo[],maxCustomers:number}>();
  constructor(private httpClient: HttpClient, private router: Router) {}


  getCustomers(postsPerPage:number, currentPage: number) {
    // return [...this.customers];
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    //console.log(queryParams)
    this.httpClient
      .get<{ message: string; customers: Customer[] ,maxCustomers:number}>(
        BACKEND_URL+queryParams
      )
       .pipe(map((customerData)=>{
            return { 
              customers: customerData.customers,
              maxCustomers:customerData.maxCustomers
            };
          }))
      .subscribe(postData => {
        this.customers = postData.customers;
        
        //console.log(postData);
        this.customersUpdated.next({
                                    customers:[...this.customers],
                                    customerCount: postData.maxCustomers
                                  });;
        
      });
  }

 getCustomer(id: string) {
    //console.log(id);

    return this.httpClient.get<{
      customer:Customer
    }>(BACKEND_URL+"/" + id);
  }

  getCustomerUpdateListener() {
    return this.customersUpdated.asObservable();
  }

getCustomersWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.customers];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    //console.log(queryParams);
    this.httpClient
      .get<{ message: string; customers: Customer[]; maxCustomers: number }>(
        BACKEND_URL+"/search" + queryParams
      )
      .pipe(
        map(customerData => {
          //console.log(customerData);
          return {
            customers: customerData.customers,
            maxCustomers: customerData.maxCustomers
          };
        })
      )
      .subscribe(postData => {
        this.customers = postData.customers;

        //console.log(postData);
        this.customersUpdated.next({
          customers: [...this.customers],
          customerCount: postData.maxCustomers
        });
      });
  }
  getCustomersPhoneNo(){
    this.httpClient
      .get<{ message: string; customersPhoneNos: CustomersPhoneNo[] ,maxCustomers:number}>(BACKEND_URL+'/phone')
       .pipe(map((customerPhoneNoData)=>{
            return { 
              customersPhoneNos: customerPhoneNoData.customersPhoneNos,
              maxCustomers:customerPhoneNoData.maxCustomers
            };
          }))
      .subscribe(postData => {
        this.customersPhoneNos = postData.customersPhoneNos;
        
        //console.log(postData);
        this.customerPhoneNosUpdated.next({
                                    customersPhoneNos:[...this.customersPhoneNos],
                                    maxCustomers: postData.maxCustomers
                                  });
        
      });
  }
  getCustomerPhoneNosUpdateListener() {
    return this.customerPhoneNosUpdated.asObservable();
  }
  addCustomer(customer:Customer) {
    
    //const customer: Customer = { _id: null, customerName: customerName, customerSellingPrice: customerSellingPrice,customerCostPrice:customerCostPrice,customerQuantity:customerQuantity };
    this.httpClient
      .post<{ message: string; customerId: string }>(
       BACKEND_URL,
        customer
      )
      .subscribe(responseData => {
        const customer_new : Customer ={	
              _id:responseData.customerId, 	
              customerName:customer.customerName, 	
              customerPhoneNo:customer.customerPhoneNo,
              customerAddress:customer.customerAddress,
              customerEmail:customer.customerEmail,
              customerGSTIN:customer.customerGSTIN,
              creator:null
            }	
            this.customers.push(customer_new);
            	
            this.customersUpdated.next( {customers:[...this.customers],
                                    customerCount: this.customers.length});
        this.router.navigate(["/customers/all"]);
      });
  }

  
  updateCustomer(customer:Customer) {
    const _id = customer._id;
    this.httpClient
      .put(BACKEND_URL+"/" + _id, customer)
      .subscribe(response => {
      //   const updatedCustomers = [...this.customers];	
      // const oldCustomerIndex =  updatedCustomers.findIndex(p => p._id === _id);	
      // const customer_new:Customer=customer;
      // updatedCustomers[oldCustomerIndex] = customer_new;	
      // this.customers=updatedCustomers;	
      // // this.postsUpdated.next([...this.posts]);
      // this.customersUpdated.next({
      //                               customers:[...this.customers],
      //                               customerCount: updatedCustomers.length
      //                             });;
       this.router.navigate(["/customers/all"]);
      });
  }
  
  deleteCustomer(customerId: string) {
    return this.httpClient
      .delete(BACKEND_URL+"/" + customerId);
  }
}
export interface CustomersPhoneNo{
    customersPhoneNo:string;
}