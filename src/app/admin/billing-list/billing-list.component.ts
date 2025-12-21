import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Status } from '../../utils/enum';
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
  selector: 'app-billing-list',
  templateUrl: './billing-list.component.html',
  styleUrls: ['./billing-list.component.css'],
})
export class BillingListComponent implements OnInit {
  dataLoading: boolean = false;

  // Pagination & Search
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  itemPerPage: number = this.PageSize[0];
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';

  // Lists
  BillingList: any[] = [];
  FilteredBillingList: any[] = [];
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
  StatusList = this.loadData.GetEnumList(Status);
  SelectedStatus: any = null;

  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;

  // Selected billing for view/print
  selectedBilling: any = null;
  showBillingDetail: boolean = false;

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
      this.loadBillingList();
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

   getPrint(data: any) {
       this.service.PrintBill(data.BillingId);
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
  this.loadBillingList();
}


  clearHotel() {
    this.Hotel.HotelName = '';
    this.Hotel.HotelId = 0;
    this.filterHotel = this.HotelList;
    this.loadBillingList();
  }

  loadBillingList() {
    const data = {
      HotelId: this.Hotel.HotelId || this.staffLogin.HotelId || 0,
      FromDate: this.FromDate,
      ToDate: this.ToDate,
    };

    

    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;
    this.service.getBillingList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.BillingList = response.BillingList || [];
          this.FilteredBillingList = [...this.BillingList];
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching billing records');
        this.dataLoading = false;
      }
    );
  }

  // Search & Filter
  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.BillingList];

    // Search filter
    if (this.Search && this.Search.trim()) {
      const searchTerm = this.Search.toLowerCase().trim();
      filtered = filtered.filter(
        (billing: any) =>
          billing.InvoiceNo?.toLowerCase().includes(searchTerm) ||
          billing.BookingCode?.toLowerCase().includes(searchTerm) ||
          billing.GuestName?.toLowerCase().includes(searchTerm) ||
          billing.ContactNo?.toString().toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (this.SelectedStatus !== null && this.SelectedStatus !== '') {
      filtered = filtered.filter(
        (billing: any) => billing.Status == this.SelectedStatus
      );
    }

    // Date range filter
    if (this.FromDate) {
      const fromDate = new Date(this.FromDate);
      filtered = filtered.filter(
        (billing: any) => new Date(billing.BillingDate) >= fromDate
      );
    }

    if (this.ToDate) {
      const toDate = new Date(this.ToDate);
      filtered = filtered.filter(
        (billing: any) => new Date(billing.BillingDate) <= toDate
      );
    }

    this.FilteredBillingList = filtered;
  }

  clearFilters() {
    this.Search = '';
    this.SelectedStatus = null;
    this.FromDate = null;
    this.ToDate = null;
    this.FilteredBillingList = [...this.BillingList];
  }

  // View billing details
  viewBillingDetail(billing: any) {
    this.selectedBilling = billing;
    this.showBillingDetail = true;
  }

  closeBillingDetail() {
    this.selectedBilling = null;
    this.showBillingDetail = false;
  }

  // Print bill
  printBill(billingId: number) {
   this.service.PrintBill(billingId);
  }

  // Download bill as PDF
  downloadBill(billingId: number) {
    this.toastr.info('Download PDF functionality - to be implemented');
    // Implement PDF generation/download logic
  }

  // Email bill
  emailBill(billing: any) {
    this.toastr.info('Email bill functionality - to be implemented');
    // Implement email sending logic
  }

  // Delete billing
  deleteBilling(billingId: number) {
    if (!confirm('Are you sure you want to delete this bill?')) {
      return;
    }

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(billingId)).toString(),
    };

    this.dataLoading = true;
    this.service.deleteBilling(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success('Bill deleted successfully');
          this.loadBillingList();
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while deleting bill');
        this.dataLoading = false;
      }
    );
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

  // Navigate to create billing
  navigateToCreateBilling() {
    this.router.navigate(['/admin/manage-billing']);
  }

  // Calculate total statistics
  getTotalAmount(): number {
    return this.FilteredBillingList.reduce(
      (sum, bill) => sum + (bill.GrandTotal || 0),
      0
    );
  }

  getTotalPaid(): number {
    return this.FilteredBillingList.reduce(
      (sum, bill) => sum + (bill.TotalPaidAmount || 0),
      0
    );
  }

  getTotalDue(): number {
    return this.FilteredBillingList.reduce(
      (sum, bill) => sum + (bill.TotalDuesAmount || 0),
      0
    );
  }
}