import { Component, OnInit, ViewChild } from '@angular/core';
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


import * as XLSX from 'xlsx';
// import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-office-transaction',
  templateUrl: './office-transaction.component.html',
  styleUrls: ['./office-transaction.component.css']
})
export class OfficeTransactionComponent implements OnInit {


  
dataLoading: boolean = false
  OfficeTransactionList: any = [];
  OfficeTransaction: any = {}
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
  OfficeExpenseHeadList: any;
  exportDate = new Date();
title = 'export-excel';
fileName: string;


Filter: any = {};
  OfficeExpenseHeadListForFilter: any;
  OfficeExpenseCategoryListForFilter: any;
  TotalAmount: any = {};




setFileName() {
  const dateStr = this.loadData.loadDateYMD(this.exportDate); // Format date as yyyy-mm-dd
  this.fileName = `Office_Expense_Report_${dateStr}.xlsx`;
}

ExportTOExcel1() {
  console.log("yes");
  
  const data = [
    [{ t: 's', s: { bold: true, fontSize: 24 }, v: 'OFFICE EXPENSE REPORT' }],
    [],
    ['Transaction Date', 'Category Name','Head Name','Particular','Remarks', 'Amount'],
    ...this.OfficeTransactionList.map((item: { OETransactionDate: any; OEHeadName: any; Amount: any; OECategoryName:any,Particular:any,Remarks:any }) => [
      this.loadData.loadDateYMD(item.OETransactionDate),
      item.OECategoryName,
      item.OEHeadName,
      item.Particular,
      item.Remarks,
      item.Amount,

    ]),
    [],
    ['Total', '',  '', '', '', this.OfficeTransactionList.reduce((acc: any, item: { Amount: any; }) => acc + item.Amount, 0)] // Footer row with totals
    ];

  // Convert data to a worksheet using XLSX utils
  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

  // Create a new workbook using XLSX
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'data');

  // Ensure the file name is valid
  if (!this.fileName) {
    console.error('File name is not defined');
    return;
  }

  // Write the workbook to a file
  try {
    XLSX.writeFile(workbook, this.fileName);
  } catch (error) {
    console.error('Error writing the file:', error);
  }
}
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
    this.getOfficeTransactionList();
    this.getOfficeExpenseCategoryList();
    this.resetForm();
    this.getOfficeExpenseHeadListForFilter();
    this.getOfficeExpenseCategoryListForFilter();
    const dateStr = this.loadData.loadDateYMD(this.exportDate); // Format date as yyyy-mm-dd
  this.fileName = `Office_Expense_Report_${dateStr}.xlsx`;
    
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

  @ViewChild('formOfficeTransaction') formOfficeTransaction: NgForm;
  resetForm() {
    this.OfficeTransaction = {}
    if (this.formOfficeTransaction) {
      this.formOfficeTransaction.control.markAsPristine();
      this.formOfficeTransaction.control.markAsUntouched();
    }
    this.OfficeTransaction.OETransactionDate = this.loadData.loadDateYMD(new Date());
    this.isSubmitted = false
    this.OfficeTransaction.Status = 1
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  resetFilter() {
    this.Filter = {};
    this.getOfficeTransactionList();
    }

  onTableDataChange(p: any) {
    this.p = p
  }

  afterCategorySelected(event: any) {
    this.getOfficeExpenseHeadList(event)
  }

  getOfficeExpenseHeadList(event: any) {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ OECategoryId: event })).toString()
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

  getOfficeExpenseHeadListForFilter() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({  })).toString()
    }
    this.dataLoading = true
    this.service.getOfficeExpenseHeadList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.OfficeExpenseHeadListForFilter = response.OfficeExpenseHeadList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
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

  getOfficeExpenseCategoryListForFilter() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({  })).toString()
    }
    this.dataLoading = true
    this.service.getOfficeExpenseCategoryList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.OfficeExpenseCategoryListForFilter = response.OfficeExpenseCategoryList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
  }

  getOfficeTransactionList() {
    this.dataLoading = true;
    this.Filter.FromDate = this.loadData.loadDateYMD(this.Filter.FromDate);
    this.Filter.ToDate = this.loadData.loadDateYMD(this.Filter.ToDate);

    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Filter)).toString()
    }
    this.service.getOfficeTransactionList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.OfficeTransactionList = response.OETransactionList;
        this.TotalAmount.SumOfTotalAmount = response.TotalAmount;  
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
    }))
  }

  saveOfficeTransaction() {
    this.isSubmitted = true;
    this.formOfficeTransaction.control.markAllAsTouched();
    if (this.formOfficeTransaction.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }


    this.OfficeTransaction.CreatedBy = this.staffLogin.StaffLoginId;
    this.OfficeTransaction.UpdatedBy = this.staffLogin.StaffLoginId;
    this.OfficeTransaction.OETransactionDate = this.loadData.loadDateYMD(this.OfficeTransaction.OETransactionDate);


    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.OfficeTransaction)).toString()
    }
    this.service.saveOfficeTransaction(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.OfficeTransaction.OECategoryId > 0) {
          this.toastr.success("Office Expense Category detail updated successfully")
          $('#staticBackdrop').modal('hide')
        } else {
          this.toastr.success("Office Expense Category added successfully")
        }
        this.resetForm()
        this.getOfficeTransactionList()
      } else {
        this.toastr.error(response.Message)
      }
    }, (err => {
      this.toastr.error("Error occured while submitting data")
    }))
  }

  deleteOfficeTransaction(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true
      this.service.deleteOfficeTransaction(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getOfficeTransactionList()
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

  editOfficeTransaction(obj: any) {
    this.resetForm()
    this.OfficeTransaction = obj
    this.afterCategorySelected(this.OfficeTransaction.OECategoryId)
  }
}
