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
  selector: 'app-manage-room',
  templateUrl: './manage-room.component.html',
  styleUrls: ['./manage-room.component.css']
})
export class ManageRoomComponent {

  dataLoading: boolean = false
  RoomList: any = []
  Room: any = {}
  HotelList: any = []
  RoomTypeList: any = []
  FloorList: any = []
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

  @ViewChild('formRoom') formRoom: NgForm;

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
    this.getRoomList();
    this.getHotelList();
    
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
    this.Room = {}
    if (this.formRoom) {
      this.formRoom.control.markAsPristine();
      this.formRoom.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.Room.Status = 1
    this.Room.IsAvailable = true
  }

  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p
  }

  getHotelList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    }
    this.service.getHotelList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.HotelList = response.HotelList;
      }
    }, (err => {
      this.toastr.error("Error while fetching hotels")
    }))
  }

  getRoomTypeList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({HotelId: this.Room.HotelId})).toString()
    }
    this.service.getRoomTypeList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.RoomTypeList = response.RoomTypeList;
      }
    }, (err => {
      this.toastr.error("Error while fetching room types")
    }))
  }

  callFunction(hotelId: number) {
    console.log(hotelId);
    
    this.Room.HotelId = hotelId;
    this.getRoomTypeList();
    this.getFloorList();
  }

  getFloorList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({HotelId: this.Room.HotelId})).toString()
    }
    this.service.getFloorList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.FloorList = response.FloorList;
      }
    }, (err => {
      this.toastr.error("Error while fetching floors")
    }))
  }

  getRoomList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    }
    this.dataLoading = true
    this.service.getRoomList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.RoomList = response.RoomList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false
    }))
  }

  saveRoom() {
    this.isSubmitted = true;
    this.formRoom.control.markAllAsTouched();
    if (this.formRoom.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Room)).toString()
    }
    
    this.dataLoading = true;
    this.service.saveRoom(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Room.RoomId > 0) {
          this.toastr.success("Room detail updated successfully")
        } else {
          this.toastr.success("Room added successfully")
        }
        // $('#roomModal').modal('hide')
        this.resetForm()
        this.getRoomList()
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  deleteRoom(obj: any) {
    if (confirm("Are you sure you want to delete this room?")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true
      this.service.deleteRoom(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Room deleted successfully")
          this.getRoomList()
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

  editRoom(obj: any) {
    this.Room = { ...obj };
    this.callFunction(this.Room.HotelId);
    this.isSubmitted = false;
  }
}