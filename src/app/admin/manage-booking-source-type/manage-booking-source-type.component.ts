import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-manage-booking-source-type',
  templateUrl: './manage-booking-source-type.component.html',
  styleUrls: ['./manage-booking-source-type.component.css'],
})
export class ManageBookingSourceTypeComponent {
  dataLoading: boolean = false;
  BookingSourceTypeList: any = [];
  BookingSourceType: any = {};
  isSubmitted = false;
  StatusList = this.loadData.GetEnumList(Status);
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
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
    this.getBookingSourceTypeList();
    this.resetForm();
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

  @ViewChild('formBookingSourceType') formBookingSourceType: NgForm;
  resetForm() {
    this.BookingSourceType = {};
    if (this.formBookingSourceType) {
      this.formBookingSourceType.control.markAsPristine();
      this.formBookingSourceType.control.markAsUntouched();
    }
    this.isSubmitted = false;
    this.BookingSourceType.Status = 1;
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  getBookingSourceTypeList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getBookingSourceTypeList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.BookingSourceTypeList = response.BookingSourceTypeList;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
      }
    );
  }

  saveBookingSourceType() {
    this.isSubmitted = true;
    this.formBookingSourceType.control.markAllAsTouched();
    if (this.formBookingSourceType.invalid) {
      this.toastr.error('Fill all the required fields !!');
      return;
    }
    var obj: RequestModel = {
      request: this.localService
        .encrypt(JSON.stringify(this.BookingSourceType))
        .toString(),
    };
    this.service.saveBookingSourceType(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          if (this.BookingSourceType.BookingSourceTypeId > 0) {
            this.toastr.success('BookingSourceType detail updated successfully');
            $('#staticBackdrop').modal('hide');
          } else {
            this.toastr.success('BookingSourceType added successfully');
          }
          this.resetForm();
          this.getBookingSourceTypeList();
        } else {
          this.toastr.error(response.Message);
        }
      },
      (err) => {
        this.toastr.error('Error occured while submitting data');
      }
    );
  }

  deleteBookingSourceType(obj: any) {
    if (confirm('Are your sure you want to delete this recored')) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString(),
      };
      this.dataLoading = true;
      this.service.deleteBookingSourceType(request).subscribe(
        (r1) => {
          let response = r1 as any;
          if (response.Message == ConstantData.SuccessMessage) {
            this.toastr.success('Record Deleted successfully');
            this.getBookingSourceTypeList();
          } else {
            this.toastr.error(response.Message);
            this.dataLoading = false;
          }
        },
        (err) => {
          this.toastr.error('Error occured while deleteing the recored');
          this.dataLoading = false;
        }
      );
    }
  }

  editBookingSourceType(obj: any) {
    this.resetForm();
    this.BookingSourceType = obj;
  }
}
