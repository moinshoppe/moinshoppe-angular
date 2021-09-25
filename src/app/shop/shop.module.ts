import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../angular-material.module';

import { ShopComponent } from "./shop.component";
import { ShopCreateComponent } from "./shop-create/shop-create.component";
import { ShopService } from "./shop.service";

@NgModule({
    declarations :[
		ShopComponent,
		ShopCreateComponent
      ],
      imports:[
        CommonModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule
      ],
      providers:[
        ShopService
      ]
  })
export class ShopModule { }