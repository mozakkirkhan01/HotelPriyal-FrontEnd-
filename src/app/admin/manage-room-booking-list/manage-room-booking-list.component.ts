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
editPackageCollection(data: any) {
  return 0;
}
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
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  PaymentMode = this.loadData.GetEnumList(PaymentMode);
  PaymentModeAll = PaymentMode;
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
  OpticalSellListALL: any = {};
  OpticalSellListPayments: any = {};
  DueBill: any = {};

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

    // Initialize pagination defaults
    this.p = 1;
    this.itemPerPage = 10; // Or your default

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
    //  this.service.PrintOpticlalBill(data.OpticalBillingId);
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
             this.toastr.success('The record has been deleted successfully.', response.Message);
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
  openViewModal(item: any) {
    this.selectedBill = item;
    $('#viewDetailsModal').modal('show');
  }
   }
  // openViewModal(item: any) {
  //   this.selectedBill = item;
  //   $('#viewDetailsModal').modal('show');
  //   //  this.OpticalSellList(item);
  //   //  this.OpticalSellListPayment(item);
  // }

  //  OpticalSellList(obj: any) {
  //    var request: RequestModel = {
  //      request: this.localService.encrypt(JSON.stringify(obj)).toString(),
  //    };
  //    this.dataLoading = true;
  //    this.service.OpticalSellList(request).subscribe(
  //      (r1) => {
  //        let response = r1 as any;
  //        if (response.Message == ConstantData.SuccessMessage) {
  //          this.OpticalSellListALL = response.OpticalSellList;

  //          this.dataLoading = false;
  //        } else {
  //          this.toastr.error('Error occured while Fetching  the recored');
  //        }
  //      },
  //      (err) => {
  //        this.toastr.error('Error occured while Fetching  the recored');
  //        this.dataLoading = false;
  //      }
  //    );
  //  }

  //    OpticalSellListPayment(obj: any) {
  //    var request: RequestModel = {
  //      request: this.localService.encrypt(JSON.stringify(obj)).toString(),
  //    };
  //    this.dataLoading = true;
  //    this.service.OpticalSellListPayment(request).subscribe(
  //      (r1) => {
  //        let response = r1 as any;
  //        if (response.Message == ConstantData.SuccessMessage) {
  //          this.OpticalSellListPayments = response.OpticalSellListPayment;
  //          this.dataLoading = false;
  //        } else {
  //          this.toastr.error('Error occured while Fetching  the recored');
  //        }
  //      },
  //      (err) => {
  //        this.toastr.error('Error occured while Fetching  the recored');
  //        this.dataLoading = false;
  //      }
  //    );
  //  }

  // openViewModalForDue(item: any) {
  //   this.DueBill = item;
  //   this.DueBill.PaymentDate = new Date();
  //   $('#viewDueModal').modal('show');
  // }

  // DeliveryModal(item: any) {
  //   this.Deliverystatus = item;

  //   this.Deliverystatus.DeliveryDate = new Date();
  //   $('#DeliveryModal').modal('show');
  // }

  //  DeliveryStatusUpdate(obj:any){
  //    this.Deliverystatus.DeliveryStatuss = obj.DeliveryStatus;
  //    this.Deliverystatus.DeliveryDate= this.loadData.loadDateYMD(this.Deliverystatus.DeliveryDate);

  //      var request: RequestModel = {
  //      request: this.localService.encrypt(JSON.stringify(this.Deliverystatus)).toString(),
  //    };
  //    this.dataLoading = true;
  //    this.service.DeliveryStatus(request).subscribe(
  //      (r1) => {
  //        let response = r1 as any;
  //        if (response.Message == ConstantData.SuccessMessage) {
  //          this.dataLoading = false;
  //          this.toastr.success("Optical Delivered successfully");
  //    $('#DeliveryModal').modal('hide');
  //          this.getOpticalsBillList();
  //        } else {
  //          this.toastr.error('Error occured while Fetching  the recored');
  //        }
  //      },
  //      (err) => {
  //        this.toastr.error('Error occured while Fetching  the recored');
  //        this.dataLoading = false;
  //      }
  //    );
  //  }

  //  ClearDueAmount(obj: any) {

  //    this.DueBill = obj;
  //    this.DueBill.CreatedBy = this.staffLogin.StaffId;
  //    this.DueBill.PaymentDate = this.loadData.loadDateYMD(
  //        this.DueBill.PaymentDate);

  //    var request: RequestModel = {
  //      request: this.localService.encrypt(JSON.stringify(this.DueBill)).toString(),
  //    };
  //    this.dataLoading = true;
  //    this.service.saveOpticalsBillDue(request).subscribe(
  //      (r1) => {
  //        let response = r1 as any;
  //        if (response.Message == ConstantData.SuccessMessage) {
  //          this.dataLoading = false;
  //          this.toastr.success("Due amount cleared successfully");
  //          $('#viewDueModal').modal('hide')
  //          this.getOpticalsBillList();
  //        } else {
  //          this.toastr.error('Error occured while Clearing  the Due');
  //        }
  //      },
  //      (err) => {
  //        this.toastr.error('Error occured while Fetching  the recored');
  //        this.dataLoading = false;
  //      }
  //    );
  //  }
