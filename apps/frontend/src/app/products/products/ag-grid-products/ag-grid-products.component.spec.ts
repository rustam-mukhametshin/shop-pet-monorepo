import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridProductsComponent } from './ag-grid-products.component';

describe('AgGridProductsComponent', () => {
  let component: AgGridProductsComponent;
  let fixture: ComponentFixture<AgGridProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgGridProductsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgGridProductsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
