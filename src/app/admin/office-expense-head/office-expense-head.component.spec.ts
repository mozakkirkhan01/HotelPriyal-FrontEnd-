import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeExpenseHeadComponent } from './office-expense-head.component';

describe('OfficeExpenseHeadComponent', () => {
  let component: OfficeExpenseHeadComponent;
  let fixture: ComponentFixture<OfficeExpenseHeadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OfficeExpenseHeadComponent]
    });
    fixture = TestBed.createComponent(OfficeExpenseHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
