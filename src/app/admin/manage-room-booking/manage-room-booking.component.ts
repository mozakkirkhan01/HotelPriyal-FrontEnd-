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
saveRoomBooking() {
throw new Error('Method not implemented.');
}
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
    console.log(this.staffLogin);
    this.validiateMenu();
    this.resetForm();
    this.getGuestList();  
    this.getRoomList();
    this.getGSTList();
    this.RoomBookingDetails.checkInDate = this.loadData.loadDateYMD(new Date());
    this.RoomBookingDetails.checkInTime = this.loadData.getCurrentTime();
    this.Guest.BookingDate = this.loadData.loadDateYMD(new Date());
    this.route.queryParams.subscribe((params: any) => {
      this.Guest.GuestId = params.id;
      this.redUrl = params.redUrl;
    });
    // this.route.queryParams.subscribe((params) => {
    //   const OpticalBillingId = params['id'];
    //   const redUrl = params['redUrl'];

    //   const data = this.service.getSelectedOpticalData();
    //   if (data && data.GetOpticalBilling.OpticalBillingId == OpticalBillingId) {
    //     this.Guest = {
    //       ...data.GetOpticalBilling,
    //       ...data.GetPaymentCollection,
    //     };
    //     this.SelectedRoomDetailList = data.GetOpticalsDetails;
    //     this.SelectedPaymentCollectionList = data.GetPaymentDetails;
   
    //   } else {
    //     // Optional: fallback to fetch data again using surgeryId
    //   }
      
    // });
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

onNoOfPersonChange() {
  const { NoOfAdult = 0, NoOfChild = 0 } = this.RoomBookingDetails;
  this.RoomBookingDetails.NoOfPerson = NoOfAdult + NoOfChild;
}

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
    this.Guest = {};
    this.Guest.OpdDate = this.loadData.loadDateYMD(new Date());
    this.isNewGuest = false;
    this.selectedGuestId = null;

    if (this.formGuestDetails) {
      this.formGuestDetails.control.markAsPristine();
      this.formGuestDetails.control.markAsUntouched();
      this.currentPayment = {};
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

  this.filteredRoomList = this.RoomList.filter(
    (option: any) =>
      option.RoomName?.toLowerCase().includes(filterValue) ||
      option.FloorId?.toString().includes(filterValue) ||
      option.RoomTypeId?.toString().includes(filterValue)
      
    );


  if (this.filteredRoomList.length === 0 && value && value.length > 0) {
    this.selectedRoomId = null;
    this.Room.RoomName = value;
  } else if (value.length === 0) {
    this.selectedRoomId = null;
  }
}

afterRoomSelected(event: any) {
  const selectedName = event.option.value;
  const selectedRoomId = event.option.id; 

  console.log(selectedName);
  console.log(selectedRoomId);
  
  const selected = this.RoomList.find(
    (x: any) => x.RoomId === selectedRoomId
  );
  if (selected) {
    this.selectedRoomId = selected.RoomId;

    this.Room = {
      ...selected,
      RoomId: selected.RoomId,
      HotelId: selected.HotelId,
      RoomName: selected.RoomName,
      RoomTypeId: selected.RoomTypeId,
      FloorId: selected.FloorId,
      RoomChargeAmount: selected.RoomChargeAmount,
      HSNCode: selected.HSNCode,
      IsAvailable: selected.IsAvailable,
      Status: selected.Status
    };
    this.RoomBookingDetails.ChargeAmount = selected.RoomChargeAmount;
    console.log(this.RoomBookingDetails.ChargeAmount);
    
  }
}

