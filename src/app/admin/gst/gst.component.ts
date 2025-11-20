import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Status } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-gst',
  templateUrl: './gst.component.html',
  styleUrls: ['./gst.component.css']
})
export class GstComponent {
  
  dataLoading: boolean = false;
  GSTList: any[] = [];
  GST: any = {};
  isSubmitted = false;
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  StatusList = this.loadData.GetEnumList(Status);
  AllStatusList = Status;
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private localService: LocalService,
    private loadData: LoadDataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getGSTList();
    this.resetForm();
  }

 validiateMenu() {
    var request: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
    }
    this.dataLoading = true
    this.service.validiateMenu(request).subscribe((response: any) => {
      this.action = this.loadData.validiateMenu(response, this.toastr, this.router)
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  @ViewChild('formGST') formGST: NgForm;
  resetForm() {
    this.GST = {};
    this.GST.Status = 1;
    if (this.formGST) {
      this.formGST.control.markAsPristine();
      this.formGST.control.markAsUntouched();
    }
    this.isSubmitted = false;
  }

  newGST() {
    this.resetForm();
    $('#modal_popUp').modal('show');
  }

  editGST(obj: any) {
    this.resetForm();
    this.GST = obj;
    $('#modal_popUp').modal('show');
  }


  getGSTList() {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.dataLoading = true;

    this.service.getGSTList(obj).subscribe({
      next: r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.GSTList = response.GSTList;
          
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      error: err => {
        console.error("API error:", err);
        this.toastr.error("Error while fetching records");
        this.dataLoading = false;
      }
    });
  }


    saveGST() {
      this.isSubmitted = true;
      this.formGST.control.markAllAsTouched();
      if (this.formGST.invalid) {
        this.toastr.error("Fill all the required fields !!")
        return
      }
      this.GST.CreatedBy = this.staffLogin.StaffId;
      this.GST.UpdatedBy = this.staffLogin.StaffId;
      var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.GST)).toString()
      }
      this.dataLoading = true;
      this.service.saveGST(obj).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          if (this.GST.GSTId > 0) {
            this.toastr.success("GST Updated successfully")
            $('#staticBackdrop').modal('hide')
          } else {
            this.toastr.success("GST added successfully")
          }
          this.resetForm()
          this.getGSTList();
        } else {
          this.toastr.error(response.Message)
          this.dataLoading = false;
        }
      }, (err => {
        this.toastr.error("Error occured while submitting data")
        this.dataLoading = false;
      }))
    }
  




    deleteGST(obj: any) {
    if (confirm("Are your sure you want to delete this recored")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true;
      this.service.deleteGST(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Record Deleted successfully")
          this.getGSTList()
        } else {
          this.toastr.error(response.Message)
          this.dataLoading = false;
        }
      }, (err => {
        this.toastr.error("Error occured while deleteing the recored")
        this.dataLoading = false;
      }))
    }
  }
}
