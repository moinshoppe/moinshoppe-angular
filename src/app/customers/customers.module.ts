import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../angular-material.module';

import { CustomersComponent } from "./customers.component";
import { CustomersListComponent } from "./customers-list/customers-list.component";
import { CustomersService } from "./customers.service";
import { CustomerCreateComponent } from "./customer-create/customer-create.component";

@NgModule({
    declarations :[
		CustomersComponent,
		CustomerCreateComponent,
		CustomersListComponent
      ],
      imports:[
        CommonModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule
      ],
      providers:[
        CustomersService
      ]
  })
  export class CustomersModule { }