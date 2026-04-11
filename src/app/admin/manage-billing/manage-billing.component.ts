import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import {
  Status,
  PaymentMode,
  PaymentType,
  RoomBookingStatus,
} from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-manage-billing',
  templateUrl: './manage-billing.component.html',
  styleUrls: ['./manage-billing.component.css'],
})
export class ManageBillingComponent implements OnInit {
  dataLoading: boolean = false;
  isSubmitted: boolean = false;

  // Pagination & Search
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  itemPerPage: number = this.PageSize[0];
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';

  // Lists
  BookingList: any[] = [];
  FilteredBookingList: any[] = [];
  PaymentModeList = this.loadData.GetEnumList(PaymentMode);
  PaymentTypeList = this.loadData.GetEnumList(PaymentType);
  AllPaymentModeList = PaymentMode;
  AllPaymentTypeList = PaymentType;
  AllRoomBookingStatusList = RoomBookingStatus;

  // Selected Booking Data
  selectedBooking: any = null;
  selectedBookingDetails: any = null;
  selectedGuest: any = null;
  selectedRoomDetails: any[] = [];
  selectedPaymentDetails: any[] = [];

  // Billing Data
  Billing: any = {
    BillingDate: this.loadData.loadDateYMD(new Date()),
    CheckOutDate: this.loadData.loadDateYMD(new Date()),
    CheckOutTime: this.loadData.getCurrentTime(),
  };

  // New Payment
  NewPayment: any = {
    PaymentDate: this.loadData.loadDateYMD(new Date()),
    PaidAmount: 0,
    PaymentType: null,
    PaymentMode: null,
    TransactionNo: '',
  };

  // View Mode
  showBillingSection: boolean = false;
  isGeneratingBill: boolean = false;

  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;

