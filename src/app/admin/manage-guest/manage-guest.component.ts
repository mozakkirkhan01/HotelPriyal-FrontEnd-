import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any;


@Component({
  selector: 'app-manage-guest',
  templateUrl: './manage-guest.component.html',
  styleUrls: ['./manage-guest.component.css']
})
export class ManageGuestComponent {

  dataLoading: boolean = false
  GuestList: any = []
  Guest: any = {}
  StateList: any = []
  isSubmitted = false
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;

  @ViewChild('formGuest') formGuest: NgForm;

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.getGuestList();
    this.getStateList();
    this.resetForm();
  }
  
  validiateMenu() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ Url: this.router.url, StaffLoginId: this.staffLogin.StaffLoginId })).toString()
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

  resetForm() {
    this.Guest = {}
    if (this.formGuest) {
      this.formGuest.control.markAsPristine();
      this.formGuest.control.markAsUntouched();
    }
    this.isSubmitted = false
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }

  getStateList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    }
    this.service.getStateList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.StateList = response.StateList;
      }
    }, (err => {
      this.toastr.error("Error while fetching states")
    }))
  }

  getGuestList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    }
    this.dataLoading = true
    this.service.getGuestList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.GuestList = response.GuestList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false
    }))
  }

  saveGuest() {
    this.isSubmitted = true;
    this.formGuest.control.markAllAsTouched();
    if (this.formGuest.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Guest)).toString()
    }
    
    this.dataLoading = true;
    this.service.saveGuest(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Guest.GuestId > 0) {
          this.toastr.success("Guest detail updated successfully")
        } else {
          this.toastr.success("Guest added successfully")
        }
        $('#guestModal').modal('hide')
        this.resetForm()
        this.getGuestList()
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  deleteGuest(obj: any) {
    if (confirm("Are you sure you want to delete this guest?")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true
      this.service.deleteGuest(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Guest deleted successfully")
          this.getGuestList()
        } else {
          this.toastr.error(response.Message)
        }
        this.dataLoading = false
      }, (err => {
        this.toastr.error("Error occured while deleting the record")
        this.dataLoading = false
      }))
    }
  }

  editGuest(obj: any) {
    this.Guest = { ...obj };
    this.isSubmitted = false;
  }
}