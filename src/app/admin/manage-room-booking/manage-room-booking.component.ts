import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import { Gender, PaymentMode, Status,Category, PaymentType } from '../../utils/enum';
import { LoadDataService } from '../../utils/load-data.service';
import {
  ActionModel,
  RequestModel,
  StaffLoginModel,
} from '../../utils/interface';
import { LocalService } from '../../utils/local.service';
import { ActivatedRoute, Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-manage-room-booking',
  templateUrl: './manage-room-booking.component.html',
  styleUrls: ['./manage-room-booking.component.css']
})
export class ManageRoomBookingComponent {

 dataLoading: boolean = false;
  GuestList: any = [];
  RoomList: any = [];
  ChargeList: any = [];
  FeeChargeList: any = [];
  Guest: any = {};
  Room: any = {};
  RoomBookingDetails: any = {};
  Payment: any = {};
  isSubmitted = false;
  PageSize = ConstantData.PageSizes;
  p: number = 1;
  Search: string = '';
  reverse: boolean = false;
  sortKey: string = '';
  itemPerPage: number = this.PageSize[0];
  StateList: any[] = [];
  filterState: any[] = [];
  StatusList = this.loadData.GetEnumList(Status);
  GenderList = this.loadData.GetEnumList(Gender);
  PaymentModeList = this.loadData.GetEnumList(PaymentMode);
  PaymentTypeList = this.loadData.GetEnumList(PaymentType);
  action: ActionModel = {} as ActionModel;
  staffLogin: StaffLoginModel = {} as StaffLoginModel;
  AllStatusList = Status;
  AllGenderList = Gender;
  AllCategoryList = Category;
  AllPaymentModeList = PaymentMode;
  AllPaymentTypeList = PaymentType;
  currentPayment: any = [];
  tempData: any;
  filteredGuestList: any[] = [];
  filteredRoomList: any[] = [];
  GuestListAll: any;
  OpticalList: any = [];
    isNewGuest: boolean = false; // Track if adding new guest
  selectedGuestId: number | null = null;
  selectedRoomId: number | null = null;
    GSTList: any[] = [];
    editingRoomIndex: number = -1;
  SelectedPaymentCollectionList: any[] = [];
  SelectedRoomDetailList: any = [];




  sort(key: any) {
    this.sortKey = key;
    this.reverse = !this.reverse;
  }

  onTableDataChange(p: any) {
    this.p = p;
  }

