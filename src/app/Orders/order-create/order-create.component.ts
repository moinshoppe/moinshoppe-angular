import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  FormArray,
  FormGroup,
  FormControl,
  Validators,
  FormBuilder
} from "@angular/forms";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Subscription, Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";

import { UrlService } from "../../shared/url.service";
import { Order } from "../order.model";
import { ItemsService } from "../../Items/items.service";
import { OrdersService } from "../../Orders/orders.service";

import { Item } from "../../Items/item.model";
import { Customer } from "../../customers/customer.model";
import { AuthService } from "../../auth/auth.service";
import { ErrorComponent } from "../../error/error.component";

@Component({
  selector: "app-order-create",
  templateUrl: "./order-create.component.html",
  styleUrls: ["./order-create.component.css"]
})
export class OrderCreateComponent implements OnInit, OnDestroy {
  previousUrl: Observable<string> = this.urlService.previousUrl$;

  isReady: boolean = false;
  options: string[] = [];
  result = ["Kindly remove invalid entries:\n"];
  filteredOptions: Observable<string[]>[] = [];
  refreshButton = false;
  checkBox_Bool = false;
  prev_URl = "";
  isLoading = false;
  order: any;
  orderId: string = null;
  editMode = false;
  items: any[] = [];
  selectedIndex = -1;
  enteredQuantity = 0;
  selectedItemName = "--";
  selectedItemPrice = 0;
  selected_item_id = "";
  selectedItemCostPrice = 0;
  selectedItemSellingPrice = 0;
  selected_item_qty = 0;
  selected_itemHSN = "";
  orderForm: FormGroup;
  totalCost: number = 0;
  totalProfit: number = 0;
  orderDataArray: any[] = [];
  updatedOrder_Data_Array: any[] = [];
  private itemSub: Subscription;
  private lastOrderBillSub: Subscription;
  private authStatusSub: Subscription;
  transactionValue = "";
  billNoValue = "";
  lastOrderBillNo = "";
  maxOrders = 0;
  genBillNoVal = "";
  billingNotStarted = true;
  radioButtonVal = "";
  radioButtonVal_array = [];
  radioCount = 0;
  customer: Customer = {
    _id: null,
    customerName: "",
    customerPhoneNo: "",
    customerAddress: "",
    customerEmail: "",
    customerGSTIN: "",
    creator: ""
  };
  isInvoiceCreated_value = false;
  relatedInvoiceId_value = "";
  radioButtonPaymentVal = "Cash";
  radioButtonPaymentVal_array = [];
  businessType_copy_Val = "";

