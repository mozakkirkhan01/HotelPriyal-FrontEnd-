import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCancelRoomBookingListComponent } from './manage-cancel-room-booking-list.component';

describe('ManageCancelRoomBookingListComponent', () => {
  let component: ManageCancelRoomBookingListComponent;
  let fixture: ComponentFixture<ManageCancelRoomBookingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageCancelRoomBookingListComponent]
    });
    fixture = TestBed.createComponent(ManageCancelRoomBookingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
