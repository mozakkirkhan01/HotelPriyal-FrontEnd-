import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingListTodayComponent } from './billing-list-today.component';

describe('BillingListTodayComponent', () => {
  let component: BillingListTodayComponent;
  let fixture: ComponentFixture<BillingListTodayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BillingListTodayComponent]
    });
    fixture = TestBed.createComponent(BillingListTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
