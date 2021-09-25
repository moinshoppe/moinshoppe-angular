import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";
import { HeaderComponent } from "./header/header.component";

import { AngularMaterialModule } from "./angular-material.module";
import { ItemsModule } from "./Items/items.module";
import { OrdersModule } from "./Orders/orders.module";
import { CustomersModule } from "./customers/customers.module";
import { InvoicesModule } from "./Invoices/invoices.module";
import { ShopModule } from "./shop/shop.module";

import { UrlService } from "./shared/url.service";

import { AuthInterceptor } from "./auth/auth-interceptor";
import { ErrorInterceptor } from "./error-interceptor";
import { ErrorComponent } from "./error/error.component";
import { AuthModule } from "./auth/auth.module";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { ReportsModule } from "./reports/reports.module";


@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularMaterialModule,
    ItemsModule,
    OrdersModule,
    CustomersModule,
    InvoicesModule,
    ShopModule,
    ReportsModule,
    AuthModule
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    ErrorComponent,
    ConfirmDialogComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    UrlService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent]
})
export class AppModule {}
