import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "../../auth/auth.service";
import { Observable } from "rxjs";
import { MatDialog } from '@angular/material/dialog';
import { UrlService } from "../../shared/url.service";
import { CustomersService } from "../customers.service";
import { Customer } from "../customer.model";
import { ErrorComponent } from "../../error/error.component";
@Component({
  selector: "app-customer-create",
  templateUrl: "./customer-create.component.html",
  styleUrls: ["./customer-create.component.css"]
})
export class CustomerCreateComponent implements OnInit, OnDestroy {
  previousUrl: Observable<string> = this.urlService.previousUrl$;
  result = ["Kindly re-enter the customer phone No:\n"];
  private authStatusSub: Subscription;
  private customersPhoneNosSub: Subscription;
  isLoading = false;
  customersPhoneNos:any[]=[];
  customersPhoneNos_array:string[]=[];
  customer: Customer;
  customerName = "";
  customerPhoneNo = "";
  editMode = false;
  form: FormGroup;
  phoneNoError = false;
  private customerId: string;

  constructor(
    private customersService: CustomersService,
    public activatedRoute: ActivatedRoute,
    private urlService: UrlService,
    private router: Router,
    private authService: AuthService,
    private dialog:MatDialog
  ) {}

  ngOnInit() {
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      //console.log("previous url: ", previousUrl);
    });

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });


this.customersService.getCustomersPhoneNo();
this.customersPhoneNosSub = this.customersService
      .getCustomerPhoneNosUpdateListener()
      .subscribe((customerPhoneNosData) => {
        this.customersPhoneNos = customerPhoneNosData.customersPhoneNos;
        //console.log(this.customersPhoneNos)
        this.customersPhoneNos_array = [];
for (const [i, v] of <any>this.customersPhoneNos.entries()) {
  this.customersPhoneNos_array[i] = v.customerPhoneNo;
}
//console.log(this.customersPhoneNos_array);
      });
 
    this.form = new FormGroup({
      customerName: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      customerPhoneNo: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),
          Validators.minLength(10),
          Validators.maxLength(10)
        ]
      }),
      customerEmail: new FormControl(null, {
        validators: [
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
        ]
      }),
      customerAddress: new FormControl(null, { validators: [] }),
      customerGSTIN: new FormControl(null)
    });
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("customerId")) {
        this.editMode = true;
        this.customerId = paramMap.get("customerId");
        this.isLoading = true;
        this.customersService
          .getCustomer(this.customerId)
          .subscribe(customerData => {
            this.isLoading = false;
            //console.log(customerData);
            const transformedCustomerData: any = customerData;
            this.customer = transformedCustomerData;
            this.form.setValue({
              customerName: this.customer.customerName,
              customerPhoneNo: this.customer.customerPhoneNo,
              customerAddress: this.customer.customerAddress,
              customerEmail: this.customer.customerEmail,
              customerGSTIN: this.customer.customerGSTIN
            });
            //console.log(this.customer);
          });
      } else {
        this.editMode = false;
        this.customerId = null;
      }
    });
  }

  onCancel() {
    ////console.log("cancelled");
    this.router.navigate(["/customers/all"]);
    // this.orderForm.reset();
  }

  onSaveCustomer() {
    if(!this.editMode && this.customersPhoneNos_array.length>0 && this.customersPhoneNos_array.includes(this.form.value.customerPhoneNo)){
this.dialog.open(ErrorComponent,{data:{message: this.form.value.customerPhoneNo+" - Phone No. already exists. Kindly update it."}})
    }
    //console.log(this.form.value);
    if (this.form.invalid || (!this.editMode &&this.customersPhoneNos_array.length>0 && this.customersPhoneNos_array.includes(this.form.value.customerPhoneNo))) {
      return;
    }
    this.isLoading = true;
    const customer: Customer = {
      _id: this.customerId,
      customerName: this.form.value.customerName,
      customerPhoneNo: this.form.value.customerPhoneNo,
      customerAddress: this.form.value.customerAddress,
      customerEmail: this.form.value.customerEmail,
      customerGSTIN: this.form.value.customerGSTIN,
      creator: null
    };
    if (!this.editMode) {
      this.customersService.addCustomer(customer);
    } else {
      this.customersService.updateCustomer(customer);
    }
    //console.log(this.form.value);
    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.customersPhoneNosSub.unsubscribe();
  }
}