clearRoom() {
  this.filteredRoomList = this.RoomList;
  this.RoomBookingDetails = {
    RoomName: '',
    NoOfAdult: 0,
    NoOfChild: 0,
    NoOfPerson: 0,
    ChargeAmount: 0,
    RoomId: null,
    HotelId: null,
    RoomTypeId: null,
    FloorId: null,
    RoomChargeAmount: null,
    HSNCode: null,
    IsAvailable: null,
    Status: null,
    checkInDate: this.loadData.loadDateYMD(new Date()),
    checkInTime: this.loadData.getCurrentTime(),
  };
  this.selectedRoomId = null;
}


  recalculateTotals() {
  let totalAmount = 0;
  let totalDiscount = 0;
  let totalLineTotal = 0;

  this.SelectedRoomDetailList.forEach((item: { Amount: any; Discount: any; LineTotal: any; }) => {
    totalAmount += item.Amount || 0;
    totalDiscount += item.Discount || 0;
    totalLineTotal += item.LineTotal || 0;
  });

  this.Guest.TotalAmount = totalAmount;
  this.Guest.DiscountAmount = totalDiscount;
  this.Guest.PayableAmount = totalLineTotal;
  this.currentPayment.PaidAmount = totalLineTotal;
}


clearCurrentPayment() {
  this.Payment = {
    OpticalName: '',
    Rate: 0,
    Quantity: 1,
    Amount: 0,
    Discount: 0,
    LineTotal: 0
  };
}


  SelectedRoomDetailList: any = [];
  addRoomDetail() {
    if (this.Payment.Amount == null || this.Payment.Amount == '') {
      this.toastr.error('Please Enter Paid Amount!!!');
      return;
    }
    if (this.Payment.OpticalName == null || this.Payment.OpticalName == '') {
      this.toastr.error('Please Select Payment Mode!!!');
      return;
    }
    this.Payment.OpticalId = this.Payment.OpticalId;
    this.SelectedRoomDetailList.push(this.Payment);
    this.recalculateTotals();  // Call a function to calculate the totals
  this.clearCurrentPayment();
  }



  RemoveHotel(index: number) {
    this.SelectedRoomDetailList.splice(index, 1);
    this.CalculateTotalAmount();
  }

  resetHotelPayment() {
    this.Payment = {};
    this.isSubmitted = false;
  }

  CalculateTotalAmount() {
    let TotalAmount = 0;

    for (let i = 0; i < this.SelectedRoomDetailList.length; i++) {
      const paymentDetail = this.SelectedRoomDetailList[i];
      TotalAmount += parseFloat(paymentDetail.Amount) || 0;
    }

    this.Guest.TotalAmount = TotalAmount;
    this.Guest.DiscountAmount = 0;
    this.Guest.PayableAmount = TotalAmount;
    this.Guest.PaidAmount = 0;
    this.currentPayment.PaidAmount = TotalAmount;
  }

  updatePaymentFields() {
    this.Guest.PayableAmount =
      this.Guest.TotalAmount - this.Guest.DiscountAmount;
    this.Guest.PaidAmount =
      this.Guest.TotalAmount - this.Guest.DiscountAmount;
    this.currentPayment.PaidAmount =
      this.Guest.TotalAmount - this.Guest.DiscountAmount;
  }

  ChangeDuesAmount() {
    this.Guest.DueAmount =
      this.Guest.PayableAmount - this.Guest.PaidAmount;
  }

  // saveRoomBooking() {
  //   this.isSubmitted = true;

  //   if (
  //     !this.SelectedPaymentCollectionList ||
  //     this.SelectedPaymentCollectionList.length === 0
  //   ) {
  //     this.toastr.error('Please add at least one payment to the list!');
  //     return;
  //   }
  //   if (
  //     !this.SelectedRoomDetailList ||
  //     this.SelectedRoomDetailList.length === 0
  //   ) {
  //     this.toastr.error(
  //       'Please add at least one registration charge to the list!'
  //     );
  //     return;
  //   }

  //   this.Guest.CreatedBy = this.staffLogin.StaffId;
  //   this.Guest.UpdatedBy = this.staffLogin.StaffId;
  //   this.Guest.PaymentDate = this.loadData.loadDateYMD(
  //     this.Guest.PaymentDate
  //   );

  //   if (this.tempData != undefined) {
  //     this.Guest.PaymentCollectionId =
  //       this.tempData.GetPaymentCollection.PaymentCollectionId;
  //   }

  //   const data = {
  //     GetGuest: this.Guest,
  //     GetPaymentCollection: this.Guest,
  //     GetOpticalsDetails: this.SelectedRoomDetailList,
  //     GetPaymentDetails: this.SelectedPaymentCollectionList,
  //   };

  //   const obj: RequestModel = {
  //     request: this.localService.encrypt(JSON.stringify(data)).toString(),
  //   };

  //   this.dataLoading = true;
  //   this.service.saveOpticalsBill(obj).subscribe(
  //     (r1) => {
  //       const response = r1 as any;

  //       if (response.Message === ConstantData.SuccessMessage) {
  //         if (this.Guest.OpdId > 0) {
  //           this.toastr.success('Booking Updated successfully');
  //           $('hashtag#staticBackdrop').modal('hide');
  //         } else {
  //           this.toastr.success('Booking added successfully');
  //         }
  //          this.service.PrintOpticlalBill(response.OpticalBillingId);
  //         this.SelectedRoomDetailList = [];
  //         this.SelectedPaymentCollectionList = [];
  //         this.resetForm();
  //       } else {
  //         this.toastr.error(response.Message);
  //       }

  //       this.dataLoading = false;
  //     },
  //     (err) => {
  //       this.toastr.error('Error occurred while submitting data');
  //       this.dataLoading = false;
  //     }
  //   );
  // }

  SelectedPaymentCollectionList: any[] = [];

