import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRoomBookingListComponent } from './manage-room-booking-list.component';

describe('ManageRoomBookingListComponent', () => {
  let component: ManageRoomBookingListComponent;
  let fixture: ComponentFixture<ManageRoomBookingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageRoomBookingListComponent]
    });
    fixture = TestBed.createComponent(ManageRoomBookingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
