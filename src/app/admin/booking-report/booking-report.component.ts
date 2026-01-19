
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { PaymentMode, PaymentStatus, RoomBookingStatus } from '../../utils/enum';
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
  selector: 'app-booking-report',
  templateUrl: './booking-report.component.html',
  styleUrls: ['./booking-report.component.css']
})
export class BookingReportComponent {
 dataLoading: boolean = false;

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
  HotelList: any[] = [];
  filterHotel: any[] = [];

  // Filter
  Hotel: any = {
    HotelId: 0,
    HotelName: '',
  };

  // Date Filters
  FromDate: any = null;
  ToDate: any = null;

  // Status
  StatusList = this.loadData.GetEnumList(RoomBookingStatus);
  SelectedStatus: any = null;
  PaymentModeList = this.loadData.GetEnumList(PaymentMode);
  AllPaymentModeList = PaymentMode;

  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;

  // Selected booking for view
  selectedBooking: any = null;
  showBookingDetail: boolean = false;

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

    // Load hotel list for admin
    if (this.staffLogin.RoleId == 5) {
      this.getHotelList();
    } else {
      this.Hotel.HotelId = this.staffLogin.HotelId;
      this.loadBookingList();
    }
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
        this.toastr.error('Error while fetching hotel records');
        this.dataLoading = false;
      }
    );
  }

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
    this.Hotel.HotelId = event.option.value.HotelId;
    this.Hotel.HotelName = event.option.value.HotelName;
    this.loadBookingList();
  }

  clearHotel() {
    this.Hotel.HotelName = '';
    this.Hotel.HotelId = 0;
    this.filterHotel = this.HotelList;
    this.loadBookingList();
  }

  loadBookingList() {
    const data = {
      HotelId: this.Hotel.HotelId || this.staffLogin.HotelId || 0,
      StartFrom: this.FromDate,
      EndFrom: this.ToDate,
      RoomBookingStatus: this.SelectedStatus,
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
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.BookingList];

    // Search filter
    if (this.Search && this.Search.trim()) {
      const searchTerm = this.Search.toLowerCase().trim();
      filtered = filtered.filter(
        (booking: any) =>
          booking.BookingCode?.toLowerCase().includes(searchTerm) ||
          booking.GuestName?.toLowerCase().includes(searchTerm) ||
          booking.GuestContactNo?.toString().toLowerCase().includes(searchTerm) ||
          booking.HotelName?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (this.SelectedStatus !== null && this.SelectedStatus !== '') {
      filtered = filtered.filter(
        (booking: any) => booking.RoomBookingStatus == this.SelectedStatus
      );
    }

    // Date range filter
    if (this.FromDate) {
      const fromDate = new Date(this.FromDate);
      filtered = filtered.filter(
        (booking: any) => new Date(booking.BookingDate) >= fromDate
      );
    }

    if (this.ToDate) {
      const toDate = new Date(this.ToDate);
      filtered = filtered.filter(
        (booking: any) => new Date(booking.BookingDate) <= toDate
      );
    }

    this.FilteredBookingList = filtered;
  }

  clearFilters() {
    this.Search = '';
    this.SelectedStatus = null;
    this.FromDate = null;
    this.ToDate = null;
    this.FilteredBookingList = [...this.BookingList];
  }

  // View booking details
  viewBookingDetail(booking: any) {
    this.selectedBooking = booking;
    this.showBookingDetail = true;
  }

  closeBookingDetail() {
    this.selectedBooking = null;
    this.showBookingDetail = false;
  }

  // Export to Excel
  exportToExcel() {
    this.toastr.info('Export to Excel - to be implemented');
    // Implement Excel export logic using libraries like xlsx
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

  // Navigate to create booking
  navigateToCreateBooking() {
    this.router.navigate(['/admin/manage-booking']);
  }

  // Calculate total statistics
  getTotalAmount(): number {
    return this.FilteredBookingList.reduce(
      (sum, booking) => sum + (booking.TotalLineAmount || 0),
      0
    );
  }

  getTotalPaid(): number {
    return this.FilteredBookingList.reduce(
      (sum, booking) => sum + (booking.TotalPaidAmount || 0),
      0
    );
  }

  getTotalDue(): number {
    return this.FilteredBookingList.reduce(
      (sum, booking) => sum + (booking.TotalDuesAmount || 0),
      0
    );
  }

  getTotalTaxable(): number {
    return this.FilteredBookingList.reduce(
      (sum, booking) => sum + (booking.TaxableAmount || 0),
      0
    );
  }

  getTotalGST(): number {
    return this.FilteredBookingList.reduce(
      (sum, booking) => sum + (booking.TotalGST || 0),
      0
    );
  }

  getTotalDiscount(): number {
    return this.FilteredBookingList.reduce(
      (sum, booking) => sum + (booking.TotalDiscount || 0),
      0
    );
  }

  // Get status badge class
  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'bg-success';
      case 2: return 'bg-info';
      case 3: return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  // Get status text
  getStatusText(status: number): string {
    const statusObj = this.StatusList.find((s: any) => s.Key === status);
    return statusObj ? statusObj.Value : 'Unknown';
  }
}
