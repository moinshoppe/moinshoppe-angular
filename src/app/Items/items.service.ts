import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
import { Item } from "./item.model";
import { AuthService } from "../auth/auth.service";
import {environment} from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL = ENV_URL + "/items";

@Injectable()
export class ItemsService {
  private items: Item[] = [];
  private itemsUpdated = new Subject<{ items: Item[]; itemCount: number }>();
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  getItems(postsPerPage: number, currentPage: number) {
    // return [...this.items];
    const queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    //console.log(queryParams)
    this.httpClient
      .get<{ message: string; items: Item[]; maxItems: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map(itemData => {
          return {
            items: itemData.items,
            maxItems: itemData.maxItems
          };
        })
      )
      .subscribe(postData => {
        this.items = postData.items;

        //console.log(postData);
        this.itemsUpdated.next({
          items: [...this.items],
          itemCount: postData.maxItems
        });
      });
  }

  getItemsForDropDownList() {
    this.httpClient
      .get<{ message: string; items: Item[]; maxItems: number }>(BACKEND_URL)
      .pipe(
        map(itemData => {
          return {
            items: itemData.items,
            maxItems: itemData.maxItems
          };
        })
      )
      .subscribe(postData => {
        this.items = postData.items;

        //console.log(postData);
        this.itemsUpdated.next({
          items: [...this.items],
          itemCount: postData.maxItems
        });
      });
  }

  getItem(id: string) {
    //console.log(id);

    return this.httpClient.get<{
      _id: string;
      itemName: string;
      itemSellingPrice: number;
      itemCostPrice: number;
      itemQuantity: number;
      creator: string;
      itemHSN: string;
    }>(BACKEND_URL + "/" + id);
  }

  getItemUpdateListener() {
    return this.itemsUpdated.asObservable();
  }

  getItemsWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.items];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    //console.log(queryParams);
    this.httpClient
      .get<{ message: string; items: Item[]; maxItems: number }>(
        BACKEND_URL + "/search" + queryParams
      )
      .pipe(
        map(itemData => {
          //console.log(itemData);
          return {
            items: itemData.items,
            maxItems: itemData.maxItems
          };
        })
      )
      .subscribe(postData => {
        this.items = postData.items;

        //console.log(postData);
        this.itemsUpdated.next({
          items: [...this.items],
          itemCount: postData.maxItems
        });
      });
  }
  addItem(
    itemName: string,
    itemSellingPrice: number,
    itemCostPrice: number,
    itemQuantity: number,
    itemHSN: string
  ) {
    const item: Item = {
      _id: null,
      itemName: itemName,
      itemSellingPrice: itemSellingPrice,
      itemCostPrice: itemCostPrice,
      itemQuantity: itemQuantity,
      creator: null,
      itemHSN: itemHSN
    };
    this.httpClient
      .post<{ message: string; itemId: string }>(BACKEND_URL, item)
      .subscribe(responseData => {
        const item: Item = {
          _id: responseData.itemId,
          itemName: itemName,
          itemSellingPrice: itemSellingPrice,
          itemCostPrice: itemCostPrice,
          itemQuantity: itemQuantity,
          itemHSN: itemHSN,
          creator: this.authService.getUserId()
        };
        this.items.push(item);

        this.itemsUpdated.next({
          items: [...this.items],
          itemCount: this.items.length
        });
        this.router.navigate(["/items"]);
      });
  }

  updateItem(
    _id: string,
    itemName: string,
    itemSellingPrice: number,
    itemCostPrice: number,
    itemQuantity: number,
    itemHSN: string
  ) {
    const item: Item = {
      _id: _id,
      itemName: itemName,
      itemSellingPrice: itemSellingPrice,
      itemCostPrice: itemCostPrice,
      itemQuantity: itemQuantity,
      creator: null,
      itemHSN: itemHSN
    };
    this.httpClient.put(BACKEND_URL + "/" + _id, item).subscribe(response => {
      const updatedItems = [...this.items];
      const oldItemIndex = updatedItems.findIndex(p => p._id === _id);
      const item: Item = {
        _id: _id,
        itemName: itemName,
        itemSellingPrice: itemSellingPrice,
        itemCostPrice: itemCostPrice,
        itemQuantity: itemQuantity,
        itemHSN: itemHSN,
        creator: this.authService.getUserId()
      };
      updatedItems[oldItemIndex] = item;
      this.items = updatedItems;
      // this.postsUpdated.next([...this.posts]);
      this.itemsUpdated.next({
        items: [...this.items],
        itemCount: updatedItems.length
      });
      this.router.navigate(["/items"]);
    });
  }
  updateItemFromOrderService(
    _id: string,
    itemName: string,
    itemSellingPrice: number,
    itemCostPrice: number,
    itemQuantity: number,
    itemHSN: string
  ) {
    const item: Item = {
      _id: _id,
      itemName: itemName,
      itemSellingPrice: itemSellingPrice,
      itemCostPrice: itemCostPrice,
      itemQuantity: itemQuantity,
      creator: null,
      itemHSN: itemHSN
    };
    //console.log("updateItemFromOrderService")
    //console.log(item)
    this.httpClient.put(BACKEND_URL + "/" + _id, item).subscribe(response => {
      //console.log(response);
      //   const updatedItems = [...this.items];
      // const oldItemIndex =  updatedItems.findIndex(p => p._id === _id);
      // const item:Item={
      //   _id:_id,
      //   itemName:itemName,
      //   itemSellingPrice:itemSellingPrice,
      //   itemCostPrice:itemCostPrice,
      //   itemQuantity:itemQuantity,
      //   creator:null
      // }
      // updatedItems[oldItemIndex] = item;
      // this.items=updatedItems;
      // // this.postsUpdated.next([...this.posts]);
      // this.itemsUpdated.next({
      //                               items:[...this.items],
      //                               itemCount: updatedItems.length
      //                             });;
      //  this.router.navigate(["/items"]);
    });
  }
  deleteItem(itemId: string) {
    return this.httpClient.delete(BACKEND_URL + "/" + itemId);
  }
}
