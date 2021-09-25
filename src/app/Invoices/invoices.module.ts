import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../angular-material.module';

import { InvoiceCreateComponent } from "./invoice-create/invoice-create.component";
import { InvoicesListComponent } from "./invoices-list/invoices-list.component";
import { InvoiceViewComponent } from "./invoice-view/invoice-view.component";
import { InvoicesService } from "./invoices.service";

@NgModule({
    declarations :[
		InvoiceCreateComponent,
		InvoicesListComponent,
		InvoiceViewComponent
      ],
      imports:[
        CommonModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule
      ],
      providers:[
        InvoicesService
      ]
  })
export class InvoicesModule { }