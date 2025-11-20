import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LocalService } from '../../utils/local.service';
import { RequestModel, StaffLoginModel } from '../../utils/interface';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  
  dataLoading: boolean = false;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  
  dashboardStats = {
    TotalHotels: 0,
    TotalRooms: 0,
    AvailableRooms: 0,
    OccupiedRooms: 0,
    TotalGuests: 0,
    OccupancyRate: 0,
    AvailablePercentage: 0
  };

  recentGuests: any[] = [];
  recentActivities: any[] = [];
  RoomList: any= [];

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private localService: LocalService
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.dataLoading = true;
    this.getDashboardStats();
    this.getRecentGuests();
    this.generateRecentActivities();
    this.getRoomAvailabilityList();
  }

  getDashboardStats() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    // Get Hotels Count
    this.service.getHotelList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.dashboardStats.TotalHotels = response.HotelList?.length || 0;
      }
    });

    // Get Rooms Count and Availability
    this.service.getRoomList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        const roomList = response.RoomList || [];
        this.dashboardStats.TotalRooms = roomList.length;
        this.dashboardStats.AvailableRooms = roomList.filter((r: any) => r.IsAvailable).length;
        this.dashboardStats.OccupiedRooms = roomList.filter((r: any) => !r.IsAvailable).length;
        
        if (this.dashboardStats.TotalRooms > 0) {
          this.dashboardStats.OccupancyRate = Math.round(
            (this.dashboardStats.OccupiedRooms / this.dashboardStats.TotalRooms) * 100
          );
          this.dashboardStats.AvailablePercentage = Math.round(
            (this.dashboardStats.AvailableRooms / this.dashboardStats.TotalRooms) * 100
          );
        }
      }
      this.dataLoading = false;
    }, err => {
      this.dataLoading = false;
    });

    // Get Guests Count
    this.service.getGuestList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.dashboardStats.TotalGuests = response.GuestList?.length || 0;
      }
    });
  }

  getRecentGuests() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.service.getGuestList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        // Get last 5 guests
        this.recentGuests = (response.GuestList || []).slice(0, 5);
      }
    });
  }

  generateRecentActivities() {
    // Generate some sample activities - replace with real data from your API
    this.recentActivities = [
      {
        time: '32 min',
        message: 'New guest checked in - Room 101',
        class: 'text-success'
      },
      {
        time: '56 min',
        message: 'Room 205 marked as available',
        class: 'text-primary'
      },
      {
        time: '2 hrs',
        message: 'Guest checked out from Room 304',
        class: 'text-danger'
      },
      {
        time: '1 day',
        message: 'New hotel added to system',
        class: 'text-success'
      },
      {
        time: '2 days',
        message: 'Room maintenance completed - Floor 2',
        class: 'text-primary'
      }
    ];
  }


  getRoomAvailabilityList() {
    const data = {
      HotelId: this.staffLogin.HotelId
    }
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({ })).toString()
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
    }))
  }
}