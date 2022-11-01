import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetpointsService } from '../../services/setpoints/setpoints.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { GridOptions, RowNode } from 'ag-grid-community';
import { formatDate } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { TablefilterserviceService } from 'src/app/services/tableFilterService/tablefilterservice.service';
import { GetpointsService } from 'src/app/services/getpoints/getpoints.service';
import { interval, Observable } from 'rxjs';
import * as localForage from 'localforage';
import * as moment from 'moment';
import { DataService } from 'src/app/services/dataService/data.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
@Component({
  selector: 'app-setpoints',
  templateUrl: './setpoints.component.html',
  styleUrls: ['./setpoints.component.scss'],
  providers: [DatePipe],
})
export class SetpointsComponent implements OnInit, OnDestroy {
  @ViewChild('setPointTable') setPointTable: AgGridAngular;
  @ViewChild('errorQualityTable') errorQualityTable: AgGridAngular;

  bsConfig1 = { dateInputFormat: 'dd/mm/yyyy hh:mm:ss' };
  bsConfig = { dateInputFormat: 'dd/mm/yyyy hh:mm:ss' };
  loading = false;
  submitted = false;
  public ppcTableFilter;
  public ppcTableFilter1;
  public setEndDate = new Date();
  public currentDate = new Date();
  public maxDate = new Date();
  public setStartDate = new Date();
  public spinnerText = '';
  reactiveCodes: any = [];
  powerCodes: any = [];
  pfsignCodes: any = [];
  errorCodes: any = [];
  isScadaOn: boolean = false;
  nightMode: boolean = false;
  setPointsForm: FormGroup;
  setPoints: any = {};
  isDisabled: boolean = false;
  isDisabled1: boolean = false;
  isReadonly: boolean = true;
  activeP: boolean = true;
  reactiveP: boolean = true;
  isShownReactive: boolean = false;
  isShownPower: boolean = false;
  powerP: boolean = true;
  pfs: String = '';
  returnedVal: String = '';
  pfsignPoint: String = '';
  prefm: String = '';
  qrefm: String = '';
  disableReactive: boolean = true;
  selectedValue: String = '1';
  powermode: String = '';
  secondQref: boolean = true;
  pPoint: String = '';
  getDropdown: String = '';
  pPt: String = '';
  qPoint: String = '';
  qrPoint: String = '';
  pfPoint: String = '';
  pfsPoint: String = '';
  myDate: any = new Date();
  qrefPoint: String = '';
  selectedPMode: String = '';
  isCheckedActive: boolean = false;
  isCheckedReactive: boolean = false;
  isCheckedFactor: boolean = false;
  pref_variable: number = 0;
  public points = [];
  public rowClassRulesRole;
  public customEffectiveDate;
  public customTerminationDate;
  public isTerminate = 0;
  private selectedMode: String = '';
  showReactive: boolean = false;
  showPower: boolean = false;

