import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LoadDataService } from '../../utils/load-data.service';
import { Status } from '../../utils/enum';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-office-expense-category',
  templateUrl: './office-expense-category.component.html',
  styleUrls: ['./office-expense-category.component.css']
})
export class OfficeExpenseCategoryComponent {
 dataLoading: boolean = false
  OfficeExpenseCategoryList: any = []
  OfficeExpenseCategory: any = {}
  isSubmitted = false
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
  FilterModel: any = {};
  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService:LocalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getOfficeExpenseCategoryList();
    this.resetForm();
    this.getHotelList();
  }
  
  validiateMenu() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url,StaffLoginId:this.staffLogin.StaffLoginId })).toString()
    }
    this.dataLoading = true
    this.service.validiateMenu(obj).subscribe((response: any) => {
      this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  @ViewChild('formOfficeExpenseCategory') formOfficeExpenseCategory: NgForm;
  resetForm() {
    this.OfficeExpenseCategory = {}
    if (this.formOfficeExpenseCategory) {
      this.formOfficeExpenseCategory.control.markAsPristine();
      this.formOfficeExpenseCategory.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.OfficeExpenseCategory.Status = 1
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }

  getOfficeExpenseCategoryList() {

      if(this.staffLogin.RoleId == 5){
        this.FilterModel.HotelId = this.FilterModel.HotelId;
      }
      else{
        this.FilterModel.HotelId = this.staffLogin.HotelId;
      }

    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.FilterModel)).toString()
    }
    this.dataLoading = true
    this.service.getOfficeExpenseCategoryList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.OfficeExpenseCategoryList = response.OfficeExpenseCategoryList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
  }

  saveOfficeExpenseCategory() {
    this.isSubmitted = true;
    this.formOfficeExpenseCategory.control.markAllAsTouched();
    if (this.formOfficeExpenseCategory.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }

    if(this.staffLogin.RoleId == 5){
      this.OfficeExpenseCategory.HotelId = this.OfficeExpenseCategory.HotelId;
    }
    else{
      this.OfficeExpenseCategory.HotelId = this.staffLogin.HotelId;
    }


    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.OfficeExpenseCategory)).toString()
    }
    this.service.saveOfficeExpenseCategory(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.OfficeExpenseCategory.OECategoryId > 0) {
          this.toastr.success("Office Expense Category detail updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Office Expense Category added successfully")
        }
        this.resetForm()
        this.getOfficeExpenseCategoryList()
      } else {
        this.toastr.error(response.Message)
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
    }))
  }

  deleteOfficeExpenseCategory(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true
      this.service.deleteOfficeExpenseCategory(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getOfficeExpenseCategoryList()
        } else {
          this.toastr.error(response.Message)
          this.dataLoading = false
        }
      }, (err => {
        this.toastr.error("Error occured while deleteing the recored")
        this.dataLoading = false
      }))
    }
  }

  editOfficeExpenseCategory(obj: any) {
    this.resetForm()
    this.OfficeExpenseCategory = obj

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
  filterModel: any = {};

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
    this.OfficeExpenseCategory.HotelId = event.option.id;
  }
  clearHotel() {
    this.filterModel.HotelName = '';
    this.filterModel.HotelId = 0;
    this.OfficeExpenseCategory.HotelName = '';
    this.OfficeExpenseCategory.HotelId = 0;
    this.filterHotel = this.HotelList;
    this.filterModel = {};
  }
}
