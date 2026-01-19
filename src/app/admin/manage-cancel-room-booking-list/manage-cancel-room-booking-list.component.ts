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
} from '../../utils/enum';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-manage-cancel-room-booking-list',
  templateUrl: './manage-cancel-room-booking-list.component.html',
  styleUrls: ['./manage-cancel-room-booking-list.component.css']
})
export class ManageCancelRoomBookingListComponent {
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
  PaymentTypeList = this.loadData.GetEnumList(PaymentType);
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  PaymentModeAll = PaymentMode;
  PaymentTypeAll = PaymentType;
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
    this.filterModel = {
      StartFrom: null,
      EndFrom: null,
      RoomBookingStatus: RoomBookingStatus.Cancelled,
    };
    this.getBookingList();
    this.getBookingSourceTypeList();
    this.getHotelList();

    // Initialize pagination defaults
    this.p = 1;
    this.itemPerPage = 10;

    // Initialize filter model
   
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

    if(this.staffLogin.RoleId!=5){
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
        if (response.Message == ConstantData.SuccessMessage || response.Success) {
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
              this.BookingSourceTypeList[item.BookingSourceTypeId] = item.BookingSourceName;
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

  // ✅ Open View Modal
  openViewModal(item: any) {
    // Reset data
    this.selectedBooking = null;
    this.guestDetails = null;
    this.roomDetails = [];
    this.paymentDetails = [];

    // Show modal
    $('#viewBookingDetailsModal').modal('show');

    // Fetch complete booking details
    this.getBookingDetails(item.RoomBookingId);
  }

  // ✅ Fetch Booking Details by ID
  getBookingDetails(roomBookingId: number) {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(roomBookingId)).toString(),
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
}
