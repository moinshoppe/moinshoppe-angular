import { NgModule } from '@angular/core';

import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatCardModule } from "@angular/material/card";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatInputModule } from "@angular/material/input";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatRadioModule } from "@angular/material/radio";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatDialogModule } from "@angular/material/dialog";


@NgModule({
    exports:[
        MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		MatMenuModule,
		MatCardModule,
		MatGridListModule,
		MatInputModule,
		MatExpansionModule,
		MatProgressSpinnerModule,
		MatPaginatorModule,
		MatSelectModule,
		MatRadioModule,
		MatButtonToggleModule,
		MatCheckboxModule,
		MatAutocompleteModule,
		MatDialogModule
      ]
  })
  export class AngularMaterialModule { } 