  toggle(event) {
    //console.log(event.checked);
    this.checkBox_Bool = event.checked;
  }
  onOptionSelect(event, index) {
    //console.log(event.option.value);
  }
  getTodaysDate() {
    let todaysDate_datetime = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
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

  private initForm() {
    let clientName = "";
    let clientPhoneNo = "";
    let listOfItems = new FormArray([]);
    let amountPaid = null;
    let purchasedDate = null;
    let businessType = null;
    let paymentType = this.radioButtonPaymentVal;
    let clientAddress = null;
    let clientGSTIN = null;
    if (this.prev_URl == "/customers/all") {
      if (this.customer.customerName != "") {
        clientName = this.customer.customerName;
      }
      if (this.customer.customerPhoneNo != "") {
        clientPhoneNo = this.customer.customerPhoneNo;
      }
      if (this.customer.customerAddress != "") {
        clientAddress = this.customer.customerAddress;
      }
      if (this.customer.customerGSTIN != "") {
        clientGSTIN = this.customer.customerGSTIN;
      }
    }

    let todaysDate_string = this.getTodaysDate();
    this.businessType_copy_Val = "";
    //console.log(todaysDate_string);
    this.orderForm = new FormGroup({
      clientName: new FormControl(clientName),
      clientPhoneNo: new FormControl(clientPhoneNo, {
        validators: [
          Validators.required,
          Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),
          Validators.minLength(10),
          Validators.maxLength(10)
        ]
      }),
      clientAddress: new FormControl(clientAddress),
      clientGSTIN: new FormControl(clientGSTIN),
      amountPaid: new FormControl(amountPaid, Validators.required),
      purchasedDate: new FormControl(todaysDate_string, Validators.required),
      businessType: new FormControl(businessType, Validators.required),
      paymentType: new FormControl(paymentType, Validators.required),
      listOfItems: listOfItems
    });

    if (this.editMode) {
      // const order = this.ordersService.get_Order(0);

      this.ordersService.getOrder(this.orderId).subscribe(orderData => {
        this.isLoading = false;
        //console.log(orderData);

        this.order = orderData;

        //console.log(this.order);
        const order = this.order;

        //console.log(order);
        this.genBillNoVal = this.order.billNo;
        clientName = this.order.clientName;
        clientPhoneNo = this.order.clientPhoneNo;
        clientAddress = this.order.clientAddress;
        clientGSTIN = this.order.clientGSTIN;
        amountPaid = this.order.amountPaid;
        purchasedDate = this.order.purchasedDate;
        businessType = this.order.businessType;
        paymentType = this.order.paymentType;
        this.transactionValue = this.order.transaction;
        this.radioButtonVal = this.order.businessType;
        this.radioButtonPaymentVal = this.order.paymentType;
        this.billNoValue = this.order.billNo;
        this.isInvoiceCreated_value = this.order.isInvoiceCreated;
        this.relatedInvoiceId_value = this.order.relatedInvoiceId;
        this.businessType_copy_Val = this.order.businessType_copy;
        this.billingNotStarted = false;
        //  this.totalCost=this.order.totalCost;
        if (this.order["listOfItems"]) {
          for (let [index, listItem] of this.order.listOfItems.entries()) {
            let cost = 0;
            if (this.radioButtonVal == "Buy") {
              cost = listItem.cpCost;
            } else {
              cost = listItem.spCost;
            }
            listOfItems.push(
              new FormGroup({
                unititem: new FormControl(
                  listItem.itemName,
                  Validators.required
                ),
                quantity: new FormControl(
                  listItem.quantity,
                  Validators.required
                ),
                amount: new FormControl(
                  { value: cost, disabled: true },
                  Validators.required
                )
              })
            );
            this.ManageNameControl(index);
            this.isReady = true;
            this.orderDataArray.push({
              _id: null,
              item_id: "",
              itemName: "",
              itemCostPrice: 0,
              itemSellingPrice: 0,
              item_qty: 0,
              quantity: 0.0,
              quantity_copy: 0.0,
              cpCost: 0,
              spCost: 0,
              profit: 0,
              itemHSN: ""
            });
            this.orderDataArray[index]._id = listItem._id;
            this.orderDataArray[index].item_id = listItem.item_id;
            this.orderDataArray[index].itemName = listItem.itemName;
            this.orderDataArray[index].itemCostPrice = listItem.itemCostPrice;
            this.orderDataArray[index].itemSellingPrice =
              listItem.itemSellingPrice;
            this.orderDataArray[index].item_qty = listItem.item_qty;
            this.orderDataArray[index].quantity = Number(listItem.quantity);
            this.orderDataArray[index].quantity_copy = Number(
              listItem.quantity
            );
            //quantity_copy
            this.orderDataArray[index].cpCost = listItem.cpCost;
            this.orderDataArray[index].spCost = listItem.spCost;
            this.orderDataArray[index].profit = listItem.profit;
            this.orderDataArray[index].itemHSN = listItem.itemHSN;
            this.getTotalCost(this.orderDataArray);
            this.getTotalProfit(this.orderDataArray);
            //console.log("initForm");
            //console.log(this.orderDataArray);
            this.orderForm = new FormGroup({
              clientName: new FormControl(clientName),
              clientPhoneNo: new FormControl(
                clientPhoneNo,
                Validators.required
              ),
              clientAddress: new FormControl(clientAddress),
              clientGSTIN: new FormControl(clientGSTIN),
              amountPaid: new FormControl(amountPaid, Validators.required),
              purchasedDate: new FormControl(
                purchasedDate,
                Validators.required
              ),
              businessType: new FormControl(businessType, Validators.required),
              paymentType: new FormControl(paymentType, Validators.required),
              listOfItems: listOfItems
            });
          }
        }
      });

      // //console.log(order);
    }
  }
  onRefresh() {
    setTimeout(() => {
      this.getRadioButton("Buy");
    }, 1500);
    setTimeout(() => {
      this.getRadioButton("Sell");
    }, 1500);
    //this.getRadioButton('Buy')
    // //console.log('onRefresh')
    // //console.log(this.orderForm.value.businessType)
    // let val_RadioButton=this.orderForm.value.businessType;
    // //console.log('onRefresh_1')
    // this.getRadioButton(val_RadioButton)
    // //console.log(val_RadioButton)
    // this.getRadioButton(this.radioButtonVal);
    if (this.orderForm.value.businessType == "Buy") {
      setTimeout(() => {
        this.getRadioButton("Buy");
      }, 1500);
    } else {
      setTimeout(() => {
        this.getRadioButton("Sell");
      }, 1500);
    }
    setTimeout(() => {
      this.refreshButton = true;
    }, 2000);
    setTimeout(() => {
      this.refreshButton = false;
    }, 1500);
  }
  getRadioButtonPayment(value) {
    this.radioButtonPaymentVal = value;

    //console.log(value);
  }
  getRadioButton(value) {
    this.radioButtonVal = value;
    // this.radioButtonVal_previous=value;
    // //console.log(value);
    this.billingNotStarted = false;
    // //console.log(this.billingNotStarted);
    // //console.log(this.orderForm.value.listOfItems);

    this.radioCount = this.radioCount + 1;
    if (this.radioCount > 1 && this.radioButtonVal_array.pop() != value) {
      let ar = this.orderForm.value.listOfItems;
      let itemsAr = this.items;
      this.updatedOrder_Data_Array = [];
      if (ar.length > 0 && itemsAr.length > 0) {
        for (let i = 0; i < ar.length; i++) {
          for (let j = 0; j < itemsAr.length; j++) {
            if (itemsAr[j].itemName == ar[i].unititem) {
              let selectedIndex_itemsAr = this.items.findIndex(
                p => p.itemName === ar[i].unititem
              );

              this.updatedOrder_Data_Array.push({
                _id: ar[i]._id,
                item_id: this.items[selectedIndex_itemsAr]._id,
                itemName: this.items[selectedIndex_itemsAr].itemName,
                itemCostPrice: this.items[selectedIndex_itemsAr].itemCostPrice,
                itemSellingPrice: this.items[selectedIndex_itemsAr]
                  .itemSellingPrice,
                item_qty: this.items[selectedIndex_itemsAr].itemQuantity,
                quantity: Number(ar[i].quantity),
                quantity_copy: Number(this.orderDataArray[i].quantity_copy),
                cpCost: Number(
                  (
                    this.items[selectedIndex_itemsAr].itemCostPrice *
                    ar[i].quantity
                  ).toFixed(2)
                ),
                spCost: Number(
                  (
                    this.items[selectedIndex_itemsAr].itemSellingPrice *
                    ar[i].quantity
                  ).toFixed(2)
                ),
                profit: Number(
                  (
                    (this.items[selectedIndex_itemsAr].itemSellingPrice -
                      this.items[selectedIndex_itemsAr].itemCostPrice) *
                    ar[i].quantity
                  ).toFixed(2)
                ),
                itemHSN: this.items[selectedIndex_itemsAr].itemHSN
              });
            }
          }
        }
      }
      this.orderDataArray = this.updatedOrder_Data_Array;
      //console.log("getRadioButton");

      for (let index = 0; index < this.orderDataArray.length; index++) {
        //console.log(this.orderDataArray[index].cpCost);
        //console.log(this.orderDataArray[index].spCost);

        if (this.radioButtonVal == "Buy") {
          (<FormArray>this.orderForm.get("listOfItems"))
            .at(index)
            .get("amount")
            .patchValue(this.orderDataArray[index].cpCost);
        } else {
          (<FormArray>this.orderForm.get("listOfItems"))
            .at(index)
            .get("amount")
            .patchValue(this.orderDataArray[index].spCost);
        }
      }

      this.getTotalCost(this.orderDataArray);
      this.getTotalProfit(this.orderDataArray);
    }
    if (this.radioButtonVal_array.length == 0) {
      this.radioButtonVal_array.push(value);
    }
  }

