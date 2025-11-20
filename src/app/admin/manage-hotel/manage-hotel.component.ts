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
  selector: 'app-manage-hotel',
  templateUrl: './manage-hotel.component.html',
  styleUrls: ['./manage-hotel.component.css']
})
export class ManageHotelComponent {

  dataLoading: boolean = false
  HotelList: any = []
  Hotel: any = {}
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
  imageUrl = ConstantData.getBaseUrl();
  HeaderImagePhoto: string | null = null;
  LogoPhoto: string | null = null;

  @ViewChild('formHotel') formHotel: NgForm;

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
    this.getHotelList();
    this.resetForm();
    this.getStateList();
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

  setHeaderImageFile(event: any) {
    var file: File = event.target.files[0];
    if (file.type != 'image/jpeg' && file.type != 'image/jpg' && file.type != 'image/png') {
      this.toastr.error("Invalid file format !!");
      this.Hotel.HeaderImage = '';
      this.HeaderImagePhoto = this.imageUrl + this.Hotel.HeaderImage;
      return;
    }
    if (file.size < 512000) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', (e1: any) => {
        var dataUrl = e1.target.result;
        var base64Data: string = dataUrl.substr(dataUrl.indexOf('base64,') + 'base64,'.length);
        this.Hotel.HeaderImage = base64Data;
        this.HeaderImagePhoto = `data:image/jpeg;base64,${base64Data}`;
      });

    } else {
      this.Hotel.HeaderImage = '';
      this.HeaderImagePhoto = this.imageUrl + this.Hotel.HeaderImage;
      this.toastr.error("File size should be less than 500 KB.");
    }
  }

  setLogoFile(event: any) {
    var file: File = event.target.files[0];
    if (file.type != 'image/jpeg' && file.type != 'image/jpg' && file.type != 'image/png') {
      this.toastr.error("Invalid file format !!");
      this.Hotel.Logo = '';
      this.LogoPhoto = this.imageUrl + this.Hotel.Logo;
      return;
    }
    if (file.size < 512000) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', (e1: any) => {
        var dataUrl = e1.target.result;
        var base64Data: string = dataUrl.substr(dataUrl.indexOf('base64,') + 'base64,'.length);
        this.Hotel.Logo = base64Data;
        this.LogoPhoto = `data:image/jpeg;base64,${base64Data}`;
      });

    } else {
      this.Hotel.Logo = '';
      this.LogoPhoto = this.imageUrl + this.Hotel.Logo;
      this.toastr.error("File size should be less than 500 KB.");
    }
  }

  resetForm() {
    this.Hotel = {}
    this.HeaderImagePhoto = null;
    this.LogoPhoto = null;
    if (this.formHotel) {
      this.formHotel.control.markAsPristine();
      this.formHotel.control.markAsUntouched();
    }
    this.isSubmitted = false
    this.Hotel.Status = 1
    this.Hotel.CreatedBy = this.staffLogin.StaffLoginId;
    this.Hotel.UpdatedBy = this.staffLogin.StaffLoginId;
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
    this.dataLoading = true
    this.service.getHotelList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.HotelList = response.HotelList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false
    }))
  }

  saveHotel() {
    this.isSubmitted = true;
    this.formHotel.control.markAllAsTouched();
    if (this.formHotel.invalid) {
      this.toastr.error("Fill all the required fields !!")
      return
    }
    
    // Set UpdatedBy for both create and update operations
    this.Hotel.UpdatedBy = this.staffLogin.StaffLoginId;
    
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(this.Hotel)).toString()
    }
    
    this.dataLoading = true;
    this.service.saveHotel(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        if (this.Hotel.HotelId > 0) {
          this.toastr.success("Hotel detail updated successfully")
        } else {
          this.toastr.success("Hotel added successfully")
        }
        $('#hotelModal').modal('hide')
        this.resetForm()
        this.getHotelList()
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error occured while submitting data")
      this.dataLoading = false;
    }))
  }

  deleteHotel(obj: any) {
    if (confirm("Are you sure you want to delete this record?")) {
      var request: RequestModel = {
        request: this.localService.encrypt(JSON.stringify(obj)).toString()
      }
      this.dataLoading = true
      this.service.deleteHotel(request).subscribe(r1 => {
        let response = r1 as any
        if (response.Message == ConstantData.SuccessMessage) {
          this.toastr.success("Hotel deleted successfully")
          this.getHotelList()
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

  editHotel(obj: any) {
    this.Hotel = { ...obj };
    
    // Set image previews if images exist
    if (this.Hotel.Logo) {
      this.LogoPhoto = this.imageUrl + this.Hotel.Logo;
    }
    if (this.Hotel.HeaderImage) {
      this.HeaderImagePhoto = this.imageUrl + this.Hotel.HeaderImage;
    }
    
    this.isSubmitted = false;
  }

  StateList: any[] = [];
  filterState: any[] = [];
  filterCity: any[] = [];
  CityList: any = []
  City: any = {}


  getStateList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ })).toString()
    }
    this.dataLoading = true
    this.service.getStateList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.StateList = response.StateList;
        this.filterState= this.StateList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

  getCityList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({StateId: this.Hotel.StateId })).toString()
    }
    this.dataLoading = true
    this.service.getCityList(obj).subscribe(r1 => {
      let response = r1 as any
      if (response.Message == ConstantData.SuccessMessage) {
        this.CityList = response.CityList;
        this.filterCity= this.CityList;
      } else {
        this.toastr.error(response.Message)
      }
      this.dataLoading = false
    }, (err => {
      this.toastr.error("Error while fetching records")
      this.dataLoading = false;
    }))
  }

    filterStateList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.filterState = this.StateList.filter((option: any) => option.StateName.toLowerCase().includes(filterValue));
    } else {
      this.filterState = this.StateList;
    }
  }


  
  afterStateSelected(event: any) {
    this.Hotel.StateId  = event.option.id;
    this.getCityList();
  }

  filterCityList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.filterCity = this.CityList.filter((option: any) => option.CityName.toLowerCase().includes(filterValue));
    } else {
      this.filterCity = this.CityList;
    }
  }

  afterCitySelected(event: any) {
    this.Hotel.CityId  = event.option.id;
  }
}