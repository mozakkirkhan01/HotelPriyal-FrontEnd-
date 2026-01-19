import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ConstantData } from './constant-data';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private readonly apiUrl: string = ConstantData.getApiUrl();
  private readonly baseUrl: string = ConstantData.getBaseUrl();
  private readonly headers: HttpHeaders = new HttpHeaders({ 'AppKey': ConstantData.getAdminKey() });

  constructor(private http: HttpClient) {
  }

  getImageUrl(): string {
    return ConstantData.getBaseUrl();
  }
// office-transaction
  getOfficeTransactionList(obj: any) {
    return this.http.post(this.apiUrl + "OETransaction/OfficeTransactionList", obj, { headers: this.headers })
  }

  saveOfficeTransaction(obj: any) {
    return this.http.post(this.apiUrl + "OETransaction/saveOfficeTransaction", obj, { headers: this.headers })
  }
  
  deleteOfficeTransaction(obj: any) {
    return this.http.post(this.apiUrl + "OETransaction/deleteOfficeTransaction", obj, { headers: this.headers })
  }


  // office-expense-head
  getOfficeExpenseHeadList(obj: any) {
    return this.http.post(this.apiUrl + "OfficeExpenseHead/OfficeExpenseHeadList", obj, { headers: this.headers })
  }

  saveOfficeExpenseHead(obj: any) {
    return this.http.post(this.apiUrl + "OfficeExpenseHead/saveOfficeExpenseHead", obj, { headers: this.headers })
  }
  deleteOfficeExpenseHead(obj: any) {
    return this.http.post(this.apiUrl + "OfficeExpenseHead/deleteOfficeExpenseHead", obj, { headers: this.headers })
  }

  // Office Expense Category

  getOfficeExpenseCategoryList(obj: any) {
    return this.http.post(this.apiUrl + "OfficeExpenseCategory/OfficeExpenseCategoryList", obj, { headers: this.headers })
  }

  saveOfficeExpenseCategory(obj: any) {
    return this.http.post(this.apiUrl + "OfficeExpenseCategory/saveOfficeExpenseCategory", obj, { headers: this.headers })
  }
  deleteOfficeExpenseCategory(obj: any) {
    return this.http.post(this.apiUrl + "OfficeExpenseCategory/deleteOfficeExpenseCategory", obj, { headers: this.headers })
  }

  // Booking
  getBookingList(obj: any) {
    return this.http.post(this.apiUrl + "Booking/BookingList", obj, { headers: this.headers })
  }

    getBookingListById(obj: any) {
    return this.http.post(this.apiUrl + "Booking/getBookingById", obj, { headers: this.headers })
  }

  saveBooking(obj: any) {
    return this.http.post(this.apiUrl + "Booking/saveBooking", obj, { headers: this.headers })
  }

  deleteBooking(obj: any) {
    return this.http.post(this.apiUrl + "Booking/deleteBooking", obj, { headers: this.headers })
  }

  cancelBooking(obj: any) {
    return this.http.post(this.apiUrl + "Booking/cancelBooking", obj, { headers: this.headers })
  }

  CheckoutBooking(obj: any) {
    return this.http.post(this.apiUrl + "Booking/CheckoutBooking", obj, { headers: this.headers })
  }

  //billing

  getBillingList(obj: any) {
    return this.http.post(this.apiUrl + "Billing/getBillingList", obj, { headers: this.headers })
  }
  saveBilling(obj: any) {
    return this.http.post(this.apiUrl + "Billing/saveBilling", obj, { headers: this.headers })
  }

  deleteBilling(obj: any) {
    return this.http.post(this.apiUrl + "Billing/deleteBilling", obj, { headers: this.headers })
  }


  //hotel
  getHotelList(obj: any) {
    return this.http.post(this.apiUrl + "Hotel/HotelList", obj, { headers: this.headers })
  }

  saveHotel(obj: any) {
    return this.http.post(this.apiUrl + "Hotel/saveHotel", obj, { headers: this.headers })
  }

  deleteHotel(obj: any) {
    return this.http.post(this.apiUrl + "Hotel/deleteHotel", obj, { headers: this.headers })
  }

  //BookingSourceType
  getBookingSourceTypeList(obj: any) {
    return this.http.post(this.apiUrl + "BookingSourceType/BookingSourceTypeList", obj, { headers: this.headers })
  }

  saveBookingSourceType(obj: any) {
    return this.http.post(this.apiUrl + "BookingSourceType/saveBookingSourceType", obj, { headers: this.headers })
  }

  deleteBookingSourceType(obj: any) {
    return this.http.post(this.apiUrl + "BookingSourceType/deleteBookingSourceType", obj, { headers: this.headers })
  }

  // RoomType
  getRoomTypeList(obj: any) {
    return this.http.post(this.apiUrl + "RoomType/RoomTypeList", obj, { headers: this.headers })
  }

  saveRoomType(obj: any) {
    return this.http.post(this.apiUrl + "RoomType/saveRoomType", obj, { headers: this.headers })
  }

  deleteRoomType(obj: any) {
    return this.http.post(this.apiUrl + "RoomType/deleteRoomType", obj, { headers: this.headers })
  }

  //Floor
  getFloorList(obj: any) {
    return this.http.post(this.apiUrl + "Floor/FloorList", obj, { headers: this.headers })
  }

  saveFloor(obj: any) {
    return this.http.post(this.apiUrl + "Floor/saveFloor", obj, { headers: this.headers })
  }

  deleteFloor(obj: any) {
    return this.http.post(this.apiUrl + "Floor/deleteFloor", obj, { headers: this.headers })
  }

  //Guest
  getGuestList(obj: any) {
    return this.http.post(this.apiUrl + "Guest/GuestList", obj, { headers: this.headers })
  }

  saveGuest(obj: any) {
    return this.http.post(this.apiUrl + "Guest/saveGuest", obj, { headers: this.headers })
  }

  deleteGuest(obj: any) {
    return this.http.post(this.apiUrl + "Guest/deleteGuest", obj, { headers: this.headers })
  }

  //Room
  getRoomList(obj: any) {
    return this.http.post(this.apiUrl + "Room/RoomList", obj, { headers: this.headers })
  }

  saveRoom(obj: any) {
    return this.http.post(this.apiUrl + "Room/saveRoom", obj, { headers: this.headers })
  }

  deleteRoom(obj: any) {
    return this.http.post(this.apiUrl + "Room/deleteRoom", obj, { headers: this.headers })
  }

  // gst
    saveGST(obj: any) {
    return this.http.post(this.apiUrl + "gst/saveGST", obj,{ headers: this.headers })
  }
  

  getGSTList(obj: any) {
    return this.http.post(this.apiUrl + 'gst/GstList', obj, { headers: this.headers })
  }

  
  deleteGST(obj: any) {
        return this.http.post(this.apiUrl + 'gst/DeleteGST', obj, { headers: this.headers })
  }

  // District
  getDistrictList(obj: any) {
    return this.http.post(this.apiUrl + "District/DistrictList", obj, { headers: this.headers })
  }

  saveDistrict(obj: any) {
    return this.http.post(this.apiUrl + "District/saveDistrict", obj, { headers: this.headers })
  }

  deleteDistrict(obj: any) {
    return this.http.post(this.apiUrl + "District/deleteDistrict", obj, { headers: this.headers })
  }

  // Company
  getCompanyList(obj: any) {
    return this.http.post(this.apiUrl + "Company/CompanyList", obj, { headers: this.headers })
  }

  saveCompany(obj: any) {
    return this.http.post(this.apiUrl + "Company/saveCompany", obj, { headers: this.headers })
  }

  deleteCompany(obj: any) {
    return this.http.post(this.apiUrl + "Company/deleteCompany", obj, { headers: this.headers })
  }

  // Designation 
  getDesignationList(obj: any) {
    return this.http.post(this.apiUrl + "Designation/DesignationList", obj, { headers: this.headers })
  }

  saveDesignation(obj: any) {
    return this.http.post(this.apiUrl + "Designation/saveDesignation", obj, { headers: this.headers })
  }

  deleteDesignation(obj: any) {
    return this.http.post(this.apiUrl + "Designation/deleteDesignation", obj, { headers: this.headers })
  }

  /* ---------------------------------------------------------------------- */

  //Department
  getDepartmentList(obj: any) {
    return this.http.post(this.apiUrl + "Department/DepartmentList", obj, { headers: this.headers })
  }

  saveDepartment(obj: any) {
    return this.http.post(this.apiUrl + "Department/saveDepartment", obj, { headers: this.headers })
  }

  deleteDepartment(obj: any) {
    return this.http.post(this.apiUrl + "Department/deleteDepartment", obj, { headers: this.headers })
  }

  /* ---------------------------------------------------------------------- */

  // Staff
  getStaffList(obj: any) {
    return this.http.post(this.apiUrl + "Staff/StaffList", obj, { headers: this.headers })
  }

  saveStaff(obj: any) {
    return this.http.post(this.apiUrl + "Staff/saveStaff", obj, { headers: this.headers })
  }

  deleteStaff(obj: any) {
    return this.http.post(this.apiUrl + "Staff/deleteStaff", obj, { headers: this.headers })
  }

  /* ---------------------------------------------------------------------- */

  // Staff Login
  StaffLogin(obj: any) {
    return this.http.post(this.apiUrl + "StaffLogin/StaffLogin", obj, { headers: this.headers })
  }

  getStaffLoginList(obj: any) {
    return this.http.post(this.apiUrl + "StaffLogin/StaffLoginList", obj, { headers: this.headers })
  }

  saveStaffLogin(obj: any) {
    return this.http.post(this.apiUrl + "StaffLogin/saveStaffLogin", obj, { headers: this.headers })
  }

  deleteStaffLogin(obj: any) {
    return this.http.post(this.apiUrl + "StaffLogin/deleteStaffLogin", obj, { headers: this.headers })
  }

  changePassword(obj: any) {
    return this.http.post(this.apiUrl + "StaffLogin/changePassword", obj, { headers: this.headers })
  }

  /* ---------------------------------------------------------------------- */

  //PageGroup
  getPageGroupList(obj: any) {
    return this.http.post(this.apiUrl + "PageGroup/PageGroupList", obj, { headers: this.headers })
  }

  savePageGroup(obj: any) {
    return this.http.post(this.apiUrl + "PageGroup/savePageGroup", obj, { headers: this.headers })
  }

  deletePageGroup(obj: any) {
    return this.http.post(this.apiUrl + "PageGroup/deletePageGroup", obj, { headers: this.headers })
  }

  /* ---------------------------------------------------------------------- */

  //Page
  getPageList(obj: any) {
    return this.http.post(this.apiUrl + "Page/PageList", obj, { headers: this.headers })
  }

  savePage(obj: any) {
    return this.http.post(this.apiUrl + "Page/savePage", obj, { headers: this.headers })
  }

  deletePage(obj: any) {
    return this.http.post(this.apiUrl + "Page/deletePage", obj, { headers: this.headers })
  }

  /* ---------------------------------------------------------------------- */

  //Menu
  getUserMenuList(obj: any) {
    return this.http.post(this.apiUrl + "Menu/UserMenuList", obj, { headers: this.headers })
  }

  validiateMenu(obj: any) {
    return this.http.post(this.apiUrl + "Menu/ValidiateMenu", obj, { headers: this.headers })
  }

  getMenuList(obj: any) {
    return this.http.post(this.apiUrl + "Menu/MenuList", obj, { headers: this.headers })
  }

  saveMenu(obj: any) {
    return this.http.post(this.apiUrl + "Menu/saveMenu", obj, { headers: this.headers })
  }

  deleteMenu(obj: any) {
    return this.http.post(this.apiUrl + "Menu/deleteMenu", obj, { headers: this.headers })
  }

  menuUp(obj: any) {
    return this.http.post(this.apiUrl + "Menu/MenuUp", obj, { headers: this.headers })
  }

  menuDown(obj: any) {
    return this.http.post(this.apiUrl + "Menu/MenuDown", obj, { headers: this.headers })
  }

  /* ---------------------------------------------------------------------- */

  //Role
  getRoleList(obj: any) {
    return this.http.post(this.apiUrl + "Role/RoleList", obj, { headers: this.headers })
  }

  saveRole(obj: any) {
    return this.http.post(this.apiUrl + "Role/saveRole", obj, { headers: this.headers })
  }

  deleteRole(obj: any) {
    return this.http.post(this.apiUrl + "Role/deleteRole", obj, { headers: this.headers })
  }

  /* ---------------------------------------------------------------------- */

  //RoleMenu
  getRoleMenuList(obj: any) {
    return this.http.post(this.apiUrl + "RoleMenu/AllRoleMenuList", obj, { headers: this.headers })
  }

  saveRoleMenu(obj: any) {
    return this.http.post(this.apiUrl + "RoleMenu/saveRoleMenu", obj, { headers: this.headers })
  }

  /* ---------------------------------------------------------------------- */

  //StaffLoginRole
  getStaffLoginRoleList(obj: any) {
    return this.http.post(this.apiUrl + "StaffLoginRole/StaffLoginRoleList", obj, { headers: this.headers })
  }

  saveStaffLoginRole(obj: any) {
    return this.http.post(this.apiUrl + "StaffLoginRole/saveStaffLoginRole", obj, { headers: this.headers })
  }

  deleteStaffLoginRole(obj: any) {
    return this.http.post(this.apiUrl + "StaffLoginRole/deleteStaffLoginRole", obj, { headers: this.headers })
  }

  //State
  getStateList(obj: any) {
    return this.http.post(this.apiUrl + "State/StateList", obj, { headers: this.headers })
  }

  saveState(obj: any) {
    return this.http.post(this.apiUrl + "State/saveState", obj, { headers: this.headers })
  }

  deleteState(obj: any) {
    return this.http.post(this.apiUrl + "State/deleteState", obj, { headers: this.headers })
  }

  /* ---------------------------------------------------------------------- */

  //City
  getCityList(obj: any) {
    return this.http.post(this.apiUrl + "City/CityList", obj, { headers: this.headers })
  }

  saveCity(obj: any) {
    return this.http.post(this.apiUrl + "City/saveCity", obj, { headers: this.headers })
  }

  deleteCity(obj: any) {
    return this.http.post(this.apiUrl + "City/deleteCity", obj, { headers: this.headers })
  }


  PrintBill(ids : any) {
    window.open(this.baseUrl + "report/PrintBill/" + ids);
}
}
