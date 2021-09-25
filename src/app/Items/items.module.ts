import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AngularMaterialModule } from "../angular-material.module";

import { ItemsComponent } from "./items.component";
import { ItemCreateComponent } from "./item-create/item-create.component";
import { ItemsListComponent } from "./items-list/items-list.component";
import { ItemsService } from "../Items/items.service";

@NgModule({
  declarations: [ItemsComponent, ItemCreateComponent, ItemsListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule
  ],
  providers: [ItemsService]
})
export class ItemsModule {}
