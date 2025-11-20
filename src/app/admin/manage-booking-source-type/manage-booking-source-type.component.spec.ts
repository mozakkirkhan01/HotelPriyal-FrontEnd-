import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBookingSourceTypeComponent } from './manage-booking-source-type.component';

describe('ManageBookingSourceTypeComponent', () => {
  let component: ManageBookingSourceTypeComponent;
  let fixture: ComponentFixture<ManageBookingSourceTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageBookingSourceTypeComponent]
    });
    fixture = TestBed.createComponent(ManageBookingSourceTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
