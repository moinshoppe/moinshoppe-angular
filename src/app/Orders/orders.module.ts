import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../angular-material.module';

import { OrderCreateComponent } from "./order-create/order-create.component";
import { OrdersListComponent } from "./orders-list/orders-list.component";
import { OrdersService } from "./orders.service";

@NgModule({
    declarations :[
		OrderCreateComponent,
		OrdersListComponent
      ],
      imports:[
        CommonModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule
      ],
      providers:[
        OrdersService
      ]
  })
  export class OrdersModule { }