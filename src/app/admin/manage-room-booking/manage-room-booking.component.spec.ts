import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRoomBookingComponent } from './manage-room-booking.component';

describe('ManageRoomBookingComponent', () => {
  let component: ManageRoomBookingComponent;
  let fixture: ComponentFixture<ManageRoomBookingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageRoomBookingComponent]
    });
    fixture = TestBed.createComponent(ManageRoomBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
