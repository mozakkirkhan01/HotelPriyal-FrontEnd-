import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { NgForm } from '@angular/forms';
import { LocalService } from '../../utils/local.service';
import { LoadDataService } from '../../utils/load-data.service';

import {
  BillStatus,
  Status,
  PaymentStatus,
  PaymentMode,
  RoomBookingStatus,
  PaymentType,
  IdType,
} from '../../utils/enum';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-manage-room-booking-list',
  templateUrl: './manage-room-booking-list.component.html',
  styleUrls: ['./manage-room-booking-list.component.css'],
})
export class ManageRoomBookingListComponent {
  BookingSourceTypeList: any = {};
  DueDate: any;
  DuePayment: any;
  Deliverystatus: any = {};
  dataLoading: boolean = false;
  PackageDetialList: any = [];
  PackageDetial: any = {};
  ChargeList: any = [];
  isSubmitted = false;
  StatusList = this.loadData.GetEnumList(Status);
  RoomBookingStatusList = this.loadData.GetEnumList(RoomBookingStatus);
  PaymentModeList = this.loadData.GetEnumList(PaymentMode);
  AllPayemnt = PaymentMode;
  PaymentTypeList = this.loadData.GetEnumList(PaymentType);
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  PaymentModeAll = PaymentMode;
  PaymentTypeAll = PaymentType;
  IdTypeAll = IdType;
  Search: string = '';
  reverse: boolean = true;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = RoomBookingStatus;
  Product: any = {};
  PackageCollectionListall: any[] = [];
  BookingList: any = [];
  BillData: any;
  Packages: any;
  Payments: any;
  SurgeryReceiptModel: any;
  Patient: any;
  Filter: any = {};
  filterModel: any = {};
  BookingTotal: any = {};
  selectedBill: any = {};
  selectedForCancel: any = {};
  selectedBillForCancel: any = {};
  OpticalSellListALL: any = {};
  OpticalSellListPayments: any = {};
  DueBill: any = {};

  // View Modal Properties
  selectedBooking: any = null;
  guestDetails: any = null;
  roomDetails: any;
  paymentDetails: any;

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.resetForm();
    this.getBookingList();
    this.getBookingSourceTypeList();
    this.getHotelList();

    // Initialize pagination defaults
    this.p = 1;
    this.itemPerPage = 10;

