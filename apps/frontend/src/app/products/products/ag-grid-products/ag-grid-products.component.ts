import { Component, input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'app-ag-grid-products',
  imports: [AgGridAngular],
  template: `
    <ag-grid-angular
      class="ag-theme-alpine products-grid"
      theme="legacy"
      [rowData]="rowData()"
      [columnDefs]="columnsToDisplay()"
      style="height: 500px; width: 100%;"
    />
  `,
  styleUrl: './ag-grid-products.component.css',
})
export class AgGridProductsComponent {
  // Column Definitions: Defines the columns to be displayed.
  columnsToDisplay = input([]);
  // Row Data: The data to be displayed.
  rowData = input([]);
}
