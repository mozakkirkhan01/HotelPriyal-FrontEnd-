import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../utils/app.service';
import { ConstantData } from '../../utils/constant-data';
import {
  Gender,
  PaymentMode,
  Status,
  Category,
  PaymentType,
  RoomBookingStatus,
  BookingStatus,
} from '../../utils/enum';
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
  styleUrls: ['./manage-room-booking.component.css'],
})
export class ManageRoomBookingComponent {
  dataLoading: boolean = false;
  GuestList: any = [];
  RoomList: any = [];
  ChargeList: any = [];
  FeeChargeList: any = [];
  Guest: any = {};
  Room: any = {};
  Hotel: any = {};
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
  BookingSourceTypeList: any[] = [];
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
  SubGuestList: any[] = [];
  SubGuestModel: any = {
    GuestName: '',
    ContactNo: '',
    AadharNo: '',
  };
  editingSubGuestIndex: number = -1;

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
    this.resetForm();
    this.Payment.PaymentType = PaymentType.Full;

    this.route.queryParams.subscribe((params: any) => {
      this.Guest.RoomBookingId = params.id;
      this.redUrl = params.redUrl;

      // Validate menu with clean URL (without query params)
      this.validiateMenu();

      if (this.Guest.RoomBookingId > 0) {
        this.loadBookingForEdit(this.Guest.RoomBookingId);
        return;
      }

      // only run when NOT editing
      if (this.staffLogin.RoleId == 5) {
        this.getHotelList();
      } else {
        this.initializeAllData();
      }
    });
  }

  initializeAllData() {
    this.getGuestList();
    this.getRoomList();
    this.getGSTList();
    this.getBookingSourceTypeList();
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
      RoomId: null,
    };
  }

  initializePayment() {
    this.Payment = {
      PaymentDate: this.loadData.loadDateYMD(new Date()),
      PaidAmount: 0,
      PaymentType: null,
      PaymentMode: null,
      TransactionNo: '',
    };
  }

  validiateMenu() {
    // Strip query parameters from URL
    const cleanUrl = this.router.url.split('?')[0];

    var obj: RequestModel = {
      request: this.localService
        .encrypt(
          JSON.stringify({
            Url: cleanUrl, // Use clean URL without query params
            StaffLoginId: this.staffLogin.StaffLoginId,
          })
        )
        .toString(),
    };

    this.dataLoading = true;
    this.service.validiateMenu(obj).subscribe(
      (response: any) => {
        this.action = this.loadData.validiateMenu(
          response,
          this.toastr,
          this.router
        );
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

  @ViewChild('formGuestDetails') formGuestDetails: NgForm;

  loadBookingForEdit(bookingId: number) {
    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(bookingId)).toString(),
    };

    this.dataLoading = true;
    this.service.getBookingListById(obj).subscribe(
      (response: any) => {
        if (response.Message === 'Success') {
          const booking = response.GetRoomBooking;

          // ✅ For admin role, load hotel list first if not already loaded
          if (
            this.staffLogin.RoleId == 5 &&
            (!this.HotelList || this.HotelList.length === 0)
          ) {
            this.getHotelList();
          }

          // ✅ Set hotel details
          if (this.staffLogin.RoleId == 5) {
            this.Hotel.HotelId = booking.HotelId;

            // ✅ If HotelList is already loaded, set the name
            if (this.HotelList && this.HotelList.length > 0) {
              const selectedHotel = this.HotelList.find(
                (h: any) => h.HotelId === booking.HotelId
              );
              if (selectedHotel) {
                this.Hotel.HotelName = selectedHotel.HotelName;
              }
            } else {
              // ✅ Otherwise, wait a bit for getHotelList to complete, then set
              setTimeout(() => {
                const selectedHotel = this.HotelList.find(
                  (h: any) => h.HotelId === booking.HotelId
                );
                if (selectedHotel) {
                  this.Hotel.HotelName = selectedHotel.HotelName;
                }
              }, 500);
            }
          }

          this.getGSTList();
          this.getBookingSourceTypeList();

          this.Guest = response.GetGuest;
          this.selectedGuestId = this.Guest.GuestId;
          this.isNewGuest = false;

          // --- Room Booking ---
          this.Guest.BookingDate = this.loadData.loadDateYMD(
            booking.BookingDate
          );
          this.Guest.BookingSourcetypeId = booking.BookingSourceTypeId;
          this.Guest.RoomBookingId = booking.RoomBookingId;
          this.Guest.TotalLineAmount = booking.TotalLineAmount;
          this.Guest.TotalDiscount = booking.TotalDiscount;
          this.Guest.TaxableAmount = booking.TaxableAmount;
          this.Guest.TotalGST = booking.TotalGST;
          this.Guest.TotalCGST = booking.TotalCGST;
          this.Guest.TotalSGST = booking.TotalSGST;
          this.Guest.TotalIGST = booking.TotalIGST;
          this.Guest.TotalPaidAmount = booking.TotalPaidAmount;
          this.Guest.TotalDuesAmount = booking.TotalDuesAmount;
          this.Guest.HotelId = booking.HotelId;
          this.Guest.RoomBookingStatus = booking.RoomBookingStatus;

          // ✅ Load guest and room lists
          this.getGuestList();
          this.getRoomList();

          // --- Room Details ---
          this.SelectedRoomDetailList = response.GetRoomDetails.map(
            (item: any) => {
              return {
                ...item,
                CheckInDate: this.loadData.loadDateYMD(item.CheckInDate),
              };
            }
          );

          // --- Payment Details ---
          this.SelectedPaymentCollectionList = response.GetPaymentDetails.map(
            (p: any) => {
              return {
                ...p,
                PaymentDate: this.loadData.loadDateYMD(p.PaymentDate),
              };
            }
          );

          this.recalculateTotals();
          this.toastr.success('Booking loaded for editing');
        } else {
          this.toastr.error(response.Message);
        }

        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while loading booking details');
        this.dataLoading = false;
      }
    );
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
          console.log('GST List:', this.GSTList);
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
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getGuestList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.GuestList = response.GuestList;
          console.log('Guest List:', this.GuestList);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

  getBookingSourceTypeList() {
    this.dataLoading = true;

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };

    this.service.getBookingSourceTypeList(obj).subscribe(
      (r1) => {
        const response = r1 as any;

        if (response.Message === ConstantData.SuccessMessage) {
          this.BookingSourceTypeList = response.BookingSourceTypeList;

          const selfSource = this.BookingSourceTypeList.find(
            (x: any) => x.BookingSourceName?.toLowerCase() === 'self'
          );

          if (selfSource) {
            this.Guest.BookingSourcetypeId = selfSource.BookingSourceTypeId;
          }
        } else {
          this.toastr.error(response.Message);
        }

        this.dataLoading = false;
      },
      () => {
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

  resetForm() {
    this.Guest = {
      BookingDate: this.loadData.loadDateYMD(new Date()),
      TotalPaidAmount: 0,
      TotalDuesAmount: 0,
    };
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
        String(option.ContactNo)?.toLowerCase().includes(filterValue)
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
      this.Guest.GuestName = selected.GuestName;
      this.Guest.ContactNo =
        selected.MobileNo || selected.ContactNo || selected.GuestMobile;
      this.Guest.AadharNo = selected.AadharNo;
      this.Guest.Address = selected.Address;
      this.Guest.Email = selected.Email;
      this.Guest.AlternativeMobileNo = selected.AlternativeMobileNo;
      this.Guest.Pincode = selected.Pincode;
      this.Guest.StateId = selected.StateId;
      this.Guest.GSTNo = selected.GSTNo;
      this.Guest.CompanyName = selected.CompanyName;
      this.Guest.BookingDate = this.loadData.loadDateYMD(new Date());
    }
  }

  clearGuest() {
    this.filteredGuestList = this.GuestList;
    this.Guest.GuestId = null;
    this.Guest.GuestName = '';
    this.Guest.ContactNo = '';
    this.Guest.AadharNo = '';
    this.Guest.Address = '';
    this.Guest.Email = '';
    this.Guest.AlternativeMobileNo = '';
    this.Guest.Pincode = '';
    this.Guest.StateId = null;
    this.Guest.GSTNo = '';
    this.Guest.CompanyName = '';
    this.Guest.BookingDate = this.loadData.loadDateYMD(new Date());
    this.isNewGuest = false;
    this.selectedGuestId = null;
    this.Guest.BookingDate = this.loadData.loadDateYMD(new Date());
    this.SubGuestList = [];
  }

  isFieldReadonly(): boolean {
    return !this.isNewGuest && this.selectedGuestId !== null;
  }

  // room

  getRoomList() {
    const hotelId =
      this.staffLogin.RoleId == 5
        ? this.Hotel.HotelId
        : this.Guest.HotelId || this.staffLogin.HotelId;
    const data = {
      HotelId: hotelId,
      IsAvailable: true,
      Status: 1,
    };
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };
    this.dataLoading = true;
    this.service.getRoomList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.RoomList = response.RoomList;
          console.log('Room List:', this.RoomList);
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

  filterRoomList(value: string) {
    const filterValue = value?.toLowerCase() || '';
    this.filteredRoomList = this.RoomList.filter(
      (option: any) =>
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
    const selected = this.RoomList.find(
      (x: any) => x.RoomId === selectedRoomId
    );
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
    const selectedGST = this.GSTList.find(
      (g) => g.GSTId === this.RoomBookingDetails.GSTId
    );
    if (selectedGST) {
      this.RoomBookingDetails.GSTPercentage =
        selectedGST.GSTPercentage || parseFloat(selectedGST.GSTName) || 0;
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
    const matchingGST = this.GSTList.find((g) => {
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
    this.SelectedRoomDetailList.forEach(
      (
        room: {
          TotalGSTAmount: number;
          CGST: number;
          SGST: number;
          IGST: number;
        },
        index: any
      ) => {
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
      }
    );
    this.recalculateTotals();
  }

  addRoomDetail() {
    if (!this.Guest.GuestName || !this.Guest.ContactNo) {
      this.toastr.error('Please Select Guest!');
      return;
    }
    if (!this.RoomBookingDetails.RoomId) {
      this.toastr.error('Please select a room!');
      return;
    }
    if (
      !this.RoomBookingDetails.NoOfDays ||
      this.RoomBookingDetails.NoOfDays < 1
    ) {
      this.toastr.error('Please enter number of days!');
      return;
    }

    if (
      !this.RoomBookingDetails.NoOfPerson ||
      this.RoomBookingDetails.NoOfPerson < 1
    ) {
      this.toastr.error('Please enter number of person!');
      return;
    }
    this.RoomBookingDetails.RoomBookingDetailStatus = BookingStatus.Checkin;
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
    let totalDiscount = 0,
      totalTaxable = 0,
      totalCGST = 0,
      totalSGST = 0,
      totalIGST = 0,
      totalGST = 0,
      totalLineAmount = 0;

    this.SelectedRoomDetailList.forEach(
      (item: {
        DiscountAmount: any;
        TaxableAmount: any;
        CGST: any;
        SGST: any;
        IGST: any;
        TotalGSTAmount: any;
        LineTotal: any;
      }) => {
        totalDiscount += item.DiscountAmount || 0;
        totalTaxable += item.TaxableAmount || 0;
        totalCGST += item.CGST || 0;
        totalSGST += item.SGST || 0;
        totalIGST += item.IGST || 0;
        totalGST += item.TotalGSTAmount || 0;
        totalLineAmount += item.LineTotal || 0;
      }
    );

    this.Guest.TotalDiscount = totalDiscount;
    this.Guest.TaxableAmount = totalTaxable;
    this.Guest.TotalCGST = totalCGST;
    this.Guest.TotalSGST = totalSGST;
    this.Guest.TotalIGST = totalIGST;
    this.Guest.TotalGST = totalGST;
    this.Guest.TotalLineAmount = totalLineAmount;

    // Calculate paid and dues
    this.calculatePaidAndDues();
    this.updatePaymentPaidAmount();
  }

  calculatePaidAndDues() {
    const totalPaid = this.SelectedPaymentCollectionList.reduce(
      (sum, p) => sum + (p.PaidAmount || 0),
      0
    );
    this.Guest.TotalPaidAmount = totalPaid;
    this.Guest.TotalDuesAmount = (this.Guest.TotalLineAmount || 0) - totalPaid;
  }

  updatePaymentPaidAmount() {
    const totalPaid = this.SelectedPaymentCollectionList.reduce(
      (sum, p) => sum + (p.PaidAmount || 0),
      0
    );
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
    const totalPaid = this.SelectedPaymentCollectionList.reduce(
      (sum, p) => sum + (p.PaidAmount || 0),
      0
    );
    const remaining = (this.Guest.TotalLineAmount || 0) - totalPaid;
    if (this.Payment.PaidAmount > remaining) {
      this.toastr.error('Paid amount cannot exceed remaining amount!');
      this.Payment.PaidAmount = remaining;
      return;
    }
    this.SelectedPaymentCollectionList.push({ ...this.Payment });
    this.toastr.success('Payment added!');

    this.calculatePaidAndDues();
    const newTotalPaid = totalPaid + this.Payment.PaidAmount;
    const newRemaining = (this.Guest.TotalLineAmount || 0) - newTotalPaid;
    this.Payment = {
      PaymentDate: this.loadData.loadDateYMD(new Date()),
      PaidAmount: newRemaining > 0 ? newRemaining : 0,
      PaymentType: null,
      PaymentMode: null,
      TransactionNo: '',
    };
  }

  removePaymentItem(index: number) {
    this.SelectedPaymentCollectionList.splice(index, 1);
    this.calculatePaidAndDues();
    this.updatePaymentPaidAmount();

    this.toastr.success('Payment removed!');
  }

  saveRoomBooking() {
    this.isSubmitted = true;

    if (this.staffLogin.RoleId === 5) {
      if (!this.Hotel || !this.Hotel.HotelId) {
        this.toastr.error('Please select a hotel!');
        return;
      }
    }

    if (!this.Guest.GuestName) {
      this.toastr.error('Please enter guest name!');
      return;
    }

    if (
      !this.SelectedRoomDetailList ||
      this.SelectedRoomDetailList.length === 0
    ) {
      this.toastr.error('Please add at least one Room Details!');
      return;
    }

    if (!this.Guest.BookingSourcetypeId) {
      this.toastr.error('Please select booking source!');
      return;
    }

    this.Guest.CreatedBy = this.staffLogin.StaffLoginId;
    this.Guest.UpdatedBy = this.staffLogin.StaffLoginId;
    this.Guest.BookingDate = this.loadData.loadDateYMD(this.Guest.BookingDate);

    // Set HotelId
    let hotelId: number;
    if (this.staffLogin.RoleId == 5) {
      hotelId = this.Hotel.HotelId;
      console.log('Admin hotel ID:', hotelId);
    } else {
      hotelId = this.staffLogin.HotelId;
      console.log("Setting hotel ID to staff's hotel:", hotelId);
    }

    this.Guest.HotelId = hotelId;
    this.Guest.GuestId = this.selectedGuestId || 0;
    console.log('Guest data:', this.Guest.RoomBookingStatus);

    if (!this.Guest.RoomBookingId) {
      this.Guest.RoomBookingStatus = RoomBookingStatus.Checkin;
    }
    console.log('Guest data:', this.Guest.RoomBookingStatus);

    const data = {
      GetGuest: {
        GuestId: this.Guest.GuestId || 0,
        HotelId: hotelId,
        GuestName: this.Guest.GuestName,
        ContactNo: this.Guest.ContactNo,
        AlternativeMobileNo: this.Guest.AlternativeMobileNo,
        Email: this.Guest.Email,
        Address: this.Guest.Address,
        Pincode: this.Guest.Pincode,
        StateId: this.Guest.StateId,
        GSTNo: this.Guest.GSTNo,
        AadharNo: this.Guest.AadharNo,
        CompanyName: this.Guest.CompanyName,
      },

      GetSubGuests: this.SubGuestList.map((g) => ({
        GuestName: g.GuestName,
        ContactNo: g.ContactNo,
        AadharNo: g.AadharNo,
      })),
      GetRoomBooking: {
        RoomBookingId: this.Guest.RoomBookingId || 0, // ✅ CRITICAL for edit
        HotelId: hotelId, // ✅ Added HotelId
        BookingSourceTypeId: this.Guest.BookingSourcetypeId,
        BookingDate: this.Guest.BookingDate,
        TotalLineAmount: this.Guest.TotalLineAmount || 0,
        TotalDiscount: this.Guest.TotalDiscount || 0,
        TaxableAmount: this.Guest.TaxableAmount || 0,
        TotalGST: this.Guest.TotalGST || 0,
        TotalCGST: this.Guest.TotalCGST || 0,
        TotalSGST: this.Guest.TotalSGST || 0,
        TotalIGST: this.Guest.TotalIGST || 0,
        TotalPaidAmount: this.Guest.TotalPaidAmount || 0,
        TotalDuesAmount: this.Guest.TotalDuesAmount || 0,
        RoomBookingStatus: this.Guest.RoomBookingStatus,
        CreatedBy: this.Guest.CreatedBy,
        UpdatedBy: this.Guest.UpdatedBy,
      },
      GetRoomDetails: this.SelectedRoomDetailList.map(
        (room: {
          RoomId: any;
          NoOfPerson: any;
          NoOfChild: any;
          NoOfAdult: any;
          CheckInDate: any;
          CheckInTime: any;
          ChargeAmount: any;
          NoOfDays: any;
          DiscountAmount: any;
          TaxableAmount: any;
          GSTId: any;
          GSTPercentage: any;
          CGST: any;
          SGST: any;
          IGST: any;
          TotalGSTAmount: any;
          LineTotal: any;
          RoomBookingDetailStatus: any;
        }) => ({
          RoomId: room.RoomId,
          NoOfPerson: room.NoOfPerson || 0,
          NoOfChild: room.NoOfChild || 0,
          NoOfAdult: room.NoOfAdult || 0,
          CheckInDate: room.CheckInDate,
          CheckInTime: room.CheckInTime,
          ChargeAmount: room.ChargeAmount || 0,
          NoOfDays: room.NoOfDays || 1,
          DiscountAmount: room.DiscountAmount || 0,
          TaxableAmount: room.TaxableAmount || 0,
          GSTId: room.GSTId,
          GSTPercentage: room.GSTPercentage || 0,
          CGST: room.CGST || 0,
          SGST: room.SGST || 0,
          IGST: room.IGST || 0,
          TotalGSTAmount: room.TotalGSTAmount || 0,
          LineTotal: room.LineTotal || 0,
          RoomBookingDetailStatus:
            room.RoomBookingDetailStatus || BookingStatus.Checkin,
        })
      ),
      GetPaymentDetails: this.SelectedPaymentCollectionList.map((payment) => ({
        PaymentDate: payment.PaymentDate,
        PaidAmount: payment.PaidAmount || 0,
        PaymentType: payment.PaymentType,
        PaymentMode: payment.PaymentMode,
        TransactionNo: payment.TransactionNo || '',
      })),
    };

    console.log('Sending data:', data);

    const obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify(data)).toString(),
    };

    this.dataLoading = true;
    this.service.saveBooking(obj).subscribe(
      (r1) => {
        const response = r1 as any;

        if (response.Message === ConstantData.SuccessMessage) {
          if (this.Guest.RoomBookingId > 0) {
            this.toastr.success('Booking Updated successfully');

            // Navigate back if redUrl exists
            if (this.redUrl) {
              this.router.navigate([this.redUrl]);
            }
          } else {
            this.toastr.success('Booking added successfully');
          }

          this.SelectedRoomDetailList = [];
          this.SelectedPaymentCollectionList = [];
          this.resetForm();

          if (!this.redUrl) {
            this.initializeAllData();
          }
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

  getHotelList() {
    var obj: RequestModel = {
      request: this.localService.encrypt(JSON.stringify({})).toString(),
    };
    this.dataLoading = true;
    this.service.getHotelList(obj).subscribe(
      (r1) => {
        let response = r1 as any;
        if (response.Message == ConstantData.SuccessMessage) {
          this.HotelList = response.HotelList;
          this.filterHotel = this.HotelList;
        } else {
          this.toastr.error(response.Message);
        }
        this.dataLoading = false;
      },
      (err) => {
        this.toastr.error('Error while fetching records');
        this.dataLoading = false;
      }
    );
  }

  HotelList: any[] = [];
  filterHotel: any[] = [];
  filterHotelList(value: any) {
    if (value) {
      const filterValue = value.toLowerCase();
      this.filterHotel = this.HotelList.filter((option: any) =>
        option.HotelName.toLowerCase().includes(filterValue)
      );
    } else {
      this.filterHotel = this.HotelList;
    }
  }

  afterHotelSelected(event: any) {
    this.Hotel.HotelId = event.option.id;
    this.initializeAllData();
  }

  clearHotel() {
    this.Hotel.HotelName = '';
    this.Hotel.HotelId = 0;
    this.RoomList = [];
    this.filteredRoomList = [];
    this.GuestList = [];
    this.filteredGuestList = [];
    this.Guest.HotelId = null;
    this.filterHotel = this.HotelList;
  }

  addSubGuest() {

    if(this.Guest.GuestName == null){
      this.toastr.error('Please select guest');
      return;
    }
    if (!this.SubGuestModel.GuestName) {
      this.toastr.error('Sub guest name is required');
      return;
    }

    const data = { ...this.SubGuestModel };

    if (this.editingSubGuestIndex >= 0) {
      this.SubGuestList[this.editingSubGuestIndex] = data;
      this.editingSubGuestIndex = -1;
      this.toastr.success('Sub guest updated');
    } else {
      this.SubGuestList.push(data);
      this.toastr.success('Sub guest added');
    }

    this.clearSubGuest();
  }

  editSubGuest(index: number) {
    this.SubGuestModel = { ...this.SubGuestList[index] };
    this.editingSubGuestIndex = index;
  }

  removeSubGuest(index: number) {
    this.SubGuestList.splice(index, 1);
    this.toastr.success('Sub guest removed');
  }

  clearSubGuest() {
    this.SubGuestModel = {
      GuestName: '',
      ContactNo: '',
      AadharNo: '',
    };
  }
}
