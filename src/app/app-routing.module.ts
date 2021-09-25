import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./auth/auth.guard";
import { LoginComponent } from './auth/login/login.component';	
import { SignupComponent } from './auth/signup/signup.component';
import { ItemsComponent } from "./Items/items.component";
import { ItemCreateComponent } from "./Items/item-create/item-create.component";
import { ItemsListComponent } from "./Items/items-list/items-list.component";
import { OrdersListComponent } from "./Orders/orders-list/orders-list.component";
import { OrderCreateComponent } from "./Orders/order-create/order-create.component";
import { CustomersListComponent } from "./customers/customers-list/customers-list.component";
import { CustomerCreateComponent } from "./customers/customer-create/customer-create.component";
import { InvoicesListComponent } from "./Invoices/invoices-list/invoices-list.component";
import { InvoiceCreateComponent } from "./Invoices/invoice-create/invoice-create.component";
import { InvoiceViewComponent } from "./Invoices/invoice-view/invoice-view.component";
import { ShopComponent } from "./shop/shop.component";
import { ShopCreateComponent } from "./shop/shop-create/shop-create.component";
import { ResetComponent } from "./auth/reset/reset.component";
import { ReportsComponent } from "./reports/reports.component";

const routes: Routes = [
  { path: "", redirectTo: "/items", pathMatch: "full" }, //only redirect if full path is empty
  {
    path: "items",
    component: ItemsComponent,
    canActivate: [AuthGuard],
    children: [
      { path: "new", component: ItemCreateComponent, canActivate: [AuthGuard] }, //after id (new) will be affected
      {
        path: "edit/:itemId",
        component: ItemCreateComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: "orders",
    children: [
      { path: "all", component: OrdersListComponent, canActivate: [AuthGuard] },
      {
        path: "new",
        component: OrderCreateComponent,
        canActivate: [AuthGuard]
      }, //after id (new) will be affected
      {
        path: "edit/:orderId",
        component: OrderCreateComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: "customers",
    children: [
      {
        path: "all",
        component: CustomersListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: "new",
        component: CustomerCreateComponent,
        canActivate: [AuthGuard]
      }, //after id (new) will be affected
      {
        path: "edit/:customerId",
        component: CustomerCreateComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: "invoices",
    children: [
      {
        path: "all",
        component: InvoicesListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: "new",
        component: InvoiceCreateComponent,
        canActivate: [AuthGuard]
      }, //after id (new) will be affected
      {
        path: "edit/:invoiceId",
        component: InvoiceCreateComponent,
        canActivate: [AuthGuard]
      },
      {
        path: "view/:invoiceId",
        component: InvoiceViewComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: "shops",
    children: [
      { path: "all", component: ShopComponent, canActivate: [AuthGuard] },
      { path: "new", component: ShopCreateComponent, canActivate: [AuthGuard] }, //after id (new) will be affected
      {
        path: "edit/:shopId",
        component: ShopCreateComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  { path: "reports", component: ReportsComponent, canActivate: [AuthGuard] },
  {path:'login', component: LoginComponent},
  {path:'regin/shafmoin1520/signup', component: SignupComponent},
  {path:'reset', component: ResetComponent , canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
