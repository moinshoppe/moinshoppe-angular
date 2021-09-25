import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";

import { UrlService } from "../../shared/url.service";
import { ItemsService } from "../items.service";
import { Item } from "../item.model";
import { AuthService } from "../../auth/auth.service";
import { ErrorComponent } from "../../error/error.component";

@Component({
  selector: "app-item-create",
  templateUrl: "./item-create.component.html",
  styleUrls: ["./item-create.component.css"]
})
export class ItemCreateComponent implements OnInit, OnDestroy {
  private authStatusSub: Subscription;
  previousUrl: Observable<string> = this.urlService.previousUrl$;
  isLoading = false;
  item: Item;
  itemName = "";
  itemSellingPrice = "";
  editMode = false;
  form: FormGroup;
  private itemId: string;
  private itemsSub: Subscription;
  items: any[] = [];
  options: string[] = [];
  constructor(
    private itemsService: ItemsService,
    public activatedRoute: ActivatedRoute,
    private urlService: UrlService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}
  onCancel() {
    ////console.log("cancelled");
    this.router.navigate(["/items"]);
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
    this.itemsService.getItemsForDropDownList();
    this.itemsSub = this.itemsService
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
    this.form = new FormGroup({
      itemName: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      itemSellingPrice: new FormControl(null, {
        validators: [Validators.required]
      }),
      itemCostPrice: new FormControl(null, { validators: [] }),
      itemQuantity: new FormControl(null),
      itemHSN:new FormControl(null)
    });
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("itemId")) {
        this.editMode = true;
        this.itemId = paramMap.get("itemId");
        this.isLoading = true;
        this.itemsService.getItem(this.itemId).subscribe(itemData => {
          this.isLoading = false;
          //console.log(itemData);
          const transformedItemData: Item = {
            _id: itemData._id,
            itemName: itemData.itemName,
            itemSellingPrice: itemData.itemSellingPrice,
            itemCostPrice: itemData.itemCostPrice,
            itemQuantity: itemData.itemQuantity,
            creator: itemData.creator,
            itemHSN:itemData.itemHSN
          };
          this.item = transformedItemData;
          this.form.setValue({
            itemName: this.item.itemName,
            itemSellingPrice: this.item.itemSellingPrice,
            itemCostPrice: this.item.itemCostPrice,
            itemQuantity: this.item.itemQuantity,
            itemHSN:this.item.itemHSN
          });
          //console.log(this.item);
        });
      } else {
        this.editMode = false;
        this.itemId = null;
      }
    });
  }

  onSaveItem() {
    //console.log(this.form.value);
    if (
      !this.editMode &&
      this.options.length > 0 &&
      (this.options.map(v => v.toLowerCase())).includes(this.form.value.itemName.toLowerCase())
    ) {
      this.dialog.open(ErrorComponent, {
        data: {
          message:
            this.form.value.itemName +
            " - already exists. Kindly update the Item Name."
        }
      });
    }
    //console.log(this.form.value);
    if (
      this.form.invalid ||
      (!this.editMode &&
        this.options.length > 0 &&
        (this.options.map(v => v.toLowerCase())).includes(this.form.value.itemName.toLowerCase()))
    ) {
      return;
    }
    this.isLoading = true;
    if (
      this.form.value.itemCostPrice == null ||
      this.form.value.itemCostPrice == 0
    ) {
      this.form.value.itemCostPrice = this.form.value.itemSellingPrice;
    }
    if (this.form.value.itemQuantity == null) {
      this.form.value.itemQuantity = 0;
    }
    if (!this.editMode) {
      this.itemsService.addItem(
        this.form.value.itemName,
        this.form.value.itemSellingPrice,
        this.form.value.itemCostPrice,
        this.form.value.itemQuantity,
        this.form.value.itemHSN
      );
    } else {
      this.itemsService.updateItem(
        this.itemId,
        this.form.value.itemName,
        this.form.value.itemSellingPrice,
        this.form.value.itemCostPrice,
        this.form.value.itemQuantity,
        this.form.value.itemHSN
      );
    }
    //console.log(this.form.value);
    this.form.reset();
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.itemsSub.unsubscribe();
  }
}
