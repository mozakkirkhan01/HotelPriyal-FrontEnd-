import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { LocalService } from '../../utils/local.service';
import { RequestModel, StaffLoginModel } from '../../utils/interface';

interface Room {
  RoomId: number;
  HotelId: number;
  RoomName: string;
  RoomTypeId: number;
  FloorId: number;
  RoomChargeAmount: number;
  HSNCode: string;
  IsAvailable: boolean;
  Status: boolean;
  RoomTypeName?: string;
  FloorName?: string;
  HotelName?: string;
}

interface Floor {
  FloorId: number;
  HotelId: number;
  FloorName: string;
  Status: boolean;
}

interface RoomType {
  RoomTypeId: number;
  RoomTypeName: string;
  HotelId: number;
  Status: boolean;
}

interface Hotel {
  HotelId: number;
  HotelName: string;
  Status: boolean;
}

interface FloorGroup {
  floor: Floor;
  rooms: Room[];
}

interface HotelGroup {
  hotel: Hotel;
  availableRooms: number;
  occupiedRooms: number;
  totalRooms: number;
  floors: FloorGroup[];
}

// Role-based permissions configuration
enum UserRole {
  ADMIN = 5,
  STAFF = 'OTHER' // Any role other than 5
}

interface RolePermissions {
  canFilterRooms: boolean;
  canViewAllStats: boolean;
  dashboardType: 'admin' | 'staff';
}

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
  RoomList: any = [];

  rooms: Room[] = [];
  floors: Floor[] = [];
  roomTypes: RoomType[] = [];
  hotels: Hotel[] = [];
  floorGroups: FloorGroup[] = [];
  hotelGroups: HotelGroup[] = [];
  
  selectedFloor: number | null = null;
  selectedRoomType: number | null = null;
  selectedHotel: number | null = null;
  viewMode: 'all' | 'hotel' = 'all'; // New view mode toggle

  availableCount = 0;
  occupiedCount = 0;
  totalCount = 0;

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private localService: LocalService
  ) { }

  ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    // this.initializeFilters();
    this.loadDashboardData();
     this.processData();
  }

  // ============================================
  // ROLE-BASED COMPUTED PROPERTIES (GETTERS)
  // ============================================

  /**
   * Check if current user is Admin
   */
  get isAdmin(): boolean {
    return this.staffLogin.RoleId === UserRole.ADMIN;
  }

  /**
   * Check if current user is Staff
   */
  get isStaff(): boolean {
    return this.staffLogin.RoleId !== UserRole.ADMIN;
  }

  /**
   * Get role-based permissions
   */
  get rolePermissions(): RolePermissions {
    if (this.isAdmin) {
      return {
        canFilterRooms: true,
        canViewAllStats: true,
        dashboardType: 'admin'
      };
    }
    return {
      canFilterRooms: false,
      canViewAllStats: false,
      dashboardType: 'staff'
    };
  }

  /**
   * Check if hotel-wise view should be shown
   */
  get showHotelWiseView(): boolean {
    return this.isAdmin && this.viewMode === 'hotel';
  }

  /**
   * Check if all rooms view should be shown
   */
  get showAllRoomsView(): boolean {
    return this.viewMode === 'all';
  }

  /**
   * Check if filters should be displayed
   */
  get showFilters(): boolean {
    return this.rolePermissions.canFilterRooms;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize filters based on role
   * Staff: No filters (null = show all)
   * Admin: Can use filters
   */
  private initializeFilters(): void {
    // For staff, explicitly set to null to show all rooms
    // For admin, also start with null but they can change it
    this.selectedFloor = null;
    this.selectedRoomType = null;
    this.selectedHotel = null;
    this.viewMode = 'all'; // Default to all rooms view
  }

  // ============================================
  // DATA LOADING
  // ============================================

  loadDashboardData() {
    if (this.isAdmin) {
      this.loadAdminDashboard();
      
     
    } else {
      this.loadStaffDashboard();
    }
  }

  /**
   * Load Admin Dashboard with full stats
   */
  private loadAdminDashboard(): void {
    this.dataLoading = true;
    this.getDashboardStats();
    this.getRecentGuests();
    this.generateRecentActivities();
    this.getRoomAvailabilityList();
    this.loadHotelsForAdmin(); // Load hotels for hotel-wise view
    this.dataLoading = false;
  }

  /**
   * Load Staff Dashboard with room view only
   */
  private async loadStaffDashboard(): Promise<void> {
    this.dataLoading = true;
    try {
      await Promise.all([
        this.getRooms(),
        this.getFloors(),
        this.getRoomTypes()
      ]);
      this.processData();
    } catch (error) {
      this.toastr.error('Failed to load dashboard data');
    } finally {
      this.dataLoading = false;
    }
  }

  // ============================================
  // DATA PROCESSING
  // ============================================

  processData() {
    // Enrich rooms with floor and room type names
    this.rooms.forEach(room => {
      const floor = this.floors.find(f => f.FloorId === room.FloorId);
      const roomType = this.roomTypes.find(rt => rt.RoomTypeId === room.RoomTypeId);
      const hotel = this.hotels.find(h => h.HotelId === room.HotelId);
      
      room.FloorName = floor?.FloorName || 'Unknown Floor';
      room.RoomTypeName = roomType?.RoomTypeName || 'Unknown Type';
      room.HotelName = hotel?.HotelName || 'Unknown Hotel';
    });

    // Group rooms based on view mode
    if (this.viewMode === 'hotel') {
      this.groupRoomsByHotel();
    } else {
      this.groupRoomsByFloor();
    }
    
    // Calculate statistics
    this.calculateStatistics();
  }

  groupRoomsByFloor(): void {
    this.floorGroups = this.floors.map(floor => ({
      floor: floor,
      rooms: this.getFilteredRooms().filter(room => room.FloorId === floor.FloorId)
    })).filter(group => group.rooms.length > 0);
  }

  groupRoomsByHotel(): void {
    const filteredRooms = this.getFilteredRooms();
    
    this.hotelGroups = this.hotels
      .filter(hotel => hotel.Status) // Only active hotels
      .map(hotel => {
        const hotelRooms = filteredRooms.filter(room => room.HotelId === hotel.HotelId);
        
        // Group hotel rooms by floor
        const hotelFloors = this.floors
          .filter(floor => floor.HotelId === hotel.HotelId && floor.Status)
          .map(floor => ({
            floor: floor,
            rooms: hotelRooms.filter(room => room.FloorId === floor.FloorId)
          }))
          .filter(group => group.rooms.length > 0);

        return {
          hotel: hotel,
          availableRooms: hotelRooms.filter(r => r.IsAvailable).length,
          occupiedRooms: hotelRooms.filter(r => !r.IsAvailable).length,
          totalRooms: hotelRooms.length,
          floors: hotelFloors
        };
      })
      .filter(group => group.totalRooms > 0);
  }

  /**
   * Get filtered rooms based on role and selected filters
   * Staff: Always returns all active rooms (filters disabled)
   * Admin: Returns rooms based on selected filters
   */
  getFilteredRooms(): Room[] {
    let filtered = this.rooms.filter(r => r.Status);
    
    // Only apply filters if user has permission (Admin only)
    if (this.showFilters) {
      if (this.selectedHotel) {
        filtered = filtered.filter(r => r.HotelId === this.selectedHotel);
      }

      if (this.selectedFloor) {
        filtered = filtered.filter(r => r.FloorId === this.selectedFloor);
      }
      
      if (this.selectedRoomType) {
        filtered = filtered.filter(r => r.RoomTypeId === this.selectedRoomType);
      }
    }
    
    return filtered;
  }

  calculateStatistics(): void {
    const filtered = this.getFilteredRooms();
    this.totalCount = filtered.length;
    this.availableCount = filtered.filter(r => r.IsAvailable).length;
    this.occupiedCount = this.totalCount - this.availableCount;
  }

  // ============================================
  // FILTER HANDLERS (Admin Only)
  // ============================================

  onViewModeChange() {
    // if (!this.showFilters) return;
    
    // Clear filters when switching view modes
    this.selectedFloor = null;
    this.selectedRoomType = null;
    this.selectedHotel = null;
    
    this.processData();
  }

  onHotelChange(): void {
    // if (!this.showFilters) return;
    
    // When hotel changes, update floor and room type lists
    if (this.viewMode === 'hotel') {
      this.groupRoomsByHotel();
    } else {
      this.groupRoomsByFloor();
    }
    this.calculateStatistics();
  }

  onFloorChange(): void {
    // if (!this.showFilters) return;
    
    if (this.viewMode === 'hotel') {
      this.groupRoomsByHotel();
    } else {
      this.groupRoomsByFloor();
    }
    this.calculateStatistics();
  }

  onRoomTypeChange(): void {
    //  if (!this.showFilters) return;
    
    if (this.viewMode === 'hotel') {
      this.groupRoomsByHotel();
    } else {
      this.groupRoomsByFloor();
    }
    this.calculateStatistics();
  }

  resetFilters(): void {
    // if (!this.showFilters) return;
    
    this.selectedFloor = null;
    this.selectedRoomType = null;
    this.selectedHotel = null;
    
    if (this.viewMode === 'hotel') {
      this.groupRoomsByHotel();
    } else {
      this.groupRoomsByFloor();
    }
    this.calculateStatistics();
  }

  // ============================================
  // UI HELPERS
  // ============================================

  getRoomClass(room: Room): string {
    return room.IsAvailable ? 'available' : 'occupied';
  }

  getRoomStatusText(room: Room): string {
    return room.IsAvailable ? 'Available' : 'Occupied';
  }

  getRoomStatusBadgeClass(room: Room): string {
    return room.IsAvailable ? 'bg-success' : 'bg-danger';
  }

  onRoomClick(room: Room): void {
    const status = this.getRoomStatusText(room);
    this.toastr.info(`${room.RoomName} - ${status}`);
  }

  // ============================================
  // API CALLS
  // ============================================

  /**
   * Load hotels for admin hotel-wise view
   */
  async loadHotelsForAdmin(): Promise<void> {
    if (!this.isAdmin) return;

    try {
      await Promise.all([
        this.getHotels(),
        this.getRooms(),
        this.getFloors(),
        this.getRoomTypes()
      ]);
      // Data will be processed when view mode changes
    } catch (error) {
      console.error('Error loading hotel data:', error);
    }
  }

  getHotels(): Promise<any> {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };
    
    return new Promise((resolve, reject) => {
      this.service.getHotelList(obj).subscribe(r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.hotels = response.HotelList || [];
          resolve(response.HotelList);
        } else {
          this.toastr.error(response.Message);
          reject(response.Message);
        }
      }, (err => {
        this.toastr.error("Error while fetching hotels");
        reject(err);
      }));
    });
  }

  getRoomTypes() {

    if(this.staffLogin.RoleId !== 5){
       this.HotelId = this.staffLogin.HotelId;
    }else{
      this.HotelId = 0;
    }
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({HotelId:this.HotelId})).toString()
    };
    
    return new Promise((resolve, reject) => {
      this.service.getRoomTypeList(obj).subscribe(r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.roomTypes = response.RoomTypeList;
          resolve(response.RoomTypeList);
        } else {
          this.toastr.error(response.Message);
          reject(response.Message);
        }
      }, (err => {
        this.toastr.error("Error while fetching room types");
        reject(err);
      }));
    });
  }

  getFloors() {

    if(this.staffLogin.RoleId !== 5){
       this.HotelId = this.staffLogin.HotelId;
    }else{
      this.HotelId = 0;
    }
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({HotelId:this.HotelId})).toString()
    };
    
    return new Promise((resolve, reject) => {
      this.service.getFloorList(obj).subscribe(r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.floors = response.FloorList;
          resolve(response.FloorList);
        } else {
          this.toastr.error(response.Message);
          reject(response.Message);
        }
      }, (err => {
        this.toastr.error("Error while fetching floors");
        reject(err);
      }));
    });
  }

  HotelId: number;
  getRooms() {

    if(this.staffLogin.RoleId !== 5){
       this.HotelId = this.staffLogin.HotelId;
    }else{
      this.HotelId = 0;
    }
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({HotelId:this.HotelId})).toString()
    };
    
    return new Promise((resolve, reject) => {
      this.service.getRoomList(obj).subscribe(r1 => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.rooms = response.RoomList;
          resolve(response.RoomList);
        } else {
          this.toastr.error(response.Message);
          reject(response.Message);
        }
      }, (err => {
        this.toastr.error("Error while fetching rooms");
        reject(err);
      }));
    });
  }

  getDashboardStats() {
    const obj: RequestModel = {
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
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };

    this.service.getGuestList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.recentGuests = (response.GuestList || []).slice(0, 5);
      }
    });
  }

  generateRecentActivities() {
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
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString()
    };
    
    this.dataLoading = true;
    this.service.getRoomList(obj).subscribe(r1 => {
      let response = r1 as any;
      if (response.Message == ConstantData.SuccessMessage) {
        this.RoomList = response.RoomList;
      } else {
        this.toastr.error(response.Message);
      }
      this.dataLoading = false;
    }, (err => {
      this.toastr.error("Error while fetching records");
    }));
  }
}