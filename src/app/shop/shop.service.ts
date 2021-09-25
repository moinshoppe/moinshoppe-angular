import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
import { Shop } from "./shop.model";
import {environment} from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL = ENV_URL + "/shops";

@Injectable()
export class ShopService {
  private shops: Shop[] = [];
  private shopsUpdated = new Subject<{ shops: Shop[]; shopCount: number }>();
  constructor(private httpClient: HttpClient, private router: Router) {}

  getShops(postsPerPage: number, currentPage: number) {
    // return [...this.shops];
    const queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    //console.log(queryParams);
    this.httpClient
      .get<{ message: string; shops: Shop[]; maxShops: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map(shopData => {
          return {
            shops: shopData.shops,
            maxShops: shopData.maxShops
          };
        })
      )
      .subscribe(postData => {
        this.shops = postData.shops;

        //console.log(postData);
        this.shopsUpdated.next({
          shops: [...this.shops],
          shopCount: postData.maxShops
        });
      });
  }

  getShop(id: string) {
    //console.log(id);

    return this.httpClient.get<{
      shop: Shop;
    }>(BACKEND_URL + "/" + id);
  }

  getShopUpdateListener() {
    return this.shopsUpdated.asObservable();
  }

  addShop(shop: Shop) {
    //const shop: Shop = { _id: null, shopName: shopName, shopSellingPrice: shopSellingPrice,shopCostPrice:shopCostPrice,shopQuantity:shopQuantity };
    this.httpClient
      .post<{ message: string; shopId: string }>(BACKEND_URL, shop)
      .subscribe(responseData => {
        const shop_new: Shop = {
          _id: responseData.shopId,
          shopName: shop.shopName,
          shopPhoneNo: shop.shopPhoneNo,
          shopAddress: shop.shopAddress,
          shopEmail: shop.shopEmail,
          shopGSTIN: shop.shopGSTIN,
          shopConditions: shop.shopConditions,
          creator: null
        };
        this.shops.push(shop_new);

        this.shopsUpdated.next({
          shops: [...this.shops],
          shopCount: this.shops.length
        });
        this.router.navigate(["/shops/all"]);
      });
  }

  updateShop(shop: Shop) {
    const _id = shop._id;
    this.httpClient.put(BACKEND_URL + "/" + _id, shop).subscribe(response => {
      //   const updatedShops = [...this.shops];
      // const oldShopIndex =  updatedShops.findIndex(p => p._id === _id);
      // const shop_new:Shop=shop;
      // updatedShops[oldShopIndex] = shop_new;
      // this.shops=updatedShops;
      // // this.postsUpdated.next([...this.posts]);
      // this.shopsUpdated.next({
      //                               shops:[...this.shops],
      //                               shopCount: updatedShops.length
      //                             });;
      this.router.navigate(["/shops/all"]);
    });
  }

  deleteShop(shopId: string) {
    return this.httpClient.delete(BACKEND_URL + "/" + shopId);
  }
}