  columnDefs = [
    {
      colId: 'timestamp',
      headerName: 'Timestamp',
      headerTooltip: 'Timestamp',
      field: 'createDate',
      valueGetter: (node) => {
        if (node.data.createDate) {
          // return this.datePipe.transform(node.data.createDate,'dd/mm/yyyy hh:mm:ss A','en-IN')
          return moment(node.data.createDate).format('DD/MM/yyyy hh:mm:ss A');
        } else return null;
      },
      tooltipValueGetter: (node) => {
        if (node.data.createDate) {
          return moment(node.data.createDate).format('DD/MM/yyyy hh:mm:ss A');
          // return this.datePipe.transform(node.data.createDate,'dd/mm/yyyy hh:mm:ss A','en-IN')
        } else return null;
      },
      width: 125,
    },
    // {
    //   headerName: 'Mode',
    //   headerTooltip: 'Mode',
    //   colId: 'mode',
    //   field: 'mode',
    //   tooltipField: 'mode',
    //   width: 80,
    // },
    {
      headerName: 'Active Power Setpoint',
      headerTooltip: 'Active Power Setpoint',
      colId: 'p',
      field: 'p',
      tooltipField: 'pset',
      width: 130,
    },
    {
      headerName: 'Reactive Power Setpoint',
      headerTooltip: 'Reactive Power Setpoint',
      colId: 'q',
      field: 'q',
      tooltipField: 'qset',
      width: 135,
    },
    {
      headerName: 'Power Factor Setpoint',
      headerTooltip: 'Power Factor Setpoint',
      colId: 'pf',
      field: 'pf',
      tooltipField: 'pfset',
      width: 125,
    },
    {
      headerName: 'Operation Mode',
      headerTooltip: 'Operation Mode',
      colId: 'qref',
      field: 'qref',
      valueGetter: (node) => {
        var code = this.dropdownCodes.find((codeObj) => {
          return codeObj.codeValue == node.data.qref;
        });
        if (code != null) {
          return code.codeDisplayTxt;
        } else return '';
      },
      tooltipValueGetter: (node) => {
        var code = this.dropdownCodes.find((codeObj) => {
          return codeObj.codeValue == node.data.qref;
        });
        if (code != null) {
          return code.codeDisplayTxt;
        } else return '';
      },
      width: 200,
    },
    {
      headerName: 'PFSign',
      headerTooltip: 'PFSign',
      colId: 'pfsign',
      field: 'pfsign',
      valueGetter: (node) => {
        var code = this.pfsignCodes.find((codeObj) => {
          return codeObj.codeValue == node.data.pfsign;
        });
        if (code != null) {
          return code.codeDisplayTxt;
        } else return '';
      },
      tooltipValueGetter: (node) => {
        var code = this.pfsignCodes.find((codeObj) => {
          return codeObj.codeValue == node.data.pfsign;
        });
        if (code != null) {
          return code.codeDisplayTxt;
        } else return '';
      },
      width: 60,
    },
    {
      headerName: 'Set By',
      headerTooltip: 'Set By',
      colId: 'createUser',
      field: 'createUser',
      tooltipField: 'createUser',
      width: 60,
    },
  ];
  columnDefs1 = [
    {
      headerName: 'Timestamp',
      headerTooltip: 'Timestamp',
      field: 'recordTimestamp',
      valueGetter: (node) => {
        if (node.data.recordTimestamp) {
          return moment(node.data.recordTimestamp).format(
            'DD/MM/yyyy hh:mm:ss A'
          );
        } else return null;
      },
      tooltipValueGetter: (node) => {
        if (node.data.recordTimestamp) {
          return moment(node.data.recordTimestamp).format(
            'DD/MM/yyyy hh:mm:ss A'
          );
        } else return null;
      },
      width: 120,
    },
    {
      headerName: 'PPC Code',
      headerTooltip: 'PPC Code',
      field: 'errorCode',
      tooltipField: 'errorCode',
      width: 70,
    },
    {
      headerName: 'PPC Message',
      headerTooltip: 'PPC Message',
      field: 'errorCode1',
      valueGetter: (node) => {
        var err = this.errorCodes.find((errCode) => {
          return errCode.codeValue == node.data.errorCode;
        });
        if (err != null) {
          return err.codeDisplayTxt;
        } else return '';
      },
      tooltipValueGetter: (node) => {
        var err = this.errorCodes.find((errCode) => {
          return errCode.codeValue == node.data.errorCode;
        });
        if (err != null) {
          return err.codeDisplayTxt;
        } else return '';
      },
      width: 150,
    },
    {
      headerName: 'Quality',
      headerTooltip: 'Quality',
      field: 'quality',
      valueGetter: (node) => {
        if (node.data.quality == '1') {
          return 'Bad';
        } else if (node.data.quality == '0') {
          return 'Good';
        }
      },
      tooltipValueGetter: (node) => {
        if (node.data.quality == '1') {
          return 'Bad';
        } else if (node.data.quality == '0') {
          return 'Good';
        }
      },
      width: 60,
    },
  ];

  defaultColDef = {
    editable: false,
    filter: 'agTextColumnFilter',
  };

  rowData: any[] = [];
  errorPointsData: any[] = [];
  dropdownCodes: any[] = [];

  public refreshPPCLogsTimeout;
  public refreshPPCLogsTimeoutSeconds = 5;

  public refreshPPCSetpointsTimeout;
  public refreshPPCSetpointsTimeoutSeconds = 5;

