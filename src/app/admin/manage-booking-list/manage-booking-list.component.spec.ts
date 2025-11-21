import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBookingListComponent } from './manage-booking-list.component';

describe('ManageBookingListComponent', () => {
  let component: ManageBookingListComponent;
  let fixture: ComponentFixture<ManageBookingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageBookingListComponent]
    });
    fixture = TestBed.createComponent(ManageBookingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
