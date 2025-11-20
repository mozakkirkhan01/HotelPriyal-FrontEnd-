import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRoomTypeComponent } from './manage-room-type.component';

describe('ManageRoomTypeComponent', () => {
  let component: ManageRoomTypeComponent;
  let fixture: ComponentFixture<ManageRoomTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageRoomTypeComponent]
    });
    fixture = TestBed.createComponent(ManageRoomTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