    // Initialize filter model
    this.filterModel = {
      StartFrom: null,
      EndFrom: null,
      RoomBookingStatus: 0,
    };
  }

  validiateMenu() {
    var obj: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: this.router.url,
            StaffLoginId: this.staffLogin.StaffLoginId,
          })
        )
        .toString(),
    };
    this.dataLoading = true;
    this.service.validiateMenu(obj).subscribe(
      (response: any) => {
        this.action = this.loadData.validiateMenu(
          response,
          this.toastr,
          this.router
        );
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

  @ViewChild('formDepartment') formPackageCollection: NgForm;
  resetForm() {
    this.PackageDetial = {};
    if (this.formPackageCollection) {
      this.formPackageCollection.control.markAsPristine();
      this.formPackageCollection.control.markAsUntouched();
    }
    this.isSubmitted = false;
    this.PackageDetial.Status = 1;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  getPrint(data: any) {
    // this.service.PrintOpticlalBill(data.OpticalBillingId);
  }

  getBookingList() {
    if (this.filterModel.StartFrom) {
      this.filterModel.StartFrom = this.loadData.loadDateYMD(
        this.filterModel.StartFrom
      );
    }
    if (this.filterModel.EndFrom) {
      this.filterModel.EndFrom = this.loadData.loadDateYMD(
        this.filterModel.EndFrom
      );
    }

    if (this.staffLogin.RoleId != 5) {
      this.filterModel.HotelId = this.staffLogin.HotelId;
    }

    const obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify(this.filterModel))
        .toString(),
    };

    this.dataLoading = true;
    this.service.getBookingList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message === ConstantData.SuccessMessage) {
          this.BookingList = response.BookingList;
          this.BookingTotal.TotalTaxableAmount = response.TotalTaxableAmount;
          this.BookingTotal.TotalGSTAmount = response.TotalGSTAmount;
          this.BookingTotal.TotalDiscountAmount = response.TotalDiscountAmount;
          this.BookingTotal.TotalAmount = response.TotalAmount;
          this.BookingTotal.TotalPaidAmount = response.TotalPaidAmount;
          this.BookingTotal.TotalDuesAmount = response.TotalDuesAmount;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

  DeleteBooking(obj: any) {
    if (confirm('Are you sure you want to delete this record?')) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString(),
      };

      this.dataLoading = true;
      this.service.deleteBooking(request).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.toastr.success('The record has been deleted successfully.');
            this.getBookingList();
          } else {
            this.toastr.error(response.Message);
            this.dataLoading = false;
          }
        },
        (err) => {
          this.toastr.error('An error occurred while deleting the record.');
          this.dataLoading = false;
        }
      );
    }
  }

  editBooking(data: any) {
    this.router.navigate(['/admin/manage-room-booking'], {
      queryParams: {
        id: data.RoomBookingId,
        redUrl: '/admin/manage-room-booking-list',
      },
    });
  }

  openViewModalForCancel(item: any) {
    this.selectedBillForCancel = {}; // Reset
    this.selectedBillForCancel.CancelDate = this.loadData.loadDateYMD(
      new Date()
    );
    this.selectedBillForCancel.RoomBookingId = item.RoomBookingId;
    this.selectedBillForCancel.TotalAmount = item.TotalLineAmount;
    this.selectedBillForCancel.PaidAmount = item.TotalPaidAmount;
    this.selectedBillForCancel.RefundAmount = 0;
    this.selectedBillForCancel.CancelReason = '';

    $('#CancelModal').modal('show');
  }

  CancelBooking() {
    this.isSubmitted = true;

    // Validation
    if (!this.selectedBillForCancel.CancelReason) {
      this.toastr.error('Cancel reason is required');
      return;
    }

    this.selectedBillForCancel.CreatedBy = this.staffLogin.StaffLoginId;
    var request: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify(this.selectedBillForCancel))
        .toString(),
    };

    this.dataLoading = true;
    this.service.cancelBooking(request).subscribe(
      (r1) => {
        let response = r1 as any;
        if (
          response.Message == ConstantData.SuccessMessage ||
          response.Success
        ) {
          this.toastr.success('The booking has been cancelled successfully.');
          $('#CancelModal').modal('hide');
          this.getBookingList();
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('An error occurred while cancelling the booking.');
        this.dataLoading = false;
      }
    );
  }

  // ✅ Load Booking Source Types
  getBookingSourceTypeList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.service.getBookingSourceTypeList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          // Convert array to key-value object for easy lookup
          this.BookingSourceTypeList = {};
          if (Array.isArray(response.BookingSourceTypeList)) {
            response.BookingSourceTypeList.forEach((item: any) => {
              this.BookingSourceTypeList[item.BookingSourceTypeId] =
                item.BookingSourceName;
            });
          }
        } else {
          this.toastr.error(response.Message);
        }
      },
      (err) => {
        this.toastr.error('Error while fetching booking sources');
        console.error(err);
      }
    );
  }

  subGuestDetails: any[] = [];

  openViewModal(item: any) {
    this.selectedBooking = null;
    this.guestDetails = null;
    this.subGuestDetails = []; // ✅
    this.roomDetails = [];
    this.paymentDetails = [];

    $('#viewBookingDetailsModal').modal('show');
    this.getBookingDetails(item.RoomBookingId);
  }

  // ✅ Fetch Booking Details by ID
  getBookingDetails(roomBookingId: number) {
    const obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify(roomBookingId))
        .toString(),
    };

    this.service.getBookingListById(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (
          response.Message === 'Success' ||
          response.Message === ConstantData.SuccessMessage
        ) {
          this.selectedBooking = response.GetRoomBooking;
          this.guestDetails = response.GetGuest;
          this.subGuestDetails = response.GetSubGuests || [];
          this.roomDetails = response.GetRoomDetails || [];
          this.paymentDetails = response.GetPaymentDetails || [];
        } else {
          this.toastr.error(response.Message);
          $('#viewBookingDetailsModal').modal('hide');
        }
      },
      (err) => {
        this.toastr.error('Error while fetching booking details');
        console.error(err);
        $('#viewBookingDetailsModal').modal('hide');
      }
    );
  }

  getHotelList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getHotelList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.HotelList = response.HotelList;
          this.filterHotel = this.HotelList;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

  HotelList: any[] = [];
  filterHotel: any[] = [];
  filterHotelList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.filterHotel = this.HotelList.filter((option: any) =>
        option.HotelName.toLowerCase().includes(filterValue)
      );
    } else {
      this.filterHotel = this.HotelList;
    }
  }

  afterHotelSelected(event: any) {
    this.filterModel.HotelId = event.option.id;
  }

  clearHotel() {
    this.filterModel.HotelId = 0;
    this.filterModel.HotelName = '';
    this.filterHotel = this.HotelList;
  }


  // Add these properties at the top with other declarations
