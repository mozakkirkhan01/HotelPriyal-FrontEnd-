import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeExpenseCategoryComponent } from './office-expense-category.component';

describe('OfficeExpenseCategoryComponent', () => {
  let component: OfficeExpenseCategoryComponent;
  let fixture: ComponentFixture<OfficeExpenseCategoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OfficeExpenseCategoryComponent]
    });
    fixture = TestBed.createComponent(OfficeExpenseCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