  @ViewChild('formBilling') formBilling: NgForm;

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validateMenu();
    this.getHotelList();
    this.loadBookingList();
  }

  validateMenu() {
    const cleanUrl = this.router.url.split('?')[0];
    var obj: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: cleanUrl,
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
        this.toastr.error('Error while validating menu');
        this.dataLoading = false;
      }
    );
  }

  Filter: any = {};

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

  loadBookingList() {
    if(this.staffLogin.RoleId == 5){
      this.Filter.HotelId = this.Filter.HotelId;
    }
    else{
      this.Filter.HotelId = this.staffLogin.HotelId;
    }

    const data = {
      HotelId: this.Filter.HotelId,
      RoomBookingStatus: 1,
      // Load only checked-in bookings that haven't been fully billed
    };

    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;
    this.service.getBookingList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.BookingList = response.BookingList || [];
          this.FilteredBookingList = [...this.BookingList];
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching booking records');
        this.dataLoading = false;
      }
    );
  }

  // Search & Filter
  onSearchChange() {
    const searchTerm = this.Search.toLowerCase().trim();

    if (!searchTerm) {
      this.FilteredBookingList = [...this.BookingList];
      return;
    }

    this.FilteredBookingList = this.BookingList.filter((booking: any) => {
      return (
        booking.BookingCode?.toLowerCase().includes(searchTerm) ||
        booking.GuestName?.toLowerCase().includes(searchTerm) ||
        booking.GuestContactNo?.toString().toLowerCase().includes(searchTerm)
      );
    });
  }

  // Load booking details for billing
  loadBookingForBilling(bookingId: number) {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(bookingId)).toString(),
    };

    this.dataLoading = true;
    this.service.getBookingListById(obj).subscribe(
      (response: any) => {
        if (response.Message === 'Success') {
          this.selectedBooking = response.GetRoomBooking;
          this.selectedGuest = response.GetGuest;
          this.selectedRoomDetails = response.GetRoomDetails.map(
            (item: any) => ({
              ...item,
              CheckInDate: this.loadData.loadDateYMD(item.CheckInDate),
              CheckOutDate: item.CheckOutDate
                ? this.loadData.loadDateTime(item.CheckOutDate)
                : null,
            })
          );
          this.selectedPaymentDetails = response.GetPaymentDetails.map(
            (p: any) => ({
              ...p,
              PaymentDate: this.loadData.loadDateYMD(p.PaymentDate),
            })
          );

          // Initialize billing data
          this.initializeBillingData();

          this.showBillingSection = true;
          this.toastr.success('Booking details loaded');
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while loading booking details');
        this.dataLoading = false;
      }
    );
  }

  initializeBillingData() {
    // Calculate earliest check-in and latest expected checkout
    const checkInDates = this.selectedRoomDetails.map(
      (r: any) => new Date(r.CheckInDate)
    );
    const earliestCheckIn = new Date(
      Math.min(...checkInDates.map((d) => d.getTime()))
    );

    this.Billing = {
      BillingDate: this.loadData.loadDateYMD(new Date()),
      CheckInDate: this.loadData.loadDateYMD(earliestCheckIn),
      CheckInTime: this.selectedRoomDetails[0]?.CheckInTime || '12:00',
      CheckOutDate: this.loadData.loadDateYMD(new Date()),
      CheckOutTime: this.loadData.getCurrentTime(),
      TotalNoOfRooms: this.selectedRoomDetails.length,
      TotalPerson: this.selectedRoomDetails.reduce(
        (sum: number, r: any) => sum + (r.NoOfPerson || 0),
        0
      ),
      TotalLineAmount: this.selectedBooking.TotalLineAmount || 0,
      TotalDiscount: this.selectedBooking.TotalDiscount || 0,
      TaxableAmount: this.selectedBooking.TaxableAmount || 0,
      TotalGST: this.selectedBooking.TotalGST || 0,
      TotalCGST: this.selectedBooking.TotalCGST || 0,
      TotalSGST: this.selectedBooking.TotalSGST || 0,
      TotalIGST: this.selectedBooking.TotalIGST || 0,
      GrandTotal: this.selectedBooking.TotalLineAmount || 0,
      TotalPaidAmount: this.selectedBooking.TotalPaidAmount || 0,
      TotalDuesAmount: this.selectedBooking.TotalDuesAmount || 0,
    };

    // Calculate total days
    this.calculateTotalDays();

    // Update new payment amount
    this.updateNewPaymentAmount();
  }

  calculateTotalDays() {
    let totalDays = 0;
    this.selectedRoomDetails.forEach((room: any) => {
      totalDays += room.NoOfDays || 0;
    });
    this.Billing.TotalNoOfDays = totalDays;
  }

  updateNewPaymentAmount() {
    const remaining = this.Billing.TotalDuesAmount || 0;
    this.NewPayment.PaidAmount = remaining > 0 ? remaining : 0;
  }

  // Add additional payment
  addAdditionalPayment() {
    if (!this.NewPayment.PaidAmount || this.NewPayment.PaidAmount <= 0) {
      this.toastr.error('Please enter a valid payment amount!');
      return;
    }

    if (!this.NewPayment.PaymentType) {
      this.toastr.error('Please select payment type!');
      return;
    }

    if (!this.NewPayment.PaymentMode) {
      this.toastr.error('Please select payment mode!');
      return;
    }

    if (this.NewPayment.PaidAmount > this.Billing.TotalDuesAmount) {
      this.toastr.error('Payment amount cannot exceed due amount!');
      return;
    }

    // Add to payment list
    this.selectedPaymentDetails.push({ ...this.NewPayment });

    // Update totals
    this.Billing.TotalPaidAmount += this.NewPayment.PaidAmount;
    this.Billing.TotalDuesAmount -= this.NewPayment.PaidAmount;

    this.toastr.success('Payment added successfully!');

    // Reset payment form
    this.NewPayment = {
      PaymentDate: this.loadData.loadDateYMD(new Date()),
      PaidAmount: this.Billing.TotalDuesAmount,
      PaymentType: null,
      PaymentMode: null,
      TransactionNo: '',
    };
  }

  removePayment(index: number) {
    const payment = this.selectedPaymentDetails[index];
    this.Billing.TotalPaidAmount -= payment.PaidAmount;
    this.Billing.TotalDuesAmount += payment.PaidAmount;

    this.selectedPaymentDetails.splice(index, 1);
    this.updateNewPaymentAmount();

    this.toastr.success('Payment removed!');
  }

  // Generate/Save Bill
  generateBill() {
    this.isSubmitted = true;

    if (!this.selectedBooking) {
      this.toastr.error('No booking selected!');
      return;
    }

    if (!this.Billing.CheckOutDate) {
      this.toastr.error('Please enter checkout date!');
      return;
    }

    if (!this.Billing.CheckOutTime) {
      this.toastr.error('Please enter checkout time!');
      return;
    }

    const totalPaid = this.Billing.TotalPaidAmount ?? 0;
    const dueAmount = this.Billing.TotalDuesAmount ?? 0;

    if (this.selectedPaymentDetails.length === 0 || totalPaid <= 0) {
      this.toastr.error('No payment found. Please add at least one payment.');
      return;
    }


    // Prepare billing data
    const billingData = {
      Billing: {
        BillingDate: this.loadData.loadDateTime(this.Billing.BillingDate),
        RoomBookingId: this.selectedBooking.RoomBookingId,
        GuestId: this.selectedGuest.GuestId,
        HotelId: this.selectedBooking.HotelId,
        CheckInDate: this.loadData.loadDateTime(this.Billing.CheckInDate),
        CheckInTime: this.Billing.CheckInTime,
        CheckOutDate: this.loadData.loadDateTime(this.Billing.CheckOutDate),
        CheckOutTime: this.Billing.CheckOutTime,  
        TotalNoOfRooms: this.Billing.TotalNoOfRooms,
        TotalNoOfDays: this.Billing.TotalNoOfDays,
        TotalPerson: this.Billing.TotalPerson,
        TotalLineAmount: this.Billing.TotalLineAmount,
        TotalDiscount: this.Billing.TotalDiscount,
        TaxableAmount: this.Billing.TaxableAmount,
        TotalGST: this.Billing.TotalGST,
        TotalSGST: this.Billing.TotalSGST,
        TotalCGST: this.Billing.TotalCGST,
        TotalIGST: this.Billing.TotalIGST,
        GrandTotal: this.Billing.GrandTotal,
        TotalPaidAmount: this.Billing.TotalPaidAmount,
        TotalDuesAmount: this.Billing.TotalDuesAmount,
        Status: Status.Active,
        CreatedBy: this.staffLogin.StaffLoginId,
        UpdatedBy: this.staffLogin.StaffLoginId,
      },
      RoomBookingDetails: this.selectedRoomDetails.map((room: any) => ({
        RoomBookingDetailId: room.RoomBookingDetailId,
        CheckOutDate: this.loadData.loadDateTime(this.Billing.CheckOutDate),
        CheckOutTime: this.Billing.CheckOutTime,
      })),
      PaymentDetails: this.selectedPaymentDetails.map((payment: any) => ({
        RoomBookingId: this.selectedBooking.RoomBookingId,
        PaymentDate: payment.PaymentDate,
        PaidAmount: payment.PaidAmount,
        PaymentId: payment.PaymentId || null,
        PaymentType: payment.PaymentType,
        PaymentMode: payment.PaymentMode,
        TransactionNo: payment.TransactionNo || '',
        Status: Status.Active,
      })),
    };


    const obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify(billingData))
        .toString(),
    };

    this.dataLoading = true;
    this.isGeneratingBill = true;

    this.service.saveBilling(obj).subscribe(
      (r1) => {
        const response = r1 as any;
        if (response.Message === ConstantData.SuccessMessage) {
          this.toastr.success('Bill generated successfully!');

          this.closeBillingSection();
          this.loadBookingList();
          this.service.PrintBill(response.BillingId);
          this.router.navigate(['/admin/billing-list']);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
        this.isGeneratingBill = false;
      },
      (err) => {
        this.toastr.error('Error occurred while generating bill');
        this.dataLoading = false;
        this.isGeneratingBill = false;
      }
    );
  }

  closeBillingSection() {
    this.showBillingSection = false;
    this.selectedBooking = null;
    this.selectedGuest = null;
    this.selectedRoomDetails = [];
    this.selectedPaymentDetails = [];
    this.Billing = {};
    this.NewPayment = {
      PaymentDate: this.loadData.loadDateYMD(new Date()),
      PaidAmount: 0,
      PaymentType: null,
      PaymentMode: null,
      TransactionNo: '',
    };
    this.isSubmitted = false;
  }

  // Sorting
  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  // Pagination
  onTableDataChange(p: any) {
    this.p = p;
  }

  // Print Bill (Optional)
  printBill() {
    window.print();
  }
}
