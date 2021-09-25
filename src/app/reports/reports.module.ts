import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AngularMaterialModule } from "../angular-material.module";

import { ReportsComponent } from "./reports.component";
import { ExportExcelService } from "../shared/export-excel.service";

@NgModule({
  declarations: [ReportsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule
  ],
  providers: [ExportExcelService]
})
export class ReportsModule {}
