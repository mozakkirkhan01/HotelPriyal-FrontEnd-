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
  selector: 'app-office-expense-head',
  templateUrl: './office-expense-head.component.html',
  styleUrls: ['./office-expense-head.component.css']
})
export class OfficeExpenseHeadComponent {
dataLoading: boolean = false
  OfficeExpenseHeadList: any = []
  OfficeExpenseHead: any = {}
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
    this.getOfficeExpenseHeadList();
    this.getOfficeExpenseCategoryList();
    this.resetForm();
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

  @ViewChild('formOfficeExpenseHead') formOfficeExpenseHead: NgForm;
  resetForm() {
    this.OfficeExpenseHead = {}
    if (this.formOfficeExpenseHead) {
      this.formOfficeExpenseHead.control.markAsPristine();
      this.formOfficeExpenseHead.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.OfficeExpenseHead.Status = 1
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }

  getOfficeExpenseCategoryList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ })).toString()
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

  getOfficeExpenseHeadList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ })).toString()
    }
    this.dataLoading = true
    this.service.getOfficeExpenseHeadList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.OfficeExpenseHeadList = response.OfficeExpenseHeadList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
  }

  saveOfficeExpenseHead() {
    this.isSubmitted = true;
    this.formOfficeExpenseHead.control.markAllAsTouched();
    if (this.formOfficeExpenseHead.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.OfficeExpenseHead)).toString()
    }
    this.service.saveOfficeExpenseHead(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.OfficeExpenseHead.OECategoryId > 0) {
          this.toastr.success("Office Expense Category detail updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Office Expense Category added successfully")
        }
        this.resetForm()
        this.getOfficeExpenseHeadList()
      } else {
        this.toastr.error(response.Message)
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
    }))
  }

  deleteOfficeExpenseHead(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true
      this.service.deleteOfficeExpenseHead(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getOfficeExpenseHeadList()
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

  editOfficeExpenseHead(obj: any) {
    this.resetForm()
    this.OfficeExpenseHead = obj

  }
}