selectedBookingForCheckout: any = null;
checkoutDetails: any = {
  CheckoutDate: null,
  CheckoutTime: null,
  Remarks: ''
};

// Add this method to open the checkout modal
openCheckoutModal(item: any) {
  this.selectedBookingForCheckout = { ...item };
  
  // Set default checkout date and time to current
  const now = new Date();
  this.checkoutDetails = {
    CheckoutDate: this.loadData.loadDateYMD(now),
    CheckoutTime: now.toTimeString().slice(0, 5), // Format: HH:MM
    Remarks: ''
  };

  $('#checkoutModal').modal('show');
}


formatTimeTo12Hour(time: string): string {
  if (!time) return '';

  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);

  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // converts 0 -> 12

  return `${hour}:${minute} ${ampm}`;
}

// Add this method to confirm checkout
confirmCheckout() {

  if (this.selectedBookingForCheckout.TotalDuesAmount > 0) {
    this.toastr.error('Please pay the due amount before checking out');
    return;
  }

  if (!this.checkoutDetails.CheckoutDate || !this.checkoutDetails.CheckoutTime) {
    this.toastr.error('Please enter checkout date and time');
    return;
  }

  const formattedCheckoutTime = this.formatTimeTo12Hour(
    this.checkoutDetails.CheckoutTime
  );

  const checkoutRequest = {
    RoomBookingId: this.selectedBookingForCheckout.RoomBookingId,
    CheckoutDate: this.checkoutDetails.CheckoutDate,
    CheckoutTime: formattedCheckoutTime, // ✅ 3:24 PM
    Remarks: this.checkoutDetails.Remarks,
    RoomBookingStatus: RoomBookingStatus.Checkout,
    UpdatedBy: this.staffLogin.StaffLoginId
  };


  const request: RequestModel = {
    request: this.localService
      .encrypt(JSON.stringify(checkoutRequest))
      .toString(),
  };

  this.dataLoading = true;

  this.service.CheckoutBooking(request).subscribe(
    (r1) => {
      let response = r1 as any;
      if (response.Message === ConstantData.SuccessMessage || response.Success) {
        this.toastr.success('Booking checked out successfully');
        $('#checkoutModal').modal('hide');
        this.getBookingList();
        this.resetCheckoutForm();
      } else {
        this.toastr.error(response.Message || 'Error while checking out booking');
      }
      this.dataLoading = false;
    },
    (err) => {
      this.toastr.error('An error occurred while checking out the booking');
      console.error(err);
      this.dataLoading = false;
    }
  );
}


// Add this helper method to reset the form
resetCheckoutForm() {
  this.selectedBookingForCheckout = null;
  this.checkoutDetails = {
    CheckoutDate: null,
    CheckoutTime: null,
    Remarks: ''
  };
}
}
