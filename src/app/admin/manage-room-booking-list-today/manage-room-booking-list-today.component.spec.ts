import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRoomBookingListTodayComponent } from './manage-room-booking-list-today.component';

describe('ManageRoomBookingListTodayComponent', () => {
  let component: ManageRoomBookingListTodayComponent;
  let fixture: ComponentFixture<ManageRoomBookingListTodayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageRoomBookingListTodayComponent]
    });
    fixture = TestBed.createComponent(ManageRoomBookingListTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