  onAdd_listOfItems() {
    (<FormArray>this.orderForm.get("listOfItems")).push(
      new FormGroup({
        unititem: new FormControl(null, Validators.required),
        quantity: new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]\d*(\.\d+)?$/)
        ]),
        amount: new FormControl(null, Validators.required)
      })
    );
    const controls = <FormArray>this.orderForm.controls["listOfItems"];
    this.ManageNameControl(controls.length - 1);
    this.isReady = true;

    this.enteredQuantity = 0;
    this.selectedItemSellingPrice = 0;
    this.selected_item_qty = 0;
    this.selected_itemHSN = "";
    this.selectedItemCostPrice = 0;
    this.selected_item_id = "";
    this.orderDataArray.push({
      _id: null,
      item_id: "",
      itemName: "",
      itemCostPrice: 0,
      itemSellingPrice: 0,
      item_qty: 0,
      quantity: 0.0,
      quantity_copy: 0.0,
      cpCost: 0,
      spCost: 0,
      profit: 0,
      itemHSN: ""
    });
    // this.totalCost=
  }
  // ngOnChanges() {
  //   //console.log("checking on changes");
  // }

  getTotalCost(inputArray: any) {
    this.totalCost = 0;
    //console.log(inputArray);
    for (let i = 0; i < inputArray.length; i++) {
      if (this.radioButtonVal == "Buy") {
        this.totalCost = this.totalCost + inputArray[i].cpCost;
      } else {
        this.totalCost = this.totalCost + inputArray[i].spCost;
      }
      // this.totalCost = this.totalCost + inputArray[i].cost;
    }
    //console.log(this.totalCost);
  }

  getTotalProfit(inputArray: any) {
    this.totalProfit = 0;
    //console.log(inputArray);
    for (let i = 0; i < inputArray.length; i++) {
      if (this.radioButtonVal == "Buy") {
        this.totalProfit = 0;
      } else {
        this.totalProfit = this.totalProfit + inputArray[i].profit;
      }
    }
  }

  doSomething1(event, index: number) {
    // //console.log(this.lastOrderBillNo);
    //       //console.log(this.maxOrders);
    //       //console.log(this.items);
    //       //console.log(this.genBillNoVal);

    // //console.log(event);
    // //console.log(index);
    // //console.log("on change select ");
    // //console.log(event);
    // //console.log(event);
    this.selectedItemName = event.option.value;
    // //console.log(this.items[this.items.findIndex(p => p.itemName === event.target.value)]);
    // const dropDownSelectedIndex=this.items.findIndex(p => p.itemName === event.target.value);
    // //console.log("checking");
    // //console.log(this.items.findIndex(p => p.itemName === event));
    this.selectedIndex = this.items.findIndex(
      p => p.itemName === this.selectedItemName
    );
    if (this.selectedIndex != -1) {
      // this.selectedItemPrice = this.items[this.selectedIndex].itemPrice;
      this.selectedItemCostPrice = this.items[this.selectedIndex].itemCostPrice;
      this.selectedItemSellingPrice = this.items[
        this.selectedIndex
      ].itemSellingPrice;
      this.selected_item_id = this.items[this.selectedIndex]._id;
      this.selected_item_qty = this.items[this.selectedIndex].itemQuantity;
      this.selected_itemHSN = this.items[this.selectedIndex].itemHSN;
      // if(this.radioButtonVal=='Buy'){
      //   this.selectedItemPrice=this.selectedItemCostPrice;
      // }
      // else{
      //   this.selectedItemPrice=this.selectedItemSellingPrice;
      // }
    } else {
      this.selectedItemCostPrice = 0;
      this.selectedItemSellingPrice = 0;
      this.selected_item_id = "";
      this.selected_item_qty = 0;
      this.selected_itemHSN = "";
    }
    let ctr = (<FormArray>this.orderForm.get("listOfItems"))
      .at(index)
      .get("amount")
      .disable();
    if (this.radioButtonVal == "Buy") {
      (<FormArray>this.orderForm.get("listOfItems"))
        .at(index)
        .get("amount")
        .patchValue(
          Number((this.enteredQuantity * this.selectedItemCostPrice).toFixed(2))
        );
    } else {
      (<FormArray>this.orderForm.get("listOfItems"))
        .at(index)
        .get("amount")
        .patchValue(
          Number(
            (this.enteredQuantity * this.selectedItemSellingPrice).toFixed(2)
          )
        );
    }

    // //console.log("getting formarray index value");
    // //console.log(
    //   (<FormArray>this.orderForm.get("listOfItems")).at(index).get("quantity")
    // );
    // //console.log(
    //   Object.keys(
    //     (<FormArray>this.orderForm.get("listOfItems")).at(index).get("quantity")
    //   )
    // );
    //   //console.log(Object.values((<FormArray>this.orderForm.get("listOfItems"))
    // .at(index)
    // .get("quantity")))
    // //console.log(
    //   (<FormArray>this.orderForm.get("listOfItems")).at(index).get("quantity")
    //     .value
    // );
    this.orderDataArray[index].item_id = this.selected_item_id;
    this.orderDataArray[index].item_qty = this.selected_item_qty;
    this.orderDataArray[index].itemName = this.selectedItemName;
    this.orderDataArray[index].itemSellingPrice = this.selectedItemSellingPrice;
    this.orderDataArray[index].itemCostPrice = this.selectedItemCostPrice;
    this.orderDataArray[index].quantity_copy = this.orderDataArray[
      index
    ].quantity_copy;

    this.orderDataArray[index].quantity = this.enteredQuantity;
    this.orderDataArray[index].cpCost = Number(
      (this.enteredQuantity * this.selectedItemCostPrice).toFixed(2)
    );
    this.orderDataArray[index].spCost = Number(
      (this.enteredQuantity * this.selectedItemSellingPrice).toFixed(2)
    );
    this.orderDataArray[index].profit = Number(
      (
        (this.selectedItemSellingPrice - this.selectedItemCostPrice) *
        this.enteredQuantity
      ).toFixed(2)
    );
    this.orderDataArray[index].itemHSN = this.selected_itemHSN;
    this.getTotalCost(this.orderDataArray);
    this.getTotalProfit(this.orderDataArray);
    //console.log("doSomething1 -> orderArray");
    //console.log(this.orderDataArray);
  }

  doSomething2(event, index: number) {
    //console.log(event);
    //console.log(index);
    if (this.selectedIndex != -1) {
      this.selectedItemCostPrice = this.items[this.selectedIndex].itemCostPrice;
      this.selectedItemSellingPrice = this.items[
        this.selectedIndex
      ].itemSellingPrice;
      this.selected_item_id = this.items[this.selectedIndex]._id;
      this.selected_item_qty = this.items[this.selectedIndex].itemQuantity;
      this.selected_itemHSN = this.items[this.selectedIndex].itemHSN;
    } else {
      this.selectedItemCostPrice = 0;
      this.selectedItemSellingPrice = 0;
      this.selected_item_id = "";
      this.selected_item_qty = 0;
      this.selected_itemHSN = "";
    }
    this.enteredQuantity = event;

    // //console.log(this.enteredQuantity * this.selectedItemPrice);

    // (<FormGroup>(<FormArray>this.orderForm.get('amount')).at(index))
    //     .addControl('amount', this._fb.control(event.target.value*selectedItemPrice,[]));

    // //console.log(selectedItemPrice)
    // //console.log('this.selectedIndex')
    // //console.log(this.selectedIndex)

    //console.log(this.orderForm.get("listOfItems").value[index].quantity);
    //important
    let ctr = (<FormArray>this.orderForm.get("listOfItems"))
      .at(index)
      .get("amount")
      .disable();
    if (this.radioButtonVal == "Buy") {
      (<FormArray>this.orderForm.get("listOfItems"))
        .at(index)
        .get("amount")
        .patchValue(
          Number((this.enteredQuantity * this.selectedItemCostPrice).toFixed(2))
        );
    } else {
      (<FormArray>this.orderForm.get("listOfItems"))
        .at(index)
        .get("amount")
        .patchValue(
          Number(
            (this.enteredQuantity * this.selectedItemSellingPrice).toFixed(2)
          )
        );
    }
    this.orderDataArray[index].item_id = this.selected_item_id;
    this.orderDataArray[index].item_qty = this.selected_item_qty;
    this.orderDataArray[index].itemName = this.selectedItemName;
    this.orderDataArray[index].itemSellingPrice = this.selectedItemSellingPrice;
    this.orderDataArray[index].itemCostPrice = this.selectedItemCostPrice;
    this.orderDataArray[index].quantity = Number(this.enteredQuantity);
    this.orderDataArray[index].quantity_copy = this.orderDataArray[
      index
    ].quantity_copy;
    this.orderDataArray[index].cpCost = Number(
      (this.enteredQuantity * this.selectedItemCostPrice).toFixed(2)
    );
    this.orderDataArray[index].spCost = Number(
      (this.enteredQuantity * this.selectedItemSellingPrice).toFixed(2)
    );
    this.orderDataArray[index].profit = Number(
      (
        (this.selectedItemSellingPrice - this.selectedItemCostPrice) *
        this.enteredQuantity
      ).toFixed(2)
    );
    this.orderDataArray[index].itemHSN = this.selected_itemHSN;
    this.getTotalCost(this.orderDataArray);
    this.getTotalProfit(this.orderDataArray);
    //console.log("doSomething2 -> orderArray");
    //console.log(this.orderDataArray);
  }

  onClickAmountBoxDisable(index: number) {
    (<FormArray>this.orderForm.get("listOfItems"))
      .at(index)
      .get("amount")
      .disable();
  }

  hasPhaseValue1At(index) {
    return (<FormGroup>(
      (<FormArray>this.orderForm.get("listOfItems")).at(index)
    )).get("quantity")
      ? true
      : false;
  }

  onDelete_listOfItems(index: number) {
    (<FormArray>this.orderForm.get("listOfItems")).removeAt(index);
    this.orderDataArray.splice(index, 1);
    this.getTotalCost(this.orderDataArray);
    this.getTotalProfit(this.orderDataArray);
    this.filteredOptions.splice(index, 1);
  }

  get controls() {
    // a getter!
    return (<FormArray>this.orderForm.get("listOfItems")).controls;
  }

  constructor(
    private itemsService: ItemsService,
    private _fb: FormBuilder,
    private ordersService: OrdersService,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private urlService: UrlService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      this.prev_URl = previousUrl;
      //console.log("NEW ORDER previous url: ", previousUrl);
    });
    //this.items = this.itemsService.getDropDownListItems();
    //above line to be commented

    this.itemsService.getItemsForDropDownList();
    this.itemSub = this.itemsService
      .getItemUpdateListener()
      .subscribe((itemData: { items: Item[]; itemCount: number }) => {
        this.items = itemData.items;

        this.options = [];
        for (const [i, v] of <any>this.items.entries()) {
          this.options[i] = v.itemName;
        }
        //console.log(this.options);
        // //console.log(this.items);
      });

    this.ordersService.getCustomerInfo().subscribe(customerInfo => {
      this.customer = customerInfo;
      //console.log(this.customer);
    });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("orderId")) {
        this.editMode = true;
        this.orderId = paramMap.get("orderId");
        this.isLoading = true;
      }
    });
    /*if (!this.editMode) {
      this.ordersService.getLastOrderBillNo();
      this.lastOrderBillSub = this.ordersService
        .getlastOrderInfoUpdateListener()
        .subscribe(
          (lastOrderData: {
            message: string;
            lastOrderBillNo: string;
            maxOrders: number;
          }) => {
            //this.isLoading = false;
            this.lastOrderBillNo = lastOrderData.lastOrderBillNo;
            this.maxOrders = lastOrderData.maxOrders;
            // //console.log(this.lastOrderBillNo);
            // //console.log(this.maxOrders);
            // let lastBillNo = "";
            let maxOrderCount = this.maxOrders;
            let lastBillNo_num = 0;
            let billNoAr = this.lastOrderBillNo.split("-");
            //console.log(billNoAr);
            for (let i = 0; i < billNoAr.length; i++) {
              if (this.isNumeric(billNoAr[i].trim())) {
                //console.log(billNoAr[i]);
                lastBillNo_num = Number(billNoAr[i].trim());
                //console.log(lastBillNo_num);
                //if(lastBillNo_num!=0){
                if (lastBillNo_num >= maxOrderCount) {
                  this.genBillNoVal =
                    "AZ-" + this.padLeft(lastBillNo_num + 1, 5, "0");
                  //console.log("last bill no");
                } else {
                  this.genBillNoVal =
                    "AZ-" + this.padLeft(maxOrderCount + 1, 5, "0");
                  //console.log("max order");
                }
                //console.log(this.genBillNoVal);
                //}
              }
            }
          }
        );
    }*/

    // //console.log(this.lastOrderBillNo);
    //     //console.log(this.maxOrders);
    //     //console.log(this.items);
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.initForm();
  }
  displayFn(itemName: string): string | undefined {
    this.selectedItemName = itemName;
    return itemName;
  }
  ManageNameControl(index: number) {
    var arrayControl = this.orderForm.get("listOfItems") as FormArray;
    this.filteredOptions[index] = arrayControl
      .at(index)
      .get("unititem")
      .valueChanges.pipe(
        startWith(""),
        map(value => this._filter(value))
      );
  }
  private _filter(itemName: string): string[] {
    //const filterValue = name.toLowerCase();
    const filterValue = this._normalizeValue(itemName);
    return this.options.filter(option =>
      this._normalizeValue(option).includes(filterValue)
    );
  }
  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, "");
  }
  onCancel() {
    //console.log("cancelled");
    this.router.navigate(["/orders/all"]);
    // this.orderForm.reset();
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
  isNumeric(num) {
    return !isNaN(num);
  }
  padLeft(nr, n, str) {
    return Array(n - String(nr).length + 1).join(str || "0") + nr;
  }
  getAmountFromTransaction(transValue) {
    let amount = 0;
    let b = transValue.split(";");
    for (let i = 0; i < b.length; i++) {
      let c = b[i].split("=");
      for (let j = 0; j < c.length; j++) {
        if (c[j].includes("(")) {
          let d = c[j].split("(");
          for (let k = 0; k < d.length; k++) {
            if (this.isNumeric(d[k].trim())) {
              amount += Number(d[k].trim());
            }
          }
        }
      }
    }
    return amount;
  }

  onSubmit() {
    for (const [i, v] of this.orderForm.value.listOfItems.entries()) {
      //console.log(i, v.unititem);
      //console.log(this.options.includes(v.unititem));

      if (!this.options.includes(v.unititem)) {
        this.result.push(
          v.unititem + " entered at item postion " + (i + 1).toString()
        );
      }
    }
    let outputResult: string[] = [];
    if (this.result.length > 1) {
      //alert(this.result.toString().replace(',','\n'));
      // alert(
      //   this.result
      //     .toString()
      //     .split(",")
      //     .join("\n")
      // );
      outputResult = this.result;
      this.dialog.open(ErrorComponent, {
        data: {
          message: this.result
            .toString()
            .split(",")
            .join(",\n")
        }
      });
      this.result = ["Kindly remove the invalid entries:\n"];
    }
    let transactionValueVar = "";
    if (this.editMode) {
      transactionValueVar = this.transactionValue;
      //console.log(this.transactionValue);
      //console.log(this.getAmountFromTransaction(this.transactionValue));
      //console.log(this.orderForm.value.amountPaid);
      if (
        this.getAmountFromTransaction(this.transactionValue) !=
        this.orderForm.value.amountPaid
      ) {
        transactionValueVar =
          this.transactionValue +
          this.dateConverter(this.getTodaysDate()) +
          "\t= " +
          (
            this.orderForm.value.amountPaid -
            this.getAmountFromTransaction(this.transactionValue)
          )
            .toFixed(2)
            .toString() +
          " (" +
          this.radioButtonPaymentVal +
          ")<br>";
      }
    } else {
      transactionValueVar =
        this.dateConverter(this.getTodaysDate()) +
        "\t= " +
        this.orderForm.value.amountPaid.toFixed(2).toString() +
        " (" +
        this.radioButtonPaymentVal +
        ")<br>";
    }
    //console.log(this.transactionValue);
    let billNoVal_final;
    if (this.editMode) {
      billNoVal_final = this.billNoValue;
    } else {
      billNoVal_final = this.genBillNoVal;
      // //console.log(this.ordersService.getIdInfo());
    }
    //console.log(this.genBillNoVal);

    let data: Order = {
      _id: this.orderId,
      billNo: this.genBillNoVal,
      clientName: this.orderForm.value.clientName,
      clientPhoneNo: this.orderForm.value.clientPhoneNo,
      clientAddress: this.orderForm.value.clientAddress,
      clientGSTIN: this.orderForm.value.clientGSTIN,
      isInvoiceCreated: this.isInvoiceCreated_value,
      relatedInvoiceId: this.relatedInvoiceId_value,
      totalCost: Number(this.totalCost.toFixed(2)),
      totalProfit: Number(this.totalProfit.toFixed(2)),
      paymentType: this.orderForm.value.paymentType,
      amountPaid: this.orderForm.value.amountPaid,
      purchasedDate: this.orderForm.value.purchasedDate,
      lastUpdatedDate: this.getTodaysDate(),
      businessType: this.orderForm.value.businessType,
      businessType_copy: this.businessType_copy_Val,
      transaction: transactionValueVar,
      listOfItems: this.orderDataArray,
      creator: null
    };
    // if (!this.editMode) {
    //   console.log(
    //     this.dateConverter(this.getTodaysDate()) +
    //       "\t= " +
    //       data.totalCost.toString()
    //   );
    // } else {
    //   console.log(
    //     this.dateConverter(this.getTodaysDate()) +
    //       "\t= " +
    //       data.totalCost.toString()
    //   );
    // }
    // //console.log(this.dateConverter(this.getTodaysDate())+'\t\t\t= '+data.totalCost.toString())

    // //console.log(data);
    // //console.log("checking for invalid")
    // //console.log(this.result.length);
    if (this.orderForm.invalid || outputResult.length > 1) {
      return;
    }
    this.isLoading = true;
    if (!this.editMode) {
      this.ordersService.addOrder(data);
    } else {
      this.ordersService.updateOrder(data);
    }
    // //console.log(item);
    // this.orderForm.reset();
  }

  ngOnDestroy() {
    this.itemSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    // if (!this.editMode) {
    //   this.lastOrderBillSub.unsubscribe();
    // }
  }
}