  constructor(
    private service: AppService,
    private toastr: ToastrService,
    private loadData: LoadDataService,
    private localService: LocalService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  redUrl: string = '';

    ngOnInit(): void {
    this.staffLogin = this.localService.getEmployeeDetail();
    this.validiateMenu();
    this.resetForm();
    this.getGuestList();
    this.getRoomList();
    this.getGSTList();
    this.initializeRoomBookingDetails();
    this.initializePayment();
  }

  initializeRoomBookingDetails() {
    this.RoomBookingDetails = {
      RoomName: '',
      NoOfAdult: 0,
      NoOfChild: 0,
      NoOfPerson: 0,
      NoOfDays: 1,
      ChargeAmount: 0,
      DiscountAmount: 0,
      TaxableAmount: 0,
      GSTId: null,
      GSTPercentage: 0,
      CGST: 0,
      SGST: 0,
      IGST: 0,
      TotalGSTAmount: 0,
      LineTotal: 0,
      CheckInDate: this.loadData.loadDateYMD(new Date()),
      CheckInTime: this.loadData.getCurrentTime(),
      RoomId: null
    };
  }

  initializePayment() {
    this.Payment = {
      PaymentDate: this.loadData.loadDateYMD(new Date()),
      PaidAmount: 0,
      PaymentType: null,
      PaymentMode: null,
      TransactionNo: ''
    };
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

  @ViewChild('formGuestDetails') formGuestDetails: NgForm;

// onNoOfPersonChange() {
//   const { NoOfAdult = 0, NoOfChild = 0 } = this.RoomBookingDetails;
//   this.RoomBookingDetails.NoOfPerson = NoOfAdult + NoOfChild;
// }

  getGSTList() {
    this.dataLoading = true;
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.service.getGSTList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.GSTList = response.GSTList;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error Occurred while fetching data.');
        this.dataLoading = false;
      }
    );
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

  resetForm() {
    this.Guest = { BookingDate: this.loadData.loadDateYMD(new Date()) };
    this.isNewGuest = false;
    this.selectedGuestId = null;
    this.SelectedRoomDetailList = [];
    this.SelectedPaymentCollectionList = [];
    this.initializeRoomBookingDetails();
    this.initializePayment();
    this.editingRoomIndex = -1;
    if (this.formGuestDetails) {
      this.formGuestDetails.control.markAsPristine();
      this.formGuestDetails.control.markAsUntouched();
    }
    this.isSubmitted = false;
  }
  filterGuestList(value: string) {
    const filterValue = value?.toLowerCase() || '';

    this.filteredGuestList = this.GuestList.filter(
      (option: any) =>
        option.GuestName?.toLowerCase().includes(filterValue) ||
        option.ContactNo?.toLowerCase().includes(filterValue) ||
        option.GuestMobile?.toLowerCase().includes(filterValue)
    );

    if (this.filteredGuestList.length === 0 && value && value.length > 0) {
      this.isNewGuest = true;
      this.selectedGuestId = null;
      this.Guest.GuestName = value;
    } else if (value.length === 0) {
      this.isNewGuest = false;
      this.selectedGuestId = null;
    }
  }

  afterGuestSelected(event: any) {
    const selectedName = event.option.value;

    const selected = this.GuestList.find(
      (x: any) => x.GuestName === selectedName
    );

    if (selected) {
      this.isNewGuest = false;
      this.selectedGuestId = selected.GuestId;
      this.Guest = { 
        ...selected,
        GuestName: selected.GuestName,
        ContactNo: selected.MobileNo || selected.ContactNo || selected.GuestMobile,
        AadharNo: selected.AadharNo,
        Address: selected.Address,
        Age: selected.Age,
        Gender: selected.Gender,
        Category: selected.Category,
        Email: selected.Email,
        AlternativeMobileNo: selected.AlternativeMobileNo,
        Pincode: selected.Pincode,
        StateId: selected.StateId,
        GSTNo: selected.GSTNo,
        CompanyName: selected.CompanyName,
        BookingDate: this.loadData.loadDateYMD(new Date()),
      };
    }
  }

  clearGuest() {
    this.filteredGuestList = this.GuestList;
    this.Guest = {};
    this.isNewGuest = false;
    this.selectedGuestId = null;
    this.Guest.BookingDate = this.loadData.loadDateYMD(new Date());
  }

  isFieldReadonly(): boolean {
    return !this.isNewGuest && this.selectedGuestId !== null;
  }


  // room 

   getRoomList() {

    const data ={
      HotelId: this.staffLogin.HotelId,
      IsAvailable: true,
      Status: 1
    }
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString()
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


filterRoomList(value: string) {
    const filterValue = value?.toLowerCase() || '';
    this.filteredRoomList = this.RoomList.filter((option: any) =>
      option.RoomName?.toLowerCase().includes(filterValue) ||
      option.FloorName?.toLowerCase().includes(filterValue) ||
      option.RoomTypeName?.toLowerCase().includes(filterValue)
    );
    if (this.filteredRoomList.length === 0 && value && value.length > 0) {
      this.selectedRoomId = null;
    } else if (value.length === 0) {
      this.selectedRoomId = null;
    }
  }

  afterRoomSelected(event: any) {
    const selectedRoomId = event.option.id;
    const selected = this.RoomList.find((x: any) => x.RoomId === selectedRoomId);
    if (selected) {
      this.selectedRoomId = selected.RoomId;
      this.RoomBookingDetails.RoomId = selected.RoomId;
      this.RoomBookingDetails.RoomName = `${selected.FloorName} / ${selected.RoomName} / ${selected.RoomTypeName}`;
      this.RoomBookingDetails.ChargeAmount = selected.RoomChargeAmount || 0;
      this.RoomBookingDetails.HSNCode = selected.HSNCode;
      this.calculateRoomCharges();
    }
  }

  clearRoom() {
    this.initializeRoomBookingDetails();
    this.selectedRoomId = null;
    this.editingRoomIndex = -1;
  }

  onNoOfPersonChange() {
    const { NoOfAdult = 0, NoOfChild = 0 } = this.RoomBookingDetails;
    this.RoomBookingDetails.NoOfPerson = NoOfAdult + NoOfChild;
  }

  onNoOfDaysChange() {
    this.calculateRoomCharges();
  }

  onDiscountChange() {
    this.calculateRoomCharges();
  }



  onGSTChange() {
    const selectedGST = this.GSTList.find(g => g.GSTId === this.RoomBookingDetails.GSTId);
    if (selectedGST) {
      this.RoomBookingDetails.GSTPercentage = selectedGST.GSTPercentage || parseFloat(selectedGST.GSTName) || 0;
    } else {
      this.RoomBookingDetails.GSTPercentage = 0;
    }
    this.calculateGST();
  }

  calculateRoomCharges() {
    const chargeAmount = this.RoomBookingDetails.ChargeAmount || 0;
    const noOfDays = this.RoomBookingDetails.NoOfDays || 1;
    const discount = this.RoomBookingDetails.DiscountAmount || 0;
    const totalCharge = chargeAmount * noOfDays;
    this.RoomBookingDetails.TaxableAmount = totalCharge - discount;
    this.autoSelectGSTRate();
    this.calculateGST();
  }


  autoSelectGSTRate() {
    const chargeAmount = this.RoomBookingDetails.ChargeAmount || 0;
    let gstPercentage = 0;
    if (chargeAmount < 1000) {
      gstPercentage = 0;
    } else if (chargeAmount >= 1000 && chargeAmount <= 7500) {
      gstPercentage = 5;
    } else {
      gstPercentage = 18;
    }
    const matchingGST = this.GSTList.find(g => {
      const gstValue = g.GSTPercentage || parseFloat(g.GSTName) || 0;
      return gstValue === gstPercentage;
    });
    if (matchingGST) {
      this.RoomBookingDetails.GSTId = matchingGST.GSTId;
      this.RoomBookingDetails.GSTPercentage = gstPercentage;
    } else {
      this.RoomBookingDetails.GSTId = null;
      this.RoomBookingDetails.GSTPercentage = gstPercentage;
    }
  }

  calculateGST() {
    const taxableAmount = this.RoomBookingDetails.TaxableAmount || 0;
    const gstPercentage = this.RoomBookingDetails.GSTPercentage || 0;
    const totalGSTAmount = (taxableAmount * gstPercentage) / 100;
    const isIntraState = this.checkIntraState();
    if (isIntraState) {
      this.RoomBookingDetails.CGST = totalGSTAmount / 2;
      this.RoomBookingDetails.SGST = totalGSTAmount / 2;
      this.RoomBookingDetails.IGST = 0;
    } else {
      this.RoomBookingDetails.CGST = 0;
      this.RoomBookingDetails.SGST = 0;
      this.RoomBookingDetails.IGST = totalGSTAmount;
    }
    this.RoomBookingDetails.TotalGSTAmount = totalGSTAmount;
    this.RoomBookingDetails.LineTotal = taxableAmount + totalGSTAmount;
  }

  checkIntraState(): boolean {
    const hotelGSTIN = this.staffLogin.GSTIN || '';
    const guestGSTNo = this.Guest.GSTNo || '';
    if (hotelGSTIN.length >= 2 && guestGSTNo.length >= 2) {
      return hotelGSTIN.substring(0, 2) === guestGSTNo.substring(0, 2);
    }
    return true;
  }

  calculateAllRoomTaxes() {
    this.SelectedRoomDetailList.forEach((room: { TotalGSTAmount: number; CGST: number; SGST: number; IGST: number; }, index: any) => {
      const isIntraState = this.checkIntraState();
      const totalGSTAmount = room.TotalGSTAmount || 0;
      if (isIntraState) {
        room.CGST = totalGSTAmount / 2;
        room.SGST = totalGSTAmount / 2;
        room.IGST = 0;
      } else {
        room.CGST = 0;
        room.SGST = 0;
        room.IGST = totalGSTAmount;
      }
    });
    this.recalculateTotals();
  }

  
  addRoomDetail() {

    if(!this.Guest.GuestName || !this.Guest.ContactNo){
      this.toastr.error('Please Select Guest!');
      return;
    }
    if (!this.RoomBookingDetails.RoomId) {
      this.toastr.error('Please select a room!');
      return;
    }
    if (!this.RoomBookingDetails.NoOfDays || this.RoomBookingDetails.NoOfDays < 1) {
      this.toastr.error('Please enter number of days!');
      return;
    }

    if (!this.RoomBookingDetails.NoOfPerson || this.RoomBookingDetails.NoOfPerson < 1) {
      this.toastr.error('Please enter number of person!');
      return;
    }
    const roomDetail = { ...this.RoomBookingDetails };
    if (this.editingRoomIndex >= 0) {
      this.SelectedRoomDetailList[this.editingRoomIndex] = roomDetail;
      this.editingRoomIndex = -1;
      this.toastr.success('Room detail updated!');
    } else {
      this.SelectedRoomDetailList.push(roomDetail);
      this.toastr.success('Room added to list!');
    }
    this.recalculateTotals();
    this.clearRoom();
  }


  editRoomDetail(index: number) {
    const room = this.SelectedRoomDetailList[index];
    this.RoomBookingDetails = { ...room };
    this.selectedRoomId = room.RoomId;
    this.editingRoomIndex = index;
  }

  RemoveRoomDetail(index: number) {
    this.SelectedRoomDetailList.splice(index, 1);
    this.recalculateTotals();
    this.toastr.success('Room removed from list!');
  }

  recalculateTotals() {
    let totalDiscount = 0, totalTaxable = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalGST = 0, totalLineAmount = 0;
    this.SelectedRoomDetailList.forEach((item: { DiscountAmount: any; TaxableAmount: any; CGST: any; SGST: any; IGST: any; TotalGSTAmount: any; LineTotal: any; }) => {
      totalDiscount += item.DiscountAmount || 0;
      totalTaxable += item.TaxableAmount || 0;
      totalCGST += item.CGST || 0;
      totalSGST += item.SGST || 0;
      totalIGST += item.IGST || 0;
      totalGST += item.TotalGSTAmount || 0;
      totalLineAmount += item.LineTotal || 0;
    });
    this.Guest.TotalDiscount = totalDiscount;
    this.Guest.TaxableAmount = totalTaxable;
    this.Guest.TotalCGST = totalCGST;
    this.Guest.TotalSGST = totalSGST;
    this.Guest.TotalIGST = totalIGST;
    this.Guest.TotalGST = totalGST;
    this.Guest.TotalLineAmount = totalLineAmount;
    this.updatePaymentPaidAmount();
  }

  updatePaymentPaidAmount() {
    const totalPaid = this.SelectedPaymentCollectionList.reduce((sum, p) => sum + (p.PaidAmount || 0), 0);
    const remaining = (this.Guest.TotalLineAmount || 0) - totalPaid;
    this.Payment.PaidAmount = remaining > 0 ? remaining : 0;
  }

  addToPaymentList() {
    if (!this.Payment.PaidAmount || this.Payment.PaidAmount <= 0) {
      this.toastr.error('Please enter a valid amount!');
      return;
    }
    if (!this.Payment.PaymentType) {
      this.toastr.error('Please select payment type!');
      return;
    }
    if (!this.Payment.PaymentMode) {
      this.toastr.error('Please select payment mode!');
      return;
    }
    const totalPaid = this.SelectedPaymentCollectionList.reduce((sum, p) => sum + (p.PaidAmount || 0), 0);
    const remaining = (this.Guest.TotalLineAmount || 0) - totalPaid;
    if (this.Payment.PaidAmount > remaining) {
      this.toastr.error('Paid amount cannot exceed remaining amount!');
      this.Payment.PaidAmount = remaining;
      return;
    }
    this.SelectedPaymentCollectionList.push({ ...this.Payment });
    this.toastr.success('Payment added!');
    const newTotalPaid = totalPaid + this.Payment.PaidAmount;
    const newRemaining = (this.Guest.TotalLineAmount || 0) - newTotalPaid;
    this.Payment = {
      PaymentDate: this.loadData.loadDateYMD(new Date()),
      PaidAmount: newRemaining > 0 ? newRemaining : 0,
      PaymentType: null,
      PaymentMode: null,
      TransactionNo: ''
    };
  }

  removePaymentItem(index: number) {
    this.SelectedPaymentCollectionList.splice(index, 1);
    this.updatePaymentPaidAmount();
    this.toastr.success('Payment removed!');
  }


saveRoomBooking() {
    this.isSubmitted = true;

    // if (
    //   !this.SelectedPaymentCollectionList ||
    //   this.SelectedPaymentCollectionList.length === 0
    // ) {
    //   this.toastr.error('Please add at least one payment to the list!');
    //   return;
    // }
    if (
      !this.SelectedRoomDetailList ||
      this.SelectedRoomDetailList.length === 0
    ) {
      this.toastr.error(
        'Please add at least one Room Details!'
      );
      return;
    }

    this.Guest.CreatedBy = this.staffLogin.StaffId;
    this.Guest.UpdatedBy = this.staffLogin.StaffId;
    this.Guest.BookingDate = this.loadData.loadDateYMD(
      this.Guest.BookingDate
    );

    const data = {
      GetGuest: this.Guest,
      GetRoomDetails: this.SelectedRoomDetailList,
      GetPaymentDetails: this.SelectedPaymentCollectionList,
    };
    console.log(data);
    

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;
    this.service.saveBooking(obj).subscribe(
      (r1) => {
        const response = r1 as any;

        if (response.Message === ConstantData.SuccessMessage) {
          if (this.Guest.BookingId > 0) {
            this.toastr.success('Booking Updated successfully');
            $('hashtag#staticBackdrop').modal('hide');
          } else {
            this.toastr.success('Booking added successfully');
          }
          //  this.service.PrintOpticlalBill(response.OpticalBillingId);
          this.SelectedRoomDetailList = [];
          this.SelectedPaymentCollectionList = [];
          this.resetForm();
        } else {
          this.toastr.error(response.Message);
        }

        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error occurred while submitting data');
        this.dataLoading = false;
      }
    );
}


}
