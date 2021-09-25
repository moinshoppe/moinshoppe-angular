import { OrderItem } from "./order-item.model";

/*
export class Order {
  public _id: string;
  public clientName: string;
  public clientPhoneNo: string;
  public totalCost:number;
  public listOfItems: OrderItem[];

  constructor(
    _id: string,
    clientName: string,
    clientPhoneNo: string,
    totalCost:number,
    listOfItems: OrderItem[]
  ) {
    this._id = _id;
    this.clientName = clientName;
    this.clientPhoneNo = clientPhoneNo;
    this.totalCost=totalCost;
    this.listOfItems = listOfItems;
  }
}
 */

export interface Order{
  _id:string;
  billNo:string;
  clientName: string;
  clientPhoneNo: string;
  clientAddress:string;
  clientGSTIN:string;
  isInvoiceCreated:boolean;
  relatedInvoiceId:string;
  totalCost:number;
  totalProfit:number;
  paymentType:string;
  amountPaid:number;
  purchasedDate:string;
  lastUpdatedDate:string;
  businessType:string;
  businessType_copy:string;
  transaction:string;
  listOfItems: OrderItem[];
  creator:string;
}



