import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeTransactionComponent } from './office-transaction.component';

describe('OfficeTransactionComponent', () => {
  let component: OfficeTransactionComponent;
  let fixture: ComponentFixture<OfficeTransactionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OfficeTransactionComponent]
    });
    fixture = TestBed.createComponent(OfficeTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
