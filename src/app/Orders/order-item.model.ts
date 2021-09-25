/*export class OrderItem {
  constructor (public _id:string,
  public unititem:string,
  public quantity:string,
  public unitprice:number, 
  public cost:number) {}
}



cost: 46
quantity: "23"
unititem: "b"
unitprice: 2
 */


export interface OrderItem{
  _id:string,
  item_id:string,
  itemName:string,
  itemCostPrice:number,
  itemSellingPrice:number,
  item_qty:number,
  quantity:number,
  quantity_copy:number,
  cpCost:number, 
  spCost:number,
  profit:number,
  itemHSN:string
  }
