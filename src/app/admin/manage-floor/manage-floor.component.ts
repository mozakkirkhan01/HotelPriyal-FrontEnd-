import { Component,ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Status } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import { ActionModel, RequestModel, StaffLoginModel } from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { Router } from '@angular/router';
declare var $: any

@Component({
  selector: 'app-manage-floor',
  templateUrl: './manage-floor.component.html',
  styleUrls: ['./manage-floor.component.css']
})
export class ManageFloorComponent {
dataLoading: boolean = false
    FloorList: any = []
    Floor: any = {}
    isSubmitted = false
    PageSize = ConstantData.PageSizes;
    p: number = 1;
    Search: string = '';
    reverse: boolean = false;
    sortKey: string = '';
    itemPerPage: number = this.PageSize[0];
    HotelList: any[] = [];
    filterHotel: any[] = [];
    StatusList = this.loadData.GetEnumList(Status);
    action: ActionModel = {} as ActionModel;
    staffLogin: StaffLoginModel = {} as StaffLoginModel;
    AllStatusList = Status;
    sort(key: any) {
      this.sortKey = key;
      this.reverse = !this.reverse;
    }
  
    onTableDataChange(p: any) {
      this.p = p
    }
  
    constructor(
      private service: AppService,
      private toastr: ToastrService,
      private loadData:LoadDataService,
      private localService:LocalService,
      private router: Router
    ) { }
  
    ngOnInit(): void {
      this.staffLogin = this.localService.getEmployeeDetail();
      this.validiateMenu();
      this.getFloorList();
      this.getHotelList();
      this.resetForm();
    }
    validiateMenu() {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify({ Url: this.router.url,StaffLoginId:this.staffLogin.StaffLoginId })).toString()
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
  
    @ViewChild('formCity') formCity: NgForm;
    resetForm() {
      this.Floor = {};
      if (this.formCity) {
        this.formCity.control.markAsPristine();
        this.formCity.control.markAsUntouched();
      }
      this.isSubmitted = false
      this.Floor.Status = 1
    }
  
    filterHotelList(value: any) {
      if (value) {
        const filterValue = value.toLowerCase();
        this.filterHotel = this.HotelList.filter((option: any) => option.HotelName.toLowerCase().includes(filterValue));
      } else {
        this.filterHotel = this.HotelList;
      }
    }
  
    afterHotelSelected(event: any) {
      this.Floor.HotelId  = event.option.id;
    }
    
    getHotelList() {
      var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify({ })).toString()
      }
      this.dataLoading = true
      this.service.getHotelList(obj).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.HotelList = response.HotelList;
          this.filterHotel= this.HotelList;
        } else {
          this.toastr.error(response.Message)
        }
        this.dataLoading = false;
      }, (err => {
        this.toastr.error("Error while fetching records")
        this.dataLoading = false;
      }))
    }
  
    getFloorList() {
      var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify({ })).toString()
      }
      this.dataLoading = true
      this.service.getFloorList(obj).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.FloorList = response.FloorList;
        } else {
          this.toastr.error(response.Message)
        }
        this.dataLoading = false
      }, (err => {
        this.toastr.error("Error while fetching records")
        this.dataLoading = false;
      }))
    }
  
    saveFloor() {
      this.isSubmitted = true;
      this.formCity.control.markAllAsTouched();
      if (this.formCity.invalid) {
        this.toastr.error("Fill all the required fields !!")
        return
      }
      var obj: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(this.Floor)).toString()
      }
      this.dataLoading = true;
      this.service.saveFloor(obj).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          if (this.Floor.FloorId > 0) {
            this.toastr.success("Room Type Updated successfully")
            $('#staticBackdrop').modal('hide')
          } else {
            this.toastr.success("Room Type added successfully")
          }
          this.resetForm()
          this.getFloorList()
        } else {
          this.toastr.error(response.Message)
          this.dataLoading = false;
        }
      }, (err => {
        this.toastr.error("Error occured while submitting data")
        this.dataLoading = false;
      }))
    }
  
    deleteFloor(obj: any) {
      if (confirm("Are your sure you want to delete this recored")) {
        var request: RequestModel = {
          request: this.localService.encrypt(JSON.stringify(obj)).toString()
        }
        this.dataLoading = true;
        this.service.deleteFloor(request).subscribe(r1 => {
          let response = r1 as any
          if (response.Message == ConstantData.SuccessMessage) {
            this.toastr.success("Record Deleted successfully")
            this.getFloorList()
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
  
    editFloor(obj: any) {
      this.resetForm()
      this.Floor = obj
    }
  
}
