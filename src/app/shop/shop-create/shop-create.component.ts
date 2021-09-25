import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Observable } from "rxjs";
import { UrlService } from "../../shared/url.service";
import { ShopService } from "../shop.service";
import { Shop } from "../shop.model";
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: "app-shop-create",
  templateUrl: "./shop-create.component.html",
  styleUrls: ["./shop-create.component.css"]
})
export class ShopCreateComponent implements OnInit, OnDestroy {
  previousUrl: Observable<string> = this.urlService.previousUrl$;
  private authStatusSub: Subscription;
  isLoading = false;
  shop: Shop;
  shopName = "";
  shopPhoneNo = "";
  editMode = false;
  form: FormGroup;
  phoneNoError = false;
  private shopId: string;

  constructor(
    private shopService: ShopService,
    public activatedRoute: ActivatedRoute,
    private urlService: UrlService,
    private router: Router,
    private authService: AuthService
  ) {}
  onCancel() {
    ////console.log("cancelled");
    this.router.navigate(["/shops/all"]);
    // this.orderForm.reset();
  }

  ngOnInit() {
    this.urlService.previousUrl$.subscribe((previousUrl: string) => {
      //console.log("previous url: ", previousUrl);
    });
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });

    this.form = new FormGroup({
      shopName: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      shopPhoneNo: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$"),
          Validators.minLength(10),
          Validators.maxLength(10)
        ]
      }),
      shopEmail: new FormControl(null, {
        validators: [
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")
        ]
      }),
      shopAddress: new FormControl(null, { validators: [] }),
      shopGSTIN: new FormControl(null),
      shopConditions: new FormControl(null)
    });
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("shopId")) {
        this.editMode = true;
        this.shopId = paramMap.get("shopId");
        this.isLoading = true;
        this.shopService.getShop(this.shopId).subscribe(shopData => {
          this.isLoading = false;
          //console.log(shopData);
          const transformedShopData: any = shopData;
          this.shop = transformedShopData;
          this.form.setValue({
            shopName: this.shop.shopName,
            shopPhoneNo: this.shop.shopPhoneNo,
            shopAddress: this.shop.shopAddress,
            shopEmail: this.shop.shopEmail,
            shopGSTIN: this.shop.shopGSTIN,
            shopConditions: this.shop.shopConditions
          });
          //console.log(this.shop);
        });
      } else {
        this.editMode = false;
        this.shopId = null;
      }
    });
  }

  onSaveShop() {
    //console.log(this.form.value);
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    const shop: Shop = {
      _id: this.shopId,
      shopName: this.form.value.shopName,
      shopPhoneNo: this.form.value.shopPhoneNo,
      shopAddress: this.form.value.shopAddress,
      shopEmail: this.form.value.shopEmail,
      shopGSTIN: this.form.value.shopGSTIN,
      shopConditions: this.form.value.shopConditions,
      creator: ""
    };
    if (!this.editMode) {
      this.shopService.addShop(shop);
    } else {
      this.shopService.updateShop(shop);
    }
    //console.log(this.form.value);
    this.form.reset();
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
