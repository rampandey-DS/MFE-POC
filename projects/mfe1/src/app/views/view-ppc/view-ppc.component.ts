import { Component, OnInit, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { TablefilterserviceService } from 'src/app/services/tableFilterService/tablefilterservice.service';
import { GridOptions } from 'ag-grid-community';
import { ViewLogsService } from 'src/app/services/view-logs/view-logs.service';
import { formatDate } from '@angular/common';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { MessageService } from 'src/app/services/messageStatus/message.service';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';

@Component({
  selector: 'app-view-ppc',
  templateUrl: './view-ppc.component.html',
  styleUrls: ['./view-ppc.component.scss'],
})
export class ViewPpcComponent implements OnInit {

  @ViewChild('logMessageModal') logMessageModal: ModalDirective;
  @ViewChild("basicMenu") basicMenu: ContextMenuComponent;

  gridApi: any;
  gridColumnApi: any;
  constructor(
    private tableFilterService: TablefilterserviceService,
    private viewLogs: ViewLogsService,
    public datepipe: DatePipe,
    private spinner: NgxSpinnerService,
    private contextMenuService: ContextMenuService,
    private toaster: ToastrService,
    private messageStatus: MessageService,
    private router: Router
  ) {}

  @ViewChild('ppcTable') ppcTable: AgGridAngular;

  bsConfig1 = { dateInputFormat: 'DD/MM/YYYY hh:mm:ss A' };
  bsConfig = { dateInputFormat: 'DD/MM/YYYY hh:mm:ss A' };
  public maxDate = new Date();

  public ppcTableFilter;
  public modBus: Boolean = true;
  public ppcBus: Boolean = false;
  public isValidDate: any;
  public loading = false;
  public ppcLogsData: any = [];
  selectedLogLevel: any = '';
  public busType: any = 'ModBus';
  public logLevel: any = 'All';
  public spinnerText: string = '';
  stringJson: any;
  stringObject: any;
  logMessage;
  public max = new Date();
  public setEndDate = new Date();
  public currentDate = new Date();
  public setStartDate = new Date();
  columnDefs = [
    {
      headerName: 'Device Name',
      field: 'device_name',
      headerTooltip: 'Thread Name',
      tooltipField: 'device_name',
    },
    {
      headerName: 'Log Level Name',
      field: 'loglevelname',
      headerTooltip: 'Log Level Name',
      tooltipField: 'loglevelname',
    },
    {
      headerName: 'Record Timestamp',
      field: 'record_timestamp',
      headerTooltip: 'Record Timestamp',
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
    },

    {
      headerName: 'Log Message',
      field: 'logmessage',
      headerTooltip: 'Log Message',
      tooltipField: 'logmessage',
      width: 500,
    },
  ];

  gridOptionsUserTable: GridOptions = {
    pagination: true,
    paginationAutoPageSize: true,
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
    },
    suppressCellSelection: true,
  };

  ngOnInit(): void {
    this.getMessageJSON();
    this.getPPCLogs();
    this.checkState();
    document.getElementById("ppcTable").addEventListener('contextmenu', function (ev) {
      ev.cancelBubble = true;
      ev.stopPropagation();
      ev.preventDefault();
    });
  }

  getMessageJSON() {
    this.messageStatus.readMessageJSON().subscribe((obj) => {
      this.stringJson = JSON.stringify(obj.statusCode);
      this.stringObject = JSON.parse(this.stringJson);
    });
  }

  cellRightClick(event) {  
    var mouseevent: MouseEvent = event.event;
    this.logMessage = event.data.logmessage;
    this.contextMenuService.show.next({
      contextMenu: this.basicMenu,
      event: mouseevent,
      item: event.data
    });
  }

  openMessageModal() {
    this.logMessageModal.show();
  }

  checkState() {
    if (localStorage.getItem('busType')) {
      if (localStorage.getItem('busType') == 'PPCBus') {
        this.modBus = false;
        this.ppcBus = true;
      } else {
        this.modBus = true;
        this.ppcBus = false;
      }
    }

    if (localStorage.getItem('logLevel')) {
      this.selectedLogLevel = localStorage.getItem('logLevel');
    } else {
      this.selectedLogLevel = 'All';
    }
  }

  radioButtonClick(event, name) {
    this.busType = name;
    localStorage.setItem('busType', this.busType);
  }

  selectLogLevel(event) {
    this.logLevel = event.target.value;
    localStorage.setItem('logLevel', this.logLevel);
  }

  getPPCLogs() {
    this.loading = true;
    this.spinnerText = 'Loading...';
    var d1 = new Date();
    // this.datepipe.transform(
    //    this.setStartDate.setHours(d1.getHours() - 2),
    // 'yyyy-MM-dd HH:mm:ss');
    //  'yyyy-MM-dd HH:mm:ss'
    this.setStartDate.setHours(d1.getHours() - 2), 'yyyy-MM-dd HH:mm:ss';
    let body = {
      loglevel: this.logLevel,
      logFrom: moment().subtract('02:00:00').format('YYYY-MM-DD HH:mm:ss'),
      // this.datepipe.transform(
      //   this.setStartDate.setHours(d1.getHours() - 2),
      //   'yyyy-MM-dd HH:mm:ss'
      //  ),
      logTo: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    if (this.busType == 'ModBus') {
      this.spinner.show();
      this.viewLogs.getAllMODLogs(body).subscribe(
        (res) => {
          this.ppcLogsData = res.data;
          this.loading = false;
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
        },
        (error) => {
          this.loading = false;
          this.spinner.hide();
          let msg = this.getMessageByMessage(error.status);
          this.toaster.error(msg);
          if (error.status == 401) {
            localStorage.clear();
            this.router.navigate(['/']);
          }
        }
      );
    } else if (this.busType == 'PPCBus') {
      this.spinner.show();
      this.viewLogs.getAllPPCLogs(body).subscribe(
        (res) => {
          this.ppcLogsData = res.data;
          this.loading = false;
          setTimeout(() => {
            this.spinner.hide();
          }, 1000);
        },
        (error) => {
          this.loading = false;
          this.spinner.hide();
          let msg = this.getMessageByMessage(error.status);
          this.toaster.error(msg);
          if (error.status == 401) {
            localStorage.clear();
            this.router.navigate(['/']);
          }
        }
      );
    }
  }

  viewPPC() {
    this.isValidDate = this.validateDates(this.setStartDate, this.setEndDate
      // this.datepipe.transform(this.setStartDate, 'yyyy-MM-dd HH:mm:ss'),
      // this.datepipe.transform(this.setEndDate, 'yyyy-MM-dd hh:mm:ss')
    );
    if (this.isValidDate) {
      this.loading = true;
      this.spinnerText = 'Loading...';
      let body = {
        loglevel: this.logLevel,
        logFrom: moment(this.setStartDate).format('YYYY-MM-DD HH:mm:ss'),
        logTo: moment(this.setEndDate).format('YYYY-MM-DD HH:mm:ss'),
      };
      if (this.busType == 'ModBus') {
        this.spinner.show();
        this.viewLogs.getAllMODLogs(body).subscribe(
          (res) => {
            this.ppcLogsData = res.data;
            this.loading = false;
            setTimeout(() => {
              this.spinner.hide();
            }, 1000);
          }, (error) => {
            this.loading = false;
            let msg = this.getMessageByMessage(error.status);
            this.toaster.error(msg);
            if (error.status == 401) {
              localStorage.clear();
              this.router.navigate(['/']);
            }
            this.spinner.hide();
          }
        );
      } else if (this.busType == 'PPCBus') {
        this.spinner.show();
        this.viewLogs.getAllPPCLogs(body).subscribe(
          (res) => {
            this.ppcLogsData = res.data;
            this.loading = false;
            setTimeout(() => {
              this.spinner.hide();
            }, 1000);
          }, (error) => {
            this.loading = false;
            let msg = this.getMessageByMessage(error.status);
            this.toaster.error(msg);
            if (error.status == 401) {
              localStorage.clear();
              this.router.navigate(['/']);
            }
            this.spinner.hide();
          }
        );
      }
    }
  }

  validateDates(sDate, eDate) {
    this.isValidDate = true;
    if (sDate == null || eDate == null) {
      this.toaster.warning('Show logs to and Show logs from are required.');
      this.isValidDate = false;
    }

    if (sDate > eDate) {
       this.toaster.warning('Show logs to should be greater than Show logs from.');
       this.isValidDate = false;
      }
   
    // if(sDate != null && eDate != null) {
    //   if(this.setStartDate.getTime() > this.setEndDate.getTime()) {
    //     this.toaster.warning('Show logs from time should be smaller than Show logs to.');
    //     this.isValidDate = false;
    //   }
    // }
    
    return this.isValidDate;
  }

  exportTOExcel() {
    let currentTime = this.datepipe.transform(this.currentDate, 'yyyy-MM-dd HH:mm:ss');
    let newDate = currentTime.replace(' ', '_');
    let filename =
      this.busType == 'ModBus'
        ? 'modbus_log_' + newDate
        : 'ppcoutput-log_' + newDate;
    this.ppcTable.api.exportDataAsCsv({
      fileName: filename + '.csv',
    });
  }

  getMessageByMessage(data) {
    let message;
    for (let i = 0; i < this.stringObject.length; i++) {
      if (this.stringObject[i].id == data) {
        message = this.stringObject[i].msg;
      }
    }
    return message;
  }

  sizeToFitUserTable() {
    this.ppcTable.api.sizeColumnsToFit();
    if (localStorage.getItem('logTableSavedState')) {
      this.ppcTable.columnApi.applyColumnState({
        state: JSON.parse(localStorage.getItem('logTableSavedState')),
      });
    } else {
      let savedState = this.ppcTable.columnApi.getColumnState();
      localStorage.setItem('logTableSavedState', JSON.stringify(savedState));
    }
    this.gridApi = this.ppcTable.api;
    this.gridColumnApi = this.ppcTable.columnApi;
    this.sortTable();
  }

  checkSorting() {
    console.log(this.gridApi.getSortModel());
    localStorage.setItem(
      'logTableSorting',
      JSON.stringify(this.gridApi.getSortModel())
    );
  }

  sortTable() {
    if (localStorage.getItem('logTableSorting')) {
      var st = JSON.parse(localStorage.getItem('logTableSorting'));
      this.gridColumnApi.applyColumnState({ state: st });
    }

    if (localStorage.getItem('filteredLogTable')) {
      this.gridApi.setFilterModel(
        JSON.parse(localStorage.getItem('filteredLogTable'))
      );
    }
  }

  filterModifiedLogTable() {
    this.ppcTableFilter = this.tableFilterService.filter(
      this.ppcTable,
      this.columnDefs
    );

    localStorage.setItem(
      'filteredLogTable',
      JSON.stringify(this.gridApi.getFilterModel())
    );
  }

  clearFilterLogTable(filter) {
    this.ppcTableFilter = this.tableFilterService.clearFilter(
      this.ppcTable,
      this.columnDefs,
      filter
    );
  }
}