  public scadaStatusInterval;
  flag: boolean = false;
  showBackButton = false;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private setpointsservice: SetpointsService,
    private getpointsService: GetpointsService,
    private toaster: ToastrService,
    private http: HttpClient,
    private tableFilterService: TablefilterserviceService,
    private datePipe: DatePipe,
    private dataservice: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.myDate = this.datePipe.transform(
    //   this.myDate,
    //   'dd/mm/yyyy hh:mm:ss A'
    // );
    //this.setPointsForm.controls['qref'].patchValue('1');
    this.flag = this.dataservice.getFlag();
    if (this.flag == true) {
      this.showBackButton = true;
    }
    this.spinnerText = 'Loading...';
    this.spinner.show();
    this.setPointsForm = this.fb.group({
      p: ['', [Validators.required, Validators.pattern('\\d+(\\.\\d+)?')]],
      q: ['', [Validators.required]],
      pf: ['', [Validators.required, Validators.pattern('\\d+(\\.\\d+)?')]],
      pref: ['', [Validators.pattern('\\d+(\\.\\d+)?')]],
      qref: ['', [Validators.required,Validators.pattern('\\d+(\\.\\d+)?')]],
      pfsign: ['', [Validators.required]],
      createUser: [''],
      mode: [''],
    });
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
    this.getReactiveDropdownCode();
    this.getPowerDropdownCode();
    this.getPfsignDropdownCode();
    this.getErrorDropdownCode();
    this.getPoints(false);
    this.getErrorQualityData(false);
    this.scadaStatusInterval = setInterval(() => {
      this.checkScada();
    }, 5000);
  }

  checkMode(e) {
    // alert(this.qrefm);
    if (this.qrefm === '6') {
      this.pPt = '0';
      this.pfs = '0';
      localStorage.setItem('pfs', this.setPointsForm.get('pf').value);
      this.setPointsForm.get('p').disable();
    } else if (this.qrefm === '3') {
      this.showPowerMethod();
    } else if (this.qrefm === '1') {
      this.showActiveMethod();
    } else {
      this.showReactiveMethod();
      this.setPointsForm.get('p').enable();
      // this.setPointsForm.get('pf').enable();
      // this.pPt = '';
      // this.qPoint = '';
      // this.pfs = '1.0';
      // this.setPointsForm.get('pf').disable();
      // console.log('this is qref: ' + this.nightMode);
    }
    // this.selectedMode = 'Reactive Power';
    // console.log(this.selectedMode);
  }

  backToOperationalUI() {
    this.flag = false;
    this.dataservice.setFlag(this.flag);
    this.router.navigate(['realtimesld']);
  }