addToPaymentList() {
  if (
    
    this.currentPayment.PaidAmount != null &&
    this.currentPayment.PaymentMode
  ) {
    // Calculate the sum of already paid amounts
    const totalPaid = this.SelectedPaymentCollectionList.reduce(
      (sum, payment) => sum + (payment.PaidAmount || 0),
      0
    );

    // Calculate remaining amount
    const remainingAmount = this.Guest.PayableAmount - totalPaid;

    // Validate that PaidAmount does not exceed remaining
    if (this.currentPayment.PaidAmount > remainingAmount) {
      alert('Paid amount cannot exceed remaining payable amount!');
      this.currentPayment.PaidAmount = remainingAmount;
      return;
    }

    // Push a copy of the current payment into the list
    this.SelectedPaymentCollectionList.push({ ...this.currentPayment });

    // Calculate the new remaining amount after this payment
    const newTotalPaid = totalPaid + this.currentPayment.PaidAmount;
    const newRemainingAmount = this.Guest.PayableAmount - newTotalPaid;

    // Reset currentPayment
    this.currentPayment = {
      Particular: '',
      Remarks: '',
      PaymentMode: '',
      PaidAmount: newRemainingAmount > 0 ? newRemainingAmount : 0
    };

    // Optional: Notify if payment completed
    // if (newRemainingAmount <= 0) {
    //   alert('All payments are completed!');
    // }

  } else {
    alert('Please fill all fields!');
  }
}


 removePaymentItem(index: number) {
  const removedItem = this.SelectedPaymentCollectionList[index];

  // Restore the amount to currentPayment.PaidAmount
  if (removedItem && removedItem.PaidAmount != null) {
    this.currentPayment.PaidAmount += removedItem.PaidAmount;
  }

  // Remove the item from the list
  this.SelectedPaymentCollectionList.splice(index, 1);
}

  onRateChange() {
    if (this.Payment.Quantity && this.Payment.OpticalItemRate) {
      this.Payment.Amount = this.Payment.OpticalItemRate * this.Payment.Quantity;
      this.updateLineTotal();
    }
  }

  onQuantityChange() {
    if (this.Payment.OpticalItemRate && this.Payment.Quantity) {
      this.Payment.Amount = this.Payment.OpticalItemRate * this.Payment.Quantity;
      this.updateLineTotal();
    }
  }

  onDiscountChange() {
    this.updateLineTotal();
  }

  updateLineTotal() {
    this.Payment.LineTotal =
      (this.Payment.Amount || 0) - (this.Payment.Discount || 0);
  }
}
