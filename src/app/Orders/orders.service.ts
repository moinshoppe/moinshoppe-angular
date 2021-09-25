import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
import { Order } from "./order.model";
import { ItemsService } from "../Items/items.service";
import { Customer } from "../customers/customer.model";
import {environment} from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/orders";

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private ordersUpdated = new Subject<{
    orders: Order[];
    orderCount: number;
  }>();
  private lastOrderInfoUpdated = new Subject<{
    message: string;
    lastOrderBillNo: string;
    maxOrders: number;
  }>();
  private customerNewOrder = new BehaviorSubject<Customer>({
    _id: null,
    customerName: "",
    customerPhoneNo: "",
    customerAddress: "",
    customerEmail: "",
    customerGSTIN: "",
    creator:""
  });
  private genBillNoVal = "";

  setCustomerInfo(customer: Customer) {
    this.customerNewOrder.next(customer);
  }
  getCustomerInfo() {
    return this.customerNewOrder.asObservable();
  }
  getOrders(postsPerPage: number, currentPage: number) {
    // return [...this.orders];
    const queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    //console.log(queryParams);
    this.httpClient
      .get<{ message: string; orders: Order[]; maxOrders: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map(orderData => {
          return {
            orders: orderData.orders,
            maxOrders: orderData.maxOrders
          };
        })
      )
      .subscribe(postData => {
        this.orders = postData.orders;

        //console.log(postData);
        this.ordersUpdated.next({
          orders: [...this.orders],
          orderCount: postData.maxOrders
        });
      });
  }
  getOrdersWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string,
    searchType: string
  ) {
    // return [...this.orders];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtype=${searchType}&searchtext=${searchText}`;
    if (searchText == "" && searchType == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    //console.log(queryParams);
    this.httpClient
      .get<{ message: string; orders: Order[]; maxOrders: number }>(
       BACKEND_URL+ "/search" + queryParams
      )
      .pipe(
        map(orderData => {
          //console.log(orderData);
          return {
            orders: orderData.orders,
            maxOrders: orderData.maxOrders
          };
        })
      )
      .subscribe(postData => {
        this.orders = postData.orders;

        //console.log(postData);
        this.ordersUpdated.next({
          orders: [...this.orders],
          orderCount: postData.maxOrders
        });
      });
  }
  getLastOrderBillNo() {
    // return [...this.orders];
    this.httpClient
      .get<{ message: string; lastOrderBillNo: string; maxOrders: number }>(
       BACKEND_URL+ "/genid"
      )
      .subscribe(data => {
        //console.log(data);
        this.lastOrderInfoUpdated.next({
          message: data.message,
          lastOrderBillNo: data.lastOrderBillNo,
          maxOrders: data.maxOrders
        });
      });
  }
  getlastOrderInfoUpdateListener() {
    return this.lastOrderInfoUpdated.asObservable();
  }

  getOrderUpdateListener() {
    return this.ordersUpdated.asObservable();
  }
  addOrder(order: Order) {
    //const item: Order = { _id: null, itemName: itemName, itemPrice: itemPrice };
    //console.log("add order");
    //console.log(order);
    order.businessType_copy = order.businessType;
    let businessType_copy = order.businessType_copy;
    //console.log("after order update");
    //console.log(order);
    let ar = order.listOfItems;
    if (ar.length > 0) {
      for (let i = 0; i < ar.length; i++) {
       
       
        //ar[i].item_qty=item_qty-ar[i].quantity;
        if(order.businessType=="Sell" && businessType_copy=="Buy"){
          ar[i].item_qty=ar[i].item_qty - (2 * ar[i].quantity_copy + (ar[i].quantity - ar[i].quantity_copy))
        }
        if(order.businessType=="Buy" && businessType_copy=="Sell"){
          ar[i].item_qty=ar[i].item_qty + (2 * ar[i].quantity_copy + (ar[i].quantity - ar[i].quantity_copy))
        }
        if(order.businessType=="Buy" && businessType_copy=="Buy"){
          ar[i].item_qty=ar[i].item_qty + (ar[i].quantity - ar[i].quantity_copy)
        }
        if(order.businessType=="Sell" && businessType_copy=="Sell"){
          ar[i].item_qty=ar[i].item_qty - (ar[i].quantity - ar[i].quantity_copy)
        }
      }
      order.listOfItems=ar;
    }
    //console.log(order);
    this.httpClient
      .post<{ message: string; orderId: string }>(
        BACKEND_URL,
        order
      )
      .subscribe(responseData => {
        /*const order : Order ={	
              _id:responseData.orderId, 	
              itemName:itemName, 	
              itemPrice:itemPrice
            }	*/
        //console.log(responseData);
        order._id = responseData.orderId;
        this.orders.push(order);

        this.ordersUpdated.next({
          orders: [...this.orders],
          orderCount: this.orders.length
        });
        this.router.navigate(["/orders/all"]);
        const order_new = order;
        let ar = order_new.listOfItems;
        if (ar.length > 0) {
          for (let i = 0; i < ar.length; i++) {
            let item_id = ar[i].item_id;
            let itemName = ar[i].itemName;
            let itemSellingPrice = ar[i].itemSellingPrice;
            let itemCostPrice = ar[i].itemCostPrice;
            let item_qty = ar[i].item_qty;
            let quantity = ar[i].quantity;
            let quantity_copy = ar[i].quantity_copy;
            ar[i].item_qty=item_qty-quantity;
            let itemHSN=ar[i].itemHSN;
            //console.log("quantity");
            //console.log(quantity);
            //console.log("quantity_copy");
            //console.log(quantity_copy);
            // if (quantity != quantity_copy) {
            this.itemsService.updateItemFromOrderService(
                  item_id,
                  itemName,
                  itemSellingPrice,
                  itemCostPrice,
                  item_qty,
                  itemHSN
                );
            // }

            // if (quantity != quantity_copy) {
            //   if (order_new.businessType == "Sell") {
            //     this.itemsService.updateItemFromOrderService(
            //       item_id,
            //       itemName,
            //       itemSellingPrice,
            //       itemCostPrice,
            //       item_qty
            //     );
            //   } else {
            //     this.itemsService.updateItemFromOrderService(
            //       item_id,
            //       itemName,
            //       itemSellingPrice,
            //       itemCostPrice,
            //       item_qty
            //     );
            //   }
            // }
          }
        }
      });
  }
  updateOrder(order: Order) {
    //const item: Order = { _id: _id, itemName: itemName, itemPrice: itemPrice };
    //console.log(order);
    const _id = order._id;
    let businessType_copy = order.businessType_copy;
    order.businessType_copy = order.businessType;
    //console.log(businessType_copy)
     if(order.businessType=="Buy" && businessType_copy=="Sell"){
        if(order.isInvoiceCreated){
order.isInvoiceCreated=false;}
if(order.relatedInvoiceId!=null && order.relatedInvoiceId!=""){
order.relatedInvoiceId=null;}
     }
     //console.log("updating invoice details of order")
     //console.log(order)
    let ar_old=order.listOfItems;
    let ar = order.listOfItems;
    if (ar.length > 0) {
      for (let i = 0; i < ar.length; i++) {
       
        let item_qty = ar[i].item_qty;
        let quantity = ar[i].quantity;
        let quantity_copy = ar[i].quantity_copy;
        //ar[i].item_qty=item_qty-ar[i].quantity;
        if(order.businessType=="Sell" && businessType_copy=="Buy"){
          ar[i].item_qty=ar[i].item_qty - (2 * ar[i].quantity_copy + (ar[i].quantity - ar[i].quantity_copy))
        }
        if(order.businessType=="Buy" && businessType_copy=="Sell"){
          ar[i].item_qty=ar[i].item_qty + (2 * ar[i].quantity_copy + (ar[i].quantity - ar[i].quantity_copy))
        }
        if(order.businessType=="Buy" && businessType_copy=="Buy"){
          ar[i].item_qty=ar[i].item_qty + (ar[i].quantity - ar[i].quantity_copy)
        }
        if(order.businessType=="Sell" && businessType_copy=="Sell"){
          ar[i].item_qty=ar[i].item_qty - (ar[i].quantity - ar[i].quantity_copy)
        }
      }
      order.listOfItems=ar;
    }
    //console.log(ar)
    //console.log(ar_old)
     
    this.httpClient
      .put(BACKEND_URL+"/" + _id, order)
      .subscribe(response => {
        // //console.log(response);
        // const updatedOrders = [...this.orders];
        // const oldItemIndex = updatedOrders.findIndex(p => p._id === _id);
        // const order_new: Order = order;
        // updatedOrders[oldItemIndex] = order_new;
        // this.orders = updatedOrders;
        // // this.postsUpdated.next([...this.posts]);
        // this.ordersUpdated.next({
        //   orders: [...this.orders],
        //   orderCount: updatedOrders.length
        // });
        this.router.navigate(["/orders/all"]);

        if(ar_old.length>0 && ar.length>0){
          for(let i=0;i<ar.length;i++){
            // if((ar[i].item_qty!=ar_old[i].item_qty)||(ar[i].quantity!=ar[i].quantity_copy)){
              let item_id = ar[i].item_id;
              let itemName = ar[i].itemName;
              let itemSellingPrice = ar[i].itemSellingPrice;
              let itemCostPrice = ar[i].itemCostPrice;
              let item_qty = ar[i].item_qty;
              let itemHSN= ar[i].itemHSN;
              this.itemsService.updateItemFromOrderService(
                    item_id,
                    itemName,
                    itemSellingPrice,
                    itemCostPrice,
                    item_qty,
                    itemHSN
                  );
            // }
          }
        }
        
        
      });
  }

  updateOrderFromInvoiceService(order) {
    const _id = order._id;
    this.httpClient
      .put(BACKEND_URL+"/" + _id, order)
      .subscribe(response => {
        // //console.log(response);
        // const updatedOrders = [...this.orders];
        // const oldItemIndex = updatedOrders.findIndex(p => p._id === _id);
        // const order_new: Order = order;
        // updatedOrders[oldItemIndex] = order_new;
        // this.orders = updatedOrders;
        // // this.postsUpdated.next([...this.posts]);
        // this.ordersUpdated.next({
        //   orders: [...this.orders],
        //   orderCount: updatedOrders.length
        // });
        //this.router.navigate(["/orders/all"]);
      });
  }

  deleteOrder(orderId: string) {
    return this.httpClient.delete(
      BACKEND_URL+"/" + orderId
    );
  }

  getOrder(id: string) {
    //console.log(id);

    return this.httpClient.get<{
      order: Order;
    }>(BACKEND_URL+"/" + id);
  }

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private itemsService: ItemsService
  ) {}
}