  gridOptions: GridOptions = {
    pagination: false,
    paginationAutoPageSize: false,
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
    },
    suppressCellSelection: true,
  };

  gridOptions1: GridOptions = {
    pagination: false,
    paginationAutoPageSize: false,
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
    },
    suppressCellSelection: true,
  };

  get getControl() {
    return this.setPointsForm.controls;
  }

  checkScada() {
    this.getpointsService.checkScadaStatus().subscribe(
      (res) => {
        if (res === 'Success') {
          this.isScadaOn = true;
        } else {
          this.isScadaOn = false;
        }
        this.myDate = new Date();
      },
      (error) => {}
    );
  }
  onGridReady(params) {
    let that = this;
    localForage.getItem('setPointTableSorting', function (err, result: string) {
      that.setPointTable.columnApi.applyColumnState({
        state: JSON.parse(result),
        applyOrder: true,
      });
    });
    localForage.getItem('setPointTableFilter', function (err, res: string) {
      that.setPointTable.api.setFilterModel(res);
    });

    this.setPointTable.api.sizeColumnsToFit();
  }

  onGridReady1(params) {
    let that = this;
    localForage.getItem('errorQualityTableFilter', function (err, res: string) {
      that.errorQualityTable.api.setFilterModel(res);
    });
    this.errorQualityTable.api.sizeColumnsToFit();
  }

  exportTOExcel() {
    let filename = 'SetPointsTable-' + this.myDate;
    this.setPointTable.api.exportDataAsCsv({
      fileName: filename + '.csv',
    });
  }

  exportTOExcel1() {
    let filename = 'SetPointsHistory-' + this.myDate;
    this.errorQualityTable.api.exportDataAsCsv({
      fileName: filename + '.csv',
    });
  }

  resetForm() {
    this.setPointsForm.reset({ qref: '', pfsign: '2', pf: '1.0' });
    if (this.qrefm !== '') {
      this.qrefm = '';
    }
    this.setPointsForm.get('pf').disable();
    this.setPointsForm.get('pfsign').disable();
    this.showActiveMethod();
  }

  getReactiveDropdownCode() {
    this.getpointsService.getDropdownCodes('Operation Mode').subscribe(
      (res) => {
        this.reactiveCodes = res['data'];
        this.dropdownCodes = [...this.reactiveCodes, ...this.powerCodes];
      },
      (error) => {
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  getPowerDropdownCode() {
    this.getpointsService.getDropdownCodes('Power Factor Mode').subscribe(
      (res) => {
        this.powerCodes = res['data'];
        this.dropdownCodes = [...this.reactiveCodes, ...this.powerCodes];
      },
      (error) => {
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  getPfsignDropdownCode() {
    this.getpointsService.getDropdownCodes('PFSign').subscribe(
      (res) => {
        this.pfsignCodes = res['data'];
      },
      (error) => {
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  getErrorDropdownCode() {
    this.getpointsService.getDropdownCodes('errorCode').subscribe(
      (res) => {
        this.errorCodes = res['data'];
      },
      (error) => {}
    );
  }

  getErrorQualityData(isRefresh) {
    var filterModal;
    var latestModel;
    localForage.getItem('errorQualityTableFilter').then((value) => {
      latestModel = JSON.stringify(value);
    });

    if (isRefresh) {
      filterModal = this.errorQualityTable.api.getFilterModel();
      localForage.setItem('errorQualityTableFilter', filterModal);
      this.errorQualityTable.api.setFilterModel(filterModal);
    }
    this.getpointsService.getErrorsAndQuality().subscribe(
      (res) => {
        this.errorPointsData = res;
        if (isRefresh) {
          setTimeout(() => {
            this.errorQualityTable.api.setFilterModel(filterModal);
            this.filterModifiedErrorTable();
          });
        }
        clearTimeout(this.refreshPPCLogsTimeout);
        this.refreshPPCLogsTimeout = setTimeout(() => {
          this.getErrorQualityData(true);
        }, this.refreshPPCLogsTimeoutSeconds * 1000);
      },
      (error) => {
        clearTimeout(this.refreshPPCLogsTimeout);
        this.refreshPPCLogsTimeout = setTimeout(() => {
          this.getErrorQualityData(true);
        }, this.refreshPPCLogsTimeoutSeconds * 1000);
      }
    );
  }

  getPoints(isRefresh) {
    var filterModal;

    if (isRefresh) {
      filterModal = this.setPointTable.api.getFilterModel();
      localForage.setItem('setPointTableFilter', filterModal).then((value) => {
        // console.log(value);
        // console.log(filterModal);
      });
      let savedState = this.setPointTable.columnApi.getColumnState();
      localForage.setItem('setPointTableSorting', JSON.stringify(savedState));
    }
    this.getpointsService.getPoints().subscribe(
      (response) => {
        // console.log(response[0]);

        this.setPointTable.api.setRowData(response);
        if (response.length == 0) {
          // this.showActiveMethod();
          //this.qrefm = '1';
        }
        if (!isRefresh) {
          if (response.length == 0) {
            this.resetForm();
          } else {
            this.setPointsForm.controls.p.patchValue(response[0]['p']);
            this.setPointsForm.controls.q.patchValue(response[0]['q']);
            this.setPointsForm.controls.mode.patchValue(response[0]['mode']);
            this.setPointsForm.controls.pf.patchValue(response[0]['pf']);
            this.setPointsForm.controls.qref.patchValue(response[0]['qref']);

            this.setPointsForm.controls.pref.patchValue(2);
            this.setPointsForm.controls.createUser.patchValue('admin');
            if (response[0]['mode'] == 'Power Factor') {
              this.setPointsForm.get('pfsign').enable();
              this.setPointsForm.get('pf').enable();
            } else {
              this.setPointsForm.get('pfsign').disable();
              this.setPointsForm.get('pf').disable();
            }
          }
          if (response.length !== 0) {
            this.pPt = response[0]['p'];
            this.qPoint = response[0]['q'];
            this.qrPoint = response[0]['qref'];
            this.pfs = response[0]['pf'];
            this.selectedValue = response[0]['pfsign'];
            this.selectedPMode = response[0]['mode'];
            if (this.selectedPMode == 'Active Power') {
              this.isCheckedActive = true;
              this.showReactive = false;
              this.showPower = false;
              this.qrefm = '1';
              this.pfs = '1.0';
              // this.setPointsForm.get('qref').disable();
              this.setPointsForm.get('pf').disable();
              this.setPointsForm.get('pfsign').disable();
              // this.setPointsForm.get('p').enable();
            } else if (this.selectedPMode == 'Reactive Power') {
              this.isCheckedReactive = true;
              this.showReactive = true;
              this.showPower = false;
              this.qrefm = this.qrPoint;
              this.setPointsForm.get('qref').enable();
              this.setPointsForm.get('pfsign').disable();
              if (response[0]['qref'] == '6') {
                this.setPointsForm.get('p').disable();
                this.setPointsForm.get('pf').disable();
              }
            } else if (this.selectedPMode == 'Power Factor') {
              this.isCheckedFactor = true;
              this.setPointsForm.get('qref').enable();
              this.setPointsForm.get('pfsign').enable();
              this.qrefm = this.qrPoint;
              this.showReactive = false;
              this.showPower = true;
              this.setPointsForm.get('p').enable();
              this.setPointsForm.get('pf').enable();
            }
          }
          this.setPointTable.api.setFilterModel(
            localForage.getItem('setPointTableFilter')
          );
          this.setPointTable.api.sizeColumnsToFit();
        }
        if (isRefresh) {
          this.setPointTable.api.setFilterModel(filterModal);
          this.setPointTable.api.refreshClientSideRowModel('filter');
          this.setPointTable.api.sizeColumnsToFit();
        }
        clearTimeout(this.refreshPPCSetpointsTimeout);
        this.refreshPPCSetpointsTimeout = setTimeout(() => {
          this.getPoints(true);
          filterModal = this.setPointTable.api.getFilterModel();
          this.setPointTable.api.setFilterModel(filterModal);
          this.filterModifiedLogTable();
        }, this.refreshPPCSetpointsTimeoutSeconds * 1000);
      },
      (error) => {
        clearTimeout(this.refreshPPCSetpointsTimeout);
        this.refreshPPCSetpointsTimeout = setTimeout(() => {
          this.getPoints(true);
        }, this.refreshPPCSetpointsTimeoutSeconds * 1000);
      }
    );
  }

  onSubmit() {
    if (
      this.setPointsForm.get('p').value === '' &&
      this.setPointsForm.get('q').value === '' &&
      this.setPointsForm.get('qref').value === ''
    ) {
      this.toaster.error(
        'Active Power Setpoint, Reactive Power Setpoint & Reactive Power RefMode cannot be null'
      );
    } else if (
      this.setPointsForm.get('pf').value > 1 ||
      this.setPointsForm.get('pf').value < 0
    ) {
      this.toaster.error('Power Factor Setpoint value should be between 0 & 1');
    } else if (
      this.setPointsForm.get('p').value === '' &&
      this.setPointsForm.get('q').value === ''
    ) {
      this.toaster.error(
        'Active Power Setpoint & Reactive Power Setpoint cannot be null'
      );
    } else if (this.setPointsForm.get('p').value === '') {
      this.toaster.error('Active Power Setpoint cannot be null');
    } else if (this.setPointsForm.get('q').value === '') {
      this.toaster.error('Reactive Power Setpoint cannot be null');
    } else if (this.setPointsForm.get('qref').value === '') {
      this.toaster.error('Operation mode cannot be null');
    } else if (this.setPointsForm.get('pf').value === '') {
      this.toaster.error('Power Factor Setpoint cannot be null');
    } else if (this.setPointsForm.get('pfsign').value === '') {
      this.toaster.error('PFSign cannot be null');
    } else {
      this.submitted = true;
      if (this.setPointsForm.invalid) {
        return;
      }
      this.showReactive = true;
      this.setPointsForm.get('qref').enable();
      this.setPointsForm.get('pfsign').enable();
      this.selectedMode = this.setPointsForm.get('mode').value;
      // this.setPointsForm.get('p').enable();

      let body = {
        setpointSource: 1,
        ppcShutdown: 1,
        p: this.setPointsForm.get('p').value,
        q: this.setPointsForm.get('q').value,
        pf: this.setPointsForm.get('pf').value,
        /* pref:
          (this.selectedMode == 'Reactive Power' &&
            this.setPointsForm.get('qref').value == '1') ||
          this.setPointsForm.get('qref').value == '6'
            ? '2'
            : '1', */
        // pref: 2,
        qref: this.setPointsForm.get('qref').value,
        // qrefm: this.setPointsForm.get('qrefm').value,
        pfsign: this.setPointsForm.get('pfsign').value,
        createUser: localStorage.getItem('authenticatedUser'),
        mode: this.setPointsForm.get('mode').value,
      };

      if (this.selectedMode != 'Reactive Power') {
        this.showReactive = false;
      }
      if (this.selectedMode != 'Power Factor') {
        this.setPointsForm.get('pfsign').disable();
        this.secondQref = true;
      }
      this.loading = true;
      this.setpointsservice.setPoint(body).subscribe(
        (response) => {
          if (response == 'Success') {
            this.setPoints = body;
            this.toaster.success('Setpoints set successfully.');
          } else if (response == 'Modbus Error') {
            this.toaster.error('Unable to connect to modbus slave');
          } else if (response == 'SCADA App Error') {
            this.toaster.error(
              'Service is unreachable. Please verify that the setpoint service is running.'
            );
          } else if (response == 'Database Error') {
            this.toaster.warning(
              'Setpoints set successfully but database update failed.'
            );
          } else {
            this.toaster.error('Internal Server Error. Please try later.');
          }
        },
        (error) => {
          this.loading = false;
        }
      );
    }
  }

  showReactiveMethod() {
    this.getDropdown = 'Reactive Power Mode';
    this.isCheckedReactive = true;
    this.isCheckedFactor = false;
    this.showReactive = true;
    this.showPower = false;
    // this.qrefm = '';
    this.pfs = '1.0';
    this.pPt = '';
    this.qPoint = '';
    this.setPointsForm.get('qref').enable();
    this.setPointsForm.get('pfsign').disable();
    this.selectedValue = '2';
    this.setPointsForm.get('pf').disable();
  }

  showPowerMethod() {
    this.getDropdown = 'Power Factor Mode';
    this.isCheckedFactor = true;
    this.pPt = '';
    this.qPoint = '';
    this.setPointsForm.get('qref').enable();
    this.setPointsForm.get('p').enable();
    this.setPointsForm.get('pf').enable();
    this.setPointsForm.get('pfsign').enable();
    // this.qrefm = '';
    this.showReactive = false;
    this.showPower = true;
    this.selectedValue = '';
  }

  showActiveMethod() {
    this.isCheckedActive = true;
    this.isCheckedFactor = false;
    this.pPt = '';
    this.qPoint = '';
    this.showReactive = false;
    this.showPower = false;
    // this.qrefm = '1';
    this.pfs = '1.0';
    // this.setPointsForm.get('qref').disable();
    this.setPointsForm.get('p').enable();
    this.setPointsForm.get('pf').disable();
    this.setPointsForm.get('pfsign').disable();
    this.selectedValue = '2';
  }

  enable() {
    this.disableReactive = false;
  }

  disable() {
    this.disableReactive = true;
  }

  toggleShowReactive() {
    this.isShownReactive = !this.isShownReactive;
  }

  toggleShowPower() {
    this.isShownPower = !this.isShownPower;
  }

  defaultRadios() {
    // this.setPointsForm.get('qref').disable();
    this.prefm = '';
    this.qrefm = '';
    this.isDisabled == false;
    this.isDisabled1 == false;
  }

  //Radio 2 Reactive Power Mode
  enable1(name) {}

  //Radio 3 - Power Factor Mode
  enable2(name) {}

  //Radio 1 - Active Power Mode
  enable3(name) {}

  filterModifiedLogTable() {
    this.ppcTableFilter = this.tableFilterService.filter(
      this.setPointTable,
      this.columnDefs
    );
  }

  clearFilterLogTable(filter) {
    this.ppcTableFilter = this.tableFilterService.clearFilter(
      this.setPointTable,
      this.columnDefs,
      filter
    );
  }

  filterModifiedErrorTable() {
    this.ppcTableFilter1 = this.tableFilterService.filter(
      this.errorQualityTable,
      this.columnDefs1
    );
  }

  clearFilterErrorTable(filter) {
    this.ppcTableFilter1 = this.tableFilterService.clearFilter(
      this.errorQualityTable,
      this.columnDefs1,
      filter
    );
  }

  ngOnDestroy() {
    clearTimeout(this.refreshPPCLogsTimeout);
    clearTimeout(this.refreshPPCSetpointsTimeout);
    clearInterval(this.scadaStatusInterval);
    this.flag = false;
    this.dataservice.setFlag(this.flag);
  }
}
