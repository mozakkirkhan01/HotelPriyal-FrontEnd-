import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { AdminMasterComponent } from './admin/admin-master/admin-master.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { DesignationComponent } from './admin/designation/designation.component';
import { DepartmentComponent } from './admin/department/department.component';
import { StaffComponent } from './admin/staff/staff.component';
import { StaffLoginComponent } from './admin/staff-login/staff-login.component';
import { PageGroupComponent } from './admin/page-group/page-group.component';
import { PageComponent } from './admin/page/page.component';
import { MenuComponent } from './admin/menu/menu.component';
import { RoleComponent } from './admin/role/role.component';
import { RoleMenuComponent } from './admin/role-menu/role-menu.component';
import { StateComponent } from './admin/state/state.component';
import { CityComponent } from './admin/city/city.component';
import { ChangePasswordComponent } from './admin/change-password/change-password.component';
import { CompanyComponent } from './admin/company/company.component';
import { ManageHotelComponent } from './admin/manage-hotel/manage-hotel.component';
import { ManageBookingSourceTypeComponent } from './admin/manage-booking-source-type/manage-booking-source-type.component';
import { ManageRoomTypeComponent } from './admin/manage-room-type/manage-room-type.component';
import { ManageFloorComponent } from './admin/manage-floor/manage-floor.component';
import { ManageGuestComponent } from './admin/manage-guest/manage-guest.component';
import { ManageRoomComponent } from './admin/manage-room/manage-room.component';
import { ManageRoomBookingComponent } from './admin/manage-room-booking/manage-room-booking.component';
import { GstComponent } from './admin/gst/gst.component';
import { ManageRoomBookingListComponent } from './admin/manage-room-booking-list/manage-room-booking-list.component';
import { ManageRoomBookingListTodayComponent } from './admin/manage-room-booking-list-today/manage-room-booking-list-today.component';
import { ManageCancelRoomBookingListComponent } from './admin/manage-cancel-room-booking-list/manage-cancel-room-booking-list.component';
import { OfficeExpenseCategoryComponent } from './admin/office-expense-category/office-expense-category.component';
import { OfficeExpenseHeadComponent } from './admin/office-expense-head/office-expense-head.component';
import { OfficeTransactionComponent } from './admin/office-transaction/office-transaction.component';
import { ManageBillingComponent } from './admin/manage-billing/manage-billing.component';
import { BillingListComponent } from './admin/billing-list/billing-list.component';
import { BillingListTodayComponent } from './admin/billing-list-today/billing-list-today.component';
const routes: Routes = [
  { path: '', redirectTo: "/admin-login", pathMatch: 'full' },
  { path: 'admin-login', component: AdminLoginComponent },
  {
    path: 'admin', component: AdminMasterComponent, children: [
      { path: 'admin-dashboard', component: AdminDashboardComponent },
      { path: 'designation', component: DesignationComponent },
      { path: 'department', component: DepartmentComponent },
      { path: 'staff', component: StaffComponent },
      { path: 'staffLogin', component: StaffLoginComponent },
      { path: 'page-group', component: PageGroupComponent },
      { path: 'page', component: PageComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'role', component: RoleComponent },
      { path: 'role-menu', component: RoleMenuComponent },
      { path: 'role-menu/:id', component: RoleMenuComponent },
      { path: 'state', component: StateComponent },
      { path: 'city', component: CityComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'company', component: CompanyComponent },
      { path: 'manage-hotel', component: ManageHotelComponent },
      { path: 'manage-booking-source-type', component: ManageBookingSourceTypeComponent },
      { path: 'manage-room-type', component: ManageRoomTypeComponent },
      { path: 'manage-floor', component: ManageFloorComponent },
      { path: 'manage-guest', component: ManageGuestComponent },
      { path: 'manage-room', component: ManageRoomComponent },
      { path: 'manage-room-booking', component: ManageRoomBookingComponent },
      { path: 'manage-room-booking/:id', component: ManageRoomBookingComponent },
      { path: 'gst', component: GstComponent },
      { path: 'manage-room-booking-list', component: ManageRoomBookingListComponent },
      { path: 'manage-room-booking-list-today', component: ManageRoomBookingListTodayComponent },
      { path: 'manage-cancel-room-booking-list', component: ManageCancelRoomBookingListComponent },
      { path: 'office-expense-category', component: OfficeExpenseCategoryComponent },
      { path: 'office-expense-head', component: OfficeExpenseHeadComponent },
      { path: 'office-transaction', component: OfficeTransactionComponent },
      { path: 'manage-billing', component: ManageBillingComponent },
      { path: 'billing-list', component: BillingListComponent },
      { path: 'billing-list-today', component: BillingListTodayComponent },
    ]
  },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
