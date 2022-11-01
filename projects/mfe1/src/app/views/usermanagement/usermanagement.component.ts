import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { User } from 'src/app/Models/User';
import { UsermanagementserviceService } from 'src/app/services/usermanagementservice/usermanagementservice.service';
import { TablefilterserviceService } from 'src/app/services/tableFilterService/tablefilterservice.service';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { Role } from 'src/app/Models/Role';
import * as moment from 'moment';
import { AgGridCustomSelectComponent } from 'src/app/components/ag-grid-custom-select/ag-grid-custom-select.component';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UsersStates, UsersStatesModel } from '../../store/state/users.states';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AddUser, GetUsers } from '../../store/actions/users.actions';
import { tap, withLatestFrom } from 'rxjs/operators';
import { Userr } from 'src/app/Interfaces/Users';
import { CheckboxComponent } from 'src/app/components/ag-grid-custom-components/checkbox/checkbox.component';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/messageStatus/message.service';

@Component({
  selector: 'app-usermanagement',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.scss'],
})
export class UsermanagementComponent implements OnInit {
  @ViewChild('photoInput') photoInput: ElementRef;
  @ViewChild('userTable') userTable: AgGridAngular;
  @ViewChild('agTable') agTable: AgGridAngular;
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @ViewChild('permission') permission: AgGridAngular;
  @ViewChild('agRoleTable') agRoleTable: AgGridAngular;
  @ViewChild('createUserModal') createUserModal: ModalDirective;
  @ViewChild('smModal') lockModal: ModalDirective;
  @ViewChild('lgModal') unlockModal: ModalDirective;
  @ViewChild('sm1Modal') deactivateModal: ModalDirective;
  @ViewChild('sm2Modal') activateModal: ModalDirective;
  @ViewChild('lg1Modal') terminateModal: ModalDirective;
  @ViewChild('parentModal') setPasswordModal: ModalDirective;
  @ViewChild('childModal') confirmSetPasswordModal: ModalDirective;
  @ViewChild('saveUserModal') saveUserModal: ModalDirective;
  @ViewChild('UpdateUserModal') UpdateUserModal: ModalDirective;
  @ViewChild('basicMenu') basicMenu: ContextMenuComponent;
  @ViewChild('EditUserModal') EditUserModal: ModalDirective;
  @ViewChild('lg2Modal') assignModal: ModalDirective;
  @ViewChild('AddRoleModal') AddRoleModal: ModalDirective;

  //NGXS

  @Select(UsersStates.getUsersList) users$: Observable<Userr[]>;
  @Select(UsersStates.usersLoaded) userLoaded$: Observable<boolean>;

  myForm: FormGroup;
  isCollapsed1 = false;
  isCollapsed2 = false;
  isCollapsed3 = false;
  name;
  name1;
  language;
  emailNotification = false;
  smsNotification = false;
  TFANotification = false;
  TFAMethod = null;
  public nodatatable;
  public customEffectiveDate;
  public customTerminationDate;
  public userTableFilter;
  public roleTableFilter;
  UIMenuTableFilter;
  public userldapconfig;
  public rowClassRulesUserTable;
  public rowClassRulesRole;
  public rowClassRulesForMenu;
  public passwordRules;
  public isTerminate = 0;
  public isDisable = 1;
  public isActive = 2;
  tableRowClicked: String = 'user table';
  public isAdd = false;
  public isSaveActivate = false;
  public isDuplicateLoginId = false;
  public isInvalidPassword = false;
  public requiresPassword = false;
  public loading = false;
  roleId: any;
  public photo: any;
  roleData: any;
  roleName: string;
  public buttonText = '';
  frameworkComponents: any;

  public contextRow = new User();
  public selectedUserObj = new User();
  public selectedRoleObj = new Role();
  public newUser = new User();
  public rolePermissionsData = [];
  public usersList = [];
  public rolesList = [];
  public userList = [];
  public permissionId = [];
  public rolePermissions = [];
  public organizationList = [];
  public supportedLanguages = [];
  rowData = [];
  rowDataUserTable = [];
  rowDataForMenuTable = [];
  TimeZoneByCodeTypeList = [];
  public isAddForMenu = true;
  public getAllMenuList = [];
  public rolePermissionsList = [];
  public newRole = new saveRole();
  public newUIMenuList = [];
  public roleSelectedData = [];
  public isEdit: Boolean = false;
  public roleDescription;
  public newRoleName;
  public roleDataObject = [];
  public selectedRoleObject = null;
  public roleObject;
  public rowClassRulespermission;
  public getHasLoaded: Boolean = false;
  dropdownList = [];
  selectedItems = [];
  stringJson: any;
  stringObject: any;
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'objectId',
    textField: 'objectName',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 2,
    allowSearchFilter: true,
    maxHeight: 150,
  };

//first image change
pattern = '^(([0]{1,2}|\\+[1-9]{1}[0-9]{0,1})(\\d{10}))$';
public format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  public setPasswordObj = {
    newPassword: null,
    confirmNewPassword: null,
  };
  public countries = [
    {
      name: 'USA',
      states: ['Philadelphia', 'New York'],
    },
    {
      name: 'France',
      states: ['Belfort'],
    },
  ];
  public selectedCountry = {
    name: null,
    states: [],
  };
  permissions = [
    'Dashboards',
    'SCADA',
    'Real-time Monitoring',
    'Interface Management',
    'Device Management',
    'Connectivity',
    'Application',
    'User Administration',
    'System Administration',
  ];
  myPermission = this.permissions[0];
  checkbox = [false, false, false, false, false];
  selectedLangVariable = { noRowsToShow: '' };

  columnDefs = [
    {
      headerName: 'Role Name',
      headerTooltip: 'Role Name',
      field: 'roleName',
      tooltipField: 'roleName',
      onCellClicked: (node) => {
        this.customEffectiveDate = node.data.effectiveDate;
        this.customTerminationDate = node.data.terminationDate;
        this.changeSelectedRoleObj(node.data.roleName);
        this.isTerminateOrAssign(node.data);
      },
      cellStyle: (node) => {
        var style = {
          'font-weight': 'bold',
          cursor: 'pointer',
          'text-decoration': 'underline',
          color: 'black',
        };
        if (node.data.roleName == this.selectedRoleObj.roleName)
          style.color = 'black';
        return style;
      },
    },
    {
      headerName: 'Role Description',
      headerTooltip: 'Role Description',
      field: 'roleDescription',
      tooltipField: 'roleDescription',
    },
    {
      headerName: 'Assigned',
      headerTooltip: 'Assigned',
      field: 'assigned',
      tooltipField: 'assigned',
      cellStyle: { 'text-align': 'left' },
    },
    {
      headerName: 'Effective Date',
      headerTooltip: 'Effective Date',
      field: 'effectiveDate',
      valueGetter: (node) => {
        if (node.data.effectiveDate != null) {
          if (!isNaN(new Date(node.data.effectiveDate).getTime())) {
            return moment(node.data.effectiveDate).format(
              'DD/MM/yyyy hh:mm:ss A'
            );
            // return formatDate(node.data.effectiveDate, "MM/dd/yyyy HH:mm:ss", "en-US");
          } else return null;
        } else return null;
      },
      tooltip: (node) => {
        if (node.data.effectiveDate != null) {
          if (!isNaN(new Date(node.data.effectiveDate).getTime())) {
            return moment(node.data.effectiveDate).format(
              'DD/MM/yyyy hh:mm:ss A'
            );
            // return formatDate(node.data.effectiveDate, "MM/dd/yyyy HH:mm:ss", "en-US");
          } else return null;
        } else return null;
      },
      editable: (node) => {
        if (node.data.assigned == 'N') {
          return true;
        } else return false;
      },
      onCellValueChanged: (node) => {
        this.customEffectiveDate = node.data.effectiveDate;
      },
    },
    {
      headerName: 'Termination Date',
      headerTooltip: 'Termination Date',
      field: 'terminationDate',
      valueGetter: (node) => {
        if (node.data.terminationDate != null) {
          if (!isNaN(new Date(node.data.terminationDate).getTime())) {
            return moment(node.data.terminationDate).format(
              'DD/MM/yyyy hh:mm:ss A'
            );
            // return formatDate(node.data.terminationDate, "MM/dd/yyyy HH:mm:ss", "en-US");
          } else return null;
        } else return null;
      },
      tooltip: (node) => {
        if (node.data.terminationDate != null) {
          if (!isNaN(new Date(node.data.terminationDate).getTime())) {
            return moment(node.data.terminationDate).format(
              'DD/MM/yyyy hh:mm:ss A'
            );
            // return formatDate(node.data.terminationDate, "MM/dd/yyyy HH:mm:ss", "en-US");
          } else return null;
        } else return null;
      },
      editable: (node) => {
        if (node.data.assigned == 'Y') {
          return true;
        } else return false;
      },
      onCellValueChanged: (node) => {
        this.customTerminationDate = node.data.terminationDate;
      },
    },
  ];

  columnDefsUserTable = [
    {
      headerName: 'Organization',
      headerTooltip: 'Organization',
      field: 'organization',
      valueGetter: (node) => {
        var orgObj = node.data.orgUser;
        if (orgObj.length > 0) {
          return orgObj[0].organization.orgName;
        }
      },
      tooltip: (node) => {
        var orgObj = node.data.orgUser;
        if (orgObj.length > 0) {
          return orgObj[0].organization.orgName;
        }
      },
      width: 130,
    },
    {
      headerName: 'Login ID',
      headerTooltip: 'Login ID',
      field: 'loginId',
      tooltipField: 'loginId',
    },
    {
      headerName: 'First Name',
      headerTooltip: 'First Name',
      field: 'firstName',
      tooltipField: 'firstName',
    },
    {
      headerName: 'Last Name',
      headerTooltip: 'Last Name',
      field: 'lastName',
      tooltipField: 'lastName',
    },
    {
      headerName: 'Is Locked?',
      headerTooltip: 'Is Locked?',
      field: 'isenabled',
      tooltipField: 'isenabled',
      cellStyle: { 'text-align': 'left' },
      width: 120,
    },
    {
      headerName: 'Enable/Disable Date',
      headerTooltip: 'Enable/Disable Date',
      field: 'enableDate',
      valueGetter: (node) => {
        if (node.data.isenabled == 'N') {
          if (node.data.enableDate) {
            // return formatDate(node.data.enableDate, "MM/dd/yyyy HH:mm:ss", "en-US");
            return moment(node.data.enableDate).format('DD/MM/yyyy hh:mm:ss A');
          } else return null;
        } else if (node.data.disableDate) {
          return moment(node.data.disableDate).format('DD/MM/yyyy hh:mm:ss A');
          // return formatDate(node.data.disableDate, "MM/dd/yyyy HH:mm:ss", "en-US");
        } else return null;
      },
      tooltip: (node) => {
        if (node.data.isenabled == 'N') {
          if (node.data.enableDate) {
            return moment(node.data.enableDate).format('DD/MM/yyyy hh:mm:ss A');
            // return formatDate(node.data.enableDate, "MM/dd/yyyy HH:mm:ss", "en-US");
          } else return null;
        } else if (node.data.disableDate) {
          return moment(node.data.disableDate).format('DD/MM/yyyy hh:mm:ss A');
          // return formatDate(node.data.disableDate, "MM/dd/yyyy HH:mm:ss", "en-US");
        } else return null;
      },
    },
    {
      headerName: 'Is Active?',
      headerTooltip: 'Is Active?',
      field: 'isactive',
      tooltipField: 'isactive',
      cellStyle: { 'text-align': 'left' },
      width: 120,
    },
    {
      headerName: 'Activation Date',
      headerTooltip: 'Activation Date',
      field: 'activationDate',
      valueGetter: (node) => {
        if (node.data.activationDate) {
          return moment(node.data.activationDate).format(
            'DD/MM/yyyy hh:mm:ss A'
          );
          // return formatDate(node.data.activationDate, "MM/dd/yyyy HH:mm:ss", "en-US");
        } else return null;
      },
      tooltip: (node) => {
        if (node.data.activationDate) {
          return moment(node.data.activationDate).format(
            'DD/MM/yyyy hh:mm:ss A'
          );
          // return formatDate(node.data.activationDate, "MM/dd/yyyy HH:mm:ss", "en-US");
        } else return null;
      },
    },
  ];

  columnDefsPermission = [
    {
      headerName: 'Pages',
      headerTooltip: 'Pages',
      field: 'permissions',
      tooltipField: 'permissions',
      width: 600,
    },
    {
      headerName: 'Permissions(R/W)',
      headerTooltip: 'Permissions(R/W)',
      field: 'permission',
      tooltipField: 'permission',
      cellRendererFramework: CheckboxComponent,
      cellRendererParams: {
        tableRef: 'RolePermissionManagement',
        columnRef: 'Write Permission',
        checkedValue: true, 
        uncheckedValue: false,
        disabledSelector: [{ field: 'disabled', value: true }],
        disabled: false,
      },
      cellStyle: { textAlign: 'center' },
      suppressSizeToFit: true,
    },
    {
      headerName: 'Visibility',
      headerTooltip: 'Visibility',
      field: 'visibility',
      tooltipField: 'visibility',
      cellRendererFramework: CheckboxComponent,
      cellRendererParams: {
        tableRef: 'RolePermissionManagement',
        columnRef: 'Visibility',
        checkedValue: true,
        uncheckedValue: false,
        disabledSelector: [{ field: 'disabled', value: true }],
        disabled: false,
      },
      cellStyle: { textAlign: 'center' },
      width: 120,
      suppressSizeToFit: true,
    },
  ];

  columnDefsForMenu = [
    {
      headerName: 'Permission',
      headerTooltip: 'Permission',
      field: 'permissionsMenu',
      tooltipField: 'permissionsMenu',
      width: 350,
    },
    {
      headerName: '',
      // "headerTooltip": "Read write",
      field: 'permissionsMenuCheckbox',
      // "checkboxSelection": true,
      // "headerCheckboxSelection": true,
      tooltipField: 'permissionsMenuCheckbox',
      width: 120,
      cellStyle: { 'text-align': 'center' },
      cellRendererSelector: (prams) => {
        return {
          component: 'AgGridCustomSelect',
        };
      },
      cellRendererParams: {
        objectId: 'objectId',
        ischecked: 'permissionsMenuCheckbox',
        options: ['RW', null],
        disabled: false,
      },
    },
  ];

  gridOptions: GridOptions = {
    pagination: true,
    paginationAutoPageSize: true,
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
    },
    suppressCellSelection: true,
  };

  gridOptionsPermission: GridOptions = {
    pagination: true,
    paginationAutoPageSize: true,
    defaultColDef: {
      filter: false,
      sortable: true,
      resizable: true,
    },
    suppressCellSelection: true,
    context: {
      componentParent: this,
    },
  };

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

  gridOptionsForMenu: GridOptions = {
    //pagination: true,
    //paginationAutoPageSize: true,
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
    },
    suppressCellSelection: true,
    frameworkComponents: {
      AgGridCustomSelect: AgGridCustomSelectComponent,
    },
    context: {
      componentParent: this,
    },
  };

  constructor(
    private userService: UsermanagementserviceService,
    private contextMenuService: ContextMenuService,
    private toaster: ToastrService,
    private title: Title,
    private fb: FormBuilder,
    private tableFilterService: TablefilterserviceService,
    private store: Store,
    private messageStatus: MessageService,
    private router: Router
  ) {
    this.frameworkComponents = {
      checkboxRender: CheckboxComponent,
    };
  }

  agInit() {
    this.language = localStorage.getItem('language');
    this.internaltionalization();
  }

  ngAfterViewInit() {
    this.setIdForFilterIcon();
  }

  ngOnInit() {
    // this.store.select().take(1).subscribe(this.getHasLoaded =>{
    // });
    this.getMessageJSON();
    this.getStateData();

    window.scrollTo(0, 0);
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
    // this.getAllusers();
    this.getAllOrganizations();

    document
      .getElementById('userTable')
      .addEventListener('contextmenu', function (ev) {
        ev.cancelBubble = true;
        ev.stopPropagation();
        ev.preventDefault();
      });
    var that = this;
    window.addEventListener('resize', function () {
      that.userTable.api.sizeColumnsToFit();
      that.agGrid.api.sizeColumnsToFit();
    });

    this.myForm = this.fb.group({
      addedPermission: [],
    });

    this.getPasswordRules();
    // this.sizeToFitUserTable();
    // this.userTable.api.sizeColumnsToFit();
  }

  getMessageJSON() {
    this.messageStatus.readMessageJSON().subscribe((obj) => {
      this.stringJson = JSON.stringify(obj.statusCode);
      this.stringObject = JSON.parse(this.stringJson);
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

  getStateData() {
    let that = this;
    this.userLoaded$.subscribe((res) => {
      if (res) {
        this.users$.subscribe((resp) => {
          this.rowDataUserTable = JSON.parse(JSON.stringify(resp));
          this.usersList = resp;
        });
      } else {
        // get the data from existing state
        // If state is empty or the page has been loaded and this is the first ever call to the api
        this.store
          .dispatch(new GetUsers())
          .pipe(
            withLatestFrom(this.store.select(UsersStatesModel)),
            tap(([_, novelsState]) => {})
          )
          .subscribe((ressp) => {
            this.rowDataUserTable = JSON.parse(
              JSON.stringify(ressp[0]['users']['users'])
            );
          });
        // this.getAllusers();
      }
      if (this.selectedUserObj.userId != null && this.userList.length > 0) {
        this.selectedUserObj = Object.assign(
          this.selectedUserObj,
          this.rowDataUserTable.find((user) => {
            return user.userId == this.selectedUserObj.userId;
          })
        );
      } else {
        this.selectedUserObj = Object.assign(
          this.selectedUserObj,
          this.rowDataUserTable[0]
        );
      }
      setTimeout(() => {
        if (this.userTable.api.getRowNode('0') != null) {
          this.userTable.api.getRowNode('0').setSelected(true);
        }
      });
      this.getRolesForSelectedUser(this.selectedUserObj.userId);
    });
  }

  openCreateUserModal() {
    this.isInvalidPassword = false;
    this.newUser = new User();
    this.setPasswordObj.newPassword = null;
    this.createUserModal.show();
  }

  openEditModal() {
    this.newUser = JSON.parse(JSON.stringify(this.selectedUserObj));
    this.photo =
      this.selectedUserObj.photo == null
        ? 'assets/images/user.png'
        : this.selectedUserObj.photo;
    this.EditUserModal.show();
  }

  openSetPasswordModal() {
    this.setPasswordObj = {
      newPassword: null,
      confirmNewPassword: null,
    };
    this.setPasswordModal.show();
  }

  sizeToFitUserTable() {
    this.userTable.api.sizeColumnsToFit();
  }

  sizeToFitUserTableForRole() {
    this.agGrid.api.sizeColumnsToFit();
  }

  sizeToFitPermissionTable() {
    this.permission.api.sizeColumnsToFit();
  }

  changeRequiresPassword() {
    if (this.newUser.requiresPassword == 'N') {
      this.newUser.requiresPassword = 'Y';
    } else {
      this.newUser.requiresPassword = 'N';
    }
    if (this.newUser.requiresPassword == 'Y') {
      this.isInvalidPassword = true;
    } else if (
      this.newUser.userPassword[0].password ||
      this.setPasswordObj.newPassword
    ) {
      this.isInvalidPassword = true;
    } else {
      this.isInvalidPassword = false;
    }
  }

  changeCountry(countryName) {
    this.selectedCountry = this.countries.find((country) => {
      return country.name == countryName;
    });
  }

  /* Change Selected User */
  changeSelectedUserObj(loginId) {
    this.selectedUserObj = Object.assign(
      this.selectedUserObj,
      this.usersList.find(function (data) {
        return data.loginId == loginId;
      })
    );
    this.userTable.api.redrawRows();
  }

  changeExternalUser() {
    if (this.newUser.externalUser == 'N') {
      this.newUser.externalUser = 'Y';
    } else this.newUser.externalUser = 'N';
  }

  getAllOrganizations() {
    this.userService.getAllOrganizations().subscribe((response) => {
      if (response.message == 'Success') {
        this.organizationList = response.data;
      }
    });
  }

  getAllusers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe(
      (response) => {
        this.loading = false;
        if (response.message == 'Success') {
          this.usersList = response.data;
          this.rowDataUserTable = response.data;

          this.photo =
            response.data.photo == null
              ? 'assets/images/user.png'
              : response.data.photo;
          if (this.selectedUserObj.userId != null && this.userList.length > 0) {
            this.selectedUserObj = Object.assign(
              this.selectedUserObj,
              this.rowDataUserTable.find((user) => {
                return user.userId == this.selectedUserObj.userId;
              })
            );
          } else {
            this.selectedUserObj = Object.assign(
              this.selectedUserObj,
              this.rowDataUserTable[0]
            );
          }
          this.contextRow = JSON.parse(JSON.stringify(this.selectedUserObj));
          this.rowClassRulesUserTable = {
            'table-selected': (param) => {
              return param.data.loginId == this.selectedUserObj.loginId;
            },
          };
          setTimeout(() => {
            if (this.userTable.api.getRowNode('0') != null) {
              this.userTable.api.getRowNode('0').setSelected(true);
            }
          });
          this.isDisableOrActivate(this.selectedUserObj);
          this.getRolesForSelectedUser(this.selectedUserObj.userId);
        }
      },
      (error) => {
        this.loading = false;
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  getRolesForSelectedUser(id) {
    if (id) {
      this.loading = true;
      this.userService.getAllUserRoles(this.selectedUserObj.userId).subscribe(
        (response) => {
          this.loading = false;
          this.roleDataObject = response.data;
          this.roleName = response.data[0].roleName;
          this.roleData = response.data[1];
          this.roleId = response.data[0].roleId;
          if (response.message == 'Success') {
            this.rolesList = response.data;
            this.rolesList = this.rolesList.sort(function (a, b) {
              if (a.assigned == 'Y') return -1;
              else return 1;
            });
            this.rowData = this.rolesList;
            if (this.rolesList.length > 0) {
              if (this.selectedRoleObj.roleId == null) {
                this.selectedRoleObj = Object.assign(
                  this.selectedRoleObj,
                  this.rolesList[0]
                );
              } else {
                this.selectedRoleObj = Object.assign(
                  this.selectedRoleObj,
                  this.rolesList.find((role) => {
                    return role.roleId == this.selectedRoleObj.roleId;
                  })
                );
              }
              this.customEffectiveDate = this.selectedRoleObj.effectiveDate;
              this.customTerminationDate = this.selectedRoleObj.terminationDate;
              this.isTerminateOrAssign(this.selectedRoleObj);
              this.getRolePermissionsByRole();
            }
            setTimeout(() => {
              if (this.agGrid.api.getRowNode('0') != null) {
                this.agGrid.api.getRowNode('0').setSelected(true);
              }
            });
            this.rowClassRulesRole = {
              'table-selected': (param) => {
                return param.data.roleName == this.selectedRoleObj.roleName;
              },
            };
          }
        },
        (error) => {
          this.loading = false;
          let msg = this.getMessageByMessage(error.status);
          this.toaster.error(msg);
          if (error.status == 401) {
            localStorage.clear();
            this.router.navigate(['/']);
          }
        }
      );
    } else {
      this.rowData = [];
      this.rowClassRulesRole = {
        'selected-role': (param) => {
          return param.data.roleName == this.selectedRoleObj.roleName;
        },
      };
    }
  }

  getRolePermissionsByRole() {
    this.loading = true;
    this.rolePermissionsData = [];
    this.selectedItems = [];
    let roleId =
      this.tableRowClicked == 'user table'
        ? this.roleId
        : this.selectedRoleObj.roleId;
    this.userService.getRolePermissionsByRole(roleId).subscribe(
      (response) => {
        this.loading = false;
        var permissionsList = response.data;
        this.rolePermissionsData = response.data;
        this.rolePermissions = [];
        var newObject;
        if (permissionsList.length > 0) {
          permissionsList.forEach((permissionData) => {
            // if (permissionData.permission.permissionType == 'RW') {
            var newPermission = {
              permissions: permissionData.userObject.objectName,
              access: permissionData.permission.permissionType,
              id: permissionData.id,
              visibility: permissionData.permission.visibility,
              permission:
                permissionData.permission.permissionType == 'RW' ? true : false,
            };

            newObject = {
              objectId: permissionData.userObject.objectId,
              objectName: permissionData.userObject.objectName,
              objectPath: permissionData.userObject.objectPath,
              route: permissionData.userObject.route,
            };

            this.rolePermissions.push(newPermission);
            this.selectedItems.push(newObject);
            // }
          });
        }

        this.myForm.patchValue({
          addedPermission: this.selectedItems,
        });
      },
      (error) => {
        this.loading = false;
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  updateCheckbox(tableRef, columnRef, rowIndex, value) {
    let body = {
      roleObjectsPermissionsId: this.rolePermissions[rowIndex]['id'],
      permissionType: this.rolePermissions[rowIndex]['access'],
      visibility: this.rolePermissions[rowIndex]['visibility'],
    };

    if (tableRef == 'RolePermissionManagement' && columnRef == 'Visibility') {
      body['visibility'] = value;
    } else if (
      tableRef == 'RolePermissionManagement' &&
      columnRef == 'Permissions(R/W)'
    ) {
      body['permissionType'] = value == true ? 'RW' : 'R';
    }
    console.log(body);
    this.userService.updateRoleObjectPermissions(body).subscribe((obj) => {});
  }

  selectedRole(event) {
    this.roleDataObject.filter((obj) => {
      if (obj.roleId == event.target.value) {
        this.roleObject = obj;
      }
    });
    //console.log(this.roleObject);
  }

  saveNewUser() {
    if (this.isAdd == true) {
      this.newUser.isactive = 'N';
      this.newUser.isenabled = 'N';
    } else if (this.isSaveActivate == true) {
      this.newUser.isactive = 'Y';
      this.newUser.isenabled = 'N';
    }
    this.loading = true;
    this.userService.createUser(this.newUser).subscribe(
      (response) => {
        this.loading = false;
        this.isAdd = false;
        this.isSaveActivate = false;
        if (response.message == 'Success') {
          this.store.dispatch(new AddUser(this.newUser)).subscribe((ressp) => {
            // console.log('RESSP: ' + JSON.stringify(ressp['users']['users']));

            this.rowDataUserTable = JSON.parse(
              JSON.stringify(ressp['users']['users'])
            );
          });
          // this.userLoaded$.subscribe((res) => {
          //   console.log('is this: ' + res);
          // });
          let body = {
            assigned: 'N',
            effectiveDate: null,
            roleDescription: 'Role assign at the time of user creation.',
            roleId: this.roleObject.roleId,
            roleName: this.roleObject.roleName,
            terminationDate: null,
            userId: response.data.userId,
          };
          this.userService.assignRole(body).subscribe(
            (response) => {
              this.closeCreateUserModal();

              this.saveUserModal.hide();
              this.toaster.success('User Created Successfully');
              this.selectedUserObj.userId = null;
              // this.getAllusers();

              this.getStateData();
            },
            (error) => {
              this.loading = false;
              let msg = this.getMessageByMessage(error.status);
              this.toaster.error(msg);
              if (error.status == 401) {
                localStorage.clear();
                this.router.navigate(['/']);
              }
            }
          );
        }
      },
      (error) => {
        this.loading = false;
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  updateUser() {
    this.loading = true;
    this.userService.updateUser(this.newUser).subscribe(
      (response) => {
        this.loading = false;
        if (response.message == 'Success') {
          localStorage.setItem('timezone', this.newUser.timezone);
          this.EditUserModal.hide();
          this.UpdateUserModal.hide();
          this.toaster.success('User Updated Successfully.');
          // this.getAllusers();
        }
      },
      (error) => {
        this.loading = false;
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  lockUser() {
    var user = {
      userId: this.selectedUserObj.userId,
      isenabled: 'Y',
    };
    this.loading = true;
    this.userService.lockUnlockUser(user).subscribe(
      (response) => {
        this.loading = false;
        this.lockModal.hide();
        this.toaster.success('User Locked Successfully');
        // this.getAllusers();
      },
      (error) => {
        this.loading = false;
        this.lockModal.hide();
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  unlockUser() {
    var user = {
      userId: this.selectedUserObj.userId,
      isenabled: 'N',
    };
    this.loading = true;
    this.userService.lockUnlockUser(user).subscribe(
      (response) => {
        this.loading = false;
        this.unlockModal.hide();
        this.toaster.success('User Unlocked Successfully');
        // this.getAllusers();
      },
      (error) => {
        this.loading = false;
        this.unlockModal.hide();
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  activateUser() {
    var user = {
      userId: this.selectedUserObj.userId,
      isactive: 'Y',
    };
    this.loading = true;
    this.userService.activateDeactivateUser(user).subscribe(
      (response) => {
        this.loading = false;
        this.activateModal.hide();
        this.toaster.success('User Activated Successfully');
        // this.getAllusers();
      },
      (error) => {
        this.loading = false;
        this.activateModal.hide();
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  deactivateUser() {
    var user = {
      userId: this.selectedUserObj.userId,
      isactive: 'N',
    };
    this.loading = true;
    this.userService.activateDeactivateUser(user).subscribe(
      (response) => {
        this.loading = false;
        this.deactivateModal.hide();
        this.toaster.success('User Deactivated Successfully');
        // this.getAllusers();
      },
      (error) => {
        this.loading = false;
        this.deactivateModal.hide();
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  saveUserActivate() {
    this.isAdd = false;
    this.isSaveActivate = false;
    this.saveUserModal.hide();
  }

  changeSelectedRoleObj(roleName) {
    this.selectedRoleObj = Object.assign(
      this.selectedRoleObj,
      this.rolesList.find(function (data) {
        return data.roleName == roleName;
      })
    );
    this.agGrid.api.redrawRows();
    this.getRolePermissionsByRole();
  }

  rowClicked(event) {
    this.tableRowClicked = 'user table';
    this.contextRow = event.data;
    this.changeSelectedUserObj(event.data.loginId);
    this.isDisableOrActivate(event.data);
    this.getRolesForSelectedUser(this.contextRow.userId);
    this.getRolePermissionsByRole();
    this.newUser = JSON.parse(JSON.stringify(this.contextRow));
    this.userTable.api.getRowNode(event.node.id).setSelected(true);
  }

  rolesRowClicked(event) {
    this.tableRowClicked = 'role table';
    this.changeSelectedRoleObj(event.data.roleName);
    this.roleSelectedData = event.data;
    this.roleName = event.data.roleName;
    this.agGrid.api.getRowNode(event.node.id).setSelected(true);
  }

  passwordEnterEvent() {
    if (
      this.newUser.userPassword[0].password ||
      this.setPasswordObj.newPassword
    ) {
      this.isInvalidPassword = true;
    } else if (this.requiresPassword == false) {
      this.isInvalidPassword = true;
    } else {
      this.isInvalidPassword = false;
    }
  }

  uploadPhoto(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      var thisEvent = event;
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {};
    }
  }

  getPasswordRules() {
    this.userService.getPasswordRules().subscribe(
      (response) => {
        if (response.message == 'Success') {
          if (response.data != null && response.data.length > 0) {
            this.passwordRules = response.data[0];
          } else this.passwordRules = null;
        } else this.passwordRules = null;
      },
      (error) => {
        this.passwordRules = null;
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  saveWithoutActivate() {
    this.isAdd = true;
    this.isSaveActivate = false;
    this.saveUserModal.show();
  }

  saveWithActivate() {
    this.isAdd = false;
    this.isSaveActivate = true;
    this.saveUserModal.show();
  }

  /* Toggle Terminate/Assign Button based on Assigned value in Role */
  isTerminateOrAssign(userData) {
    if (userData.assigned == 'Y') {
      this.isTerminate = 1;
    } else {
      this.isTerminate = 2;
    }
  }

  /* Toggle Enable/Disable & Activate/Deactivate button */
  isDisableOrActivate(tableData) {
    if (tableData.isenabled == 'N') {
      this.isDisable = 1;
    } else {
      this.isDisable = 2;
    }

    if (tableData.isactive == 'Y') {
      this.isActive = 1;
    } else {
      this.isActive = 2;
    }
  }

  assignRole() {
    this.selectedRoleObj.userId = this.selectedUserObj.userId;
    if (this.customEffectiveDate) {
      this.selectedRoleObj.effectiveDate = new Date();
    } else this.selectedRoleObj.effectiveDate = null;
    this.loading = true;
    this.userService.assignRole(this.selectedRoleObj).subscribe(
      (response) => {
        this.loading = false;
        this.assignModal.hide();
        this.toaster.success('Role Assigned Successfully');
        this.selectedRoleObj.userId = null;
        // this.getAllusers();
      },
      (error) => {
        this.loading = false;
        this.assignModal.hide();
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  terminateRole() {
    this.selectedRoleObj.userId = this.selectedUserObj.userId;
    if (this.customTerminationDate) {
      this.selectedRoleObj.terminationDate = new Date();
    } else this.selectedRoleObj.terminationDate = null;
    var edate = new Date(this.selectedRoleObj.effectiveDate);
    if (
      this.selectedRoleObj.terminationDate != null &&
      this.selectedRoleObj.terminationDate < edate
    ) {
      this.toaster.error('Termination date is not valid.');
      this.terminateModal.hide();
      return 0;
    }
    this.loading = true;
    this.userService.terminateRole(this.selectedRoleObj).subscribe(
      (response) => {
        this.loading = false;
        this.terminateModal.hide();
        this.toaster.success('Role Terminate Successfully');
        // this.getAllusers();
      },
      (error) => {
        this.loading = false;
        this.terminateModal.hide();
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  phoneValidation(number, mobile) {
    if (number != null && number.toString().length > 13) {
      if (mobile == 1) {
        this.newUser.mobileNumber = number.toString().slice(0, 13);
      } else {
        this.newUser.phoneNumber = number.toString().slice(0, 13);
      }
    }
  }

  validateCreatePassword() {
    if (
      this.setPasswordObj.newPassword != this.newUser.userPassword[0].password
    ) {
      this.toaster.warning('Password does not match');
      return 0;
    }

    if (this.passwordRules != null) {
      if (this.passwordRules.minLength != null) {
        if (
          this.setPasswordObj.newPassword.length < this.passwordRules.minLength
        ) {
          var txt, txt1;
          this.toaster.warning(
            'Password must contain atleast' +
              ' ' +
              this.passwordRules.minLength +
              ' ' +
              'characters'
          );
          return 0;
        }
      }
      if (this.passwordRules.containsName == 'N') {
        var password = this.setPasswordObj.newPassword;
        var firstName = this.newUser.firstName;
        var lastName = this.newUser.lastName;
        if (firstName == null || firstName == '') {
          var msg;
          this.toaster.warning('Please enter First Name before validation');
          return 0;
        }
        if (lastName == null || lastName == '') {
          this.toaster.warning('Please enter Last Name before validation');
          return 0;
        }
        if (
          password.toUpperCase().includes(firstName.toUpperCase()) ||
          password.toUpperCase().includes(lastName.toUpperCase())
        ) {
          this.toaster.warning('Password cannot contain Name of the user');
          return 0;
        }
      }
      if (this.passwordRules.containsLoginId == 'N') {
        var password = this.setPasswordObj.newPassword;
        var loginId = this.newUser.loginId;
        if (loginId == null || loginId == '') {
          this.toaster.warning('Please enter Loginid before validation');
          return 0;
        }
        if (password.toUpperCase().includes(loginId.toUpperCase())) {
          this.toaster.warning('Password cannot contain LoginId of the user');
          return 0;
        }
      }
      if (this.passwordRules.mustHaveNumber == 'Y') {
        if (!/\d/.test(this.setPasswordObj.newPassword)) {
          this.toaster.warning('Password must contain atleast one number');
          return 0;
        }
      }
      if (this.passwordRules.mustHaveSpecialChar == 'Y') {
        if (!this.format.test(this.setPasswordObj.newPassword)) {
          this.toaster.warning(
            'Password must contain atleast one Special Character'
          );
          return 0;
        }
      }
      if (this.passwordRules.startWithChar == 'N') {
        var password = this.setPasswordObj.newPassword;
        if (this.format.test(password.charAt(0))) {
          this.toaster.warning('Password cannot start with special character');
          return 0;
        }
      }
      if (this.passwordRules.startWithNumber == 'N') {
        if (/\d/.test(this.setPasswordObj.newPassword.charAt(0))) {
          this.toaster.warning('Password cannot start with number');
          return 0;
        }
      }
    }
    this.toaster.info('Password Validated Successfully');
    this.isInvalidPassword = false;
  }

  validateSetPassword() {
    if (
      this.setPasswordObj.newPassword != this.setPasswordObj.confirmNewPassword
    ) {
      this.toaster.warning('Passwords do no match');
      return 0;
    }
    //this.loading = true;

    if (this.passwordRules != null) {
      if (this.passwordRules.minLength != null) {
        if (
          this.setPasswordObj.newPassword.length < this.passwordRules.minLength
        ) {
          this.toaster.warning(
            'Password must be atleast' +
              ' ' +
              this.passwordRules.minLength +
              ' ' +
              'characters in length'
          );
          return 0;
        }
      }
      if (this.passwordRules.containsName == 'N') {
        var password = this.setPasswordObj.newPassword;
        var firstName = this.selectedUserObj.firstName;
        var lastName = this.selectedUserObj.lastName;
        if (
          password.toUpperCase().includes(firstName.toUpperCase()) ||
          password.toUpperCase().includes(lastName.toUpperCase())
        ) {
          this.toaster.warning('Password cannot contain Name of the user');
          return 0;
        }
      }
      if (this.passwordRules.containsLoginId == 'N') {
        var password = this.setPasswordObj.newPassword;
        var loginId = this.selectedUserObj.loginId;
        if (password.toUpperCase().includes(loginId.toUpperCase())) {
          this.toaster.warning('Password cannot contain LoginId of the user');
          return 0;
        }
      }
      if (this.passwordRules.mustHaveNumber == 'Y') {
        if (!/\d/.test(this.setPasswordObj.newPassword)) {
          this.toaster.warning('Password must contain atleast one number');
          return 0;
        }
      }
      if (this.passwordRules.mustHaveSpecialChar == 'Y') {
        if (!this.format.test(this.setPasswordObj.newPassword)) {
          this.toaster.warning(
            'Password must contain atleast one Special Character'
          );
          return 0;
        }
      }
      if (this.passwordRules.startWithChar == 'N') {
        var password = this.setPasswordObj.newPassword;
        if (this.format.test(password.charAt(0))) {
          this.toaster.warning('Password cannot start with special character');
          return 0;
        }
      }
      if (this.passwordRules.startWithNumber == 'N') {
        if (/\d/.test(this.setPasswordObj.newPassword.charAt(0))) {
          this.toaster.warning('Password cannot start with a number');
          return 0;
        }
      }
    }
    this.setPasswordModal.hide();
    this.confirmSetPasswordModal.show();
  }

  setPassword() {
    var passwordObj = {
      id: null,
      users: {
        userId: this.selectedUserObj.userId,
      },
      password: this.setPasswordObj.newPassword,
    };
    if (
      this.selectedUserObj.userPassword != null &&
      this.selectedUserObj.userPassword.length > 0
    ) {
      passwordObj.id = this.selectedUserObj.userPassword[0].id;
    }
    this.loading = true;
    this.userService.setpassword(passwordObj).subscribe(
      (resposne) => {
        this.loading = false;
        if (resposne.message == 'Success') {
          this.confirmSetPasswordModal.hide();
          this.toaster.success('Password updated successfully');
          // this.getAllusers();
          this.setPasswordObj = {
            newPassword: null,
            confirmNewPassword: null,
          };
        }
      },
      (error) => {
        this.loading = false;
        let msg = this.getMessageByMessage(error.status);
        this.toaster.error(msg);
        if (error.status == 401) {
          localStorage.clear();
          this.router.navigate(['/']);
        }
      }
    );
  }

  setLoginId() {
    if (
      this.newUser.lastName != null &&
      this.newUser.lastName != undefined &&
      this.newUser.lastName != ''
    ) {
      if (
        this.newUser.middleName != null &&
        this.newUser.middleName != undefined &&
        this.newUser.middleName != ''
      ) {
        if (
          this.newUser.firstName != null &&
          this.newUser.firstName != undefined &&
          this.newUser.firstName != ''
        ) {
          this.newUser.loginId =
            this.newUser.firstName +
            '.' +
            this.newUser.middleName +
            '.' +
            this.newUser.lastName;
        } else {
          this.newUser.loginId =
            this.newUser.middleName + '.' + this.newUser.lastName;
        }
      } else {
        if (
          this.newUser.firstName != null &&
          this.newUser.firstName != undefined &&
          this.newUser.firstName != ''
        ) {
          this.newUser.loginId =
            this.newUser.firstName + '.' + this.newUser.lastName;
        } else {
          this.newUser.loginId = this.newUser.lastName;
        }
      }
    } else {
      if (
        this.newUser.middleName != null &&
        this.newUser.middleName != undefined &&
        this.newUser.middleName != ''
      ) {
        if (
          this.newUser.firstName != null &&
          this.newUser.firstName != undefined &&
          this.newUser.firstName != ''
        ) {
          this.newUser.loginId =
            this.newUser.firstName + '.' + this.newUser.middleName;
        } else {
          this.newUser.loginId = this.newUser.middleName;
        }
      } else {
        if (
          this.newUser.firstName != null &&
          this.newUser.firstName != undefined &&
          this.newUser.firstName != ''
        ) {
          this.newUser.loginId = this.newUser.firstName;
        } else {
          this.newUser.loginId = '';
        }
      }
    }
    this.checkForDuplicateLoginId();
  }

  checkForDuplicateLoginId() {
    this.isDuplicateLoginId = false;
    setTimeout(() => {
      for (var i = 0; i < this.usersList.length; i++) {
        if (
          this.newUser.loginId.toLowerCase() ==
            this.usersList[i].loginId.toLowerCase() &&
          this.newUser.userId != this.usersList[i].userId
        ) {
          this.isDuplicateLoginId = true;
        }
      }
    }, 250);
  }

  internaltionalization() {
    if (localStorage.getItem('language') == 'en') {
      this.selectedLangVariable = { noRowsToShow: 'No Rows To Show' };
      return this.selectedLangVariable;
    } else if (localStorage.getItem('language') == 'fr') {
      this.selectedLangVariable = { noRowsToShow: 'Aucune lignes à afficher' };
      return this.selectedLangVariable;
    }
  }

  setIdForFilterIcon() {
    var list = document.getElementsByClassName('ag-icon ag-icon-menu');
    for (var i = 0; i < list.length; i++) {
      var idname = 'ag-icon' + i;
      list[i].setAttribute('id', idname);
    }
  }

  /* Custom Filter Display for User Table */
  filterModifiedUserTable() {
    this.userTableFilter = this.tableFilterService.filter(
      this.userTable,
      this.columnDefsUserTable
    );
  }

  filterModifiedRoleTable() {
    this.roleTableFilter = this.tableFilterService.filter(
      this.agGrid,
      this.columnDefs
    );
  }

  clearFilterUserTable(filter) {
    this.userTableFilter = this.tableFilterService.clearFilter(
      this.userTable,
      this.columnDefsUserTable,
      filter
    );
  }

  clearFilterRoleTable(filter) {
    this.roleTableFilter = this.tableFilterService.clearFilter(
      this.agGrid,
      this.columnDefs,
      filter
    );
  }

  closeCreateUserModal() {
    this.createUserModal.hide();
    this.EditUserModal.hide();
    this.newUser = new User();
    this.isInvalidPassword = false;
    this.requiresPassword = false;
    this.setPasswordObj.newPassword = null;
    this.emailNotification = false;
    this.smsNotification = false;
    this.TFANotification = false;
    this.TFAMethod = null;
    this.photoInput.nativeElement.value = null;
    this.selectedRoleObject = null;
  }

  resetCreateUserModal() {
    this.newUser = new User();
    this.isInvalidPassword = false;
    this.requiresPassword = false;
    this.setPasswordObj.newPassword = null;
    this.emailNotification = false;
    this.smsNotification = false;
    this.TFANotification = false;
    this.TFAMethod = null;
    this.photoInput.nativeElement.value = null;
    this.selectedRoleObject = null;
  }

  resetEditUserModal() {
    this.newUser = JSON.parse(JSON.stringify(this.contextRow));
    this.isInvalidPassword = false;
    this.requiresPassword = false;
    this.setPasswordObj.newPassword = null;
    this.emailNotification = false;
    this.smsNotification = false;
    this.TFANotification = false;
    this.TFAMethod = null;
    this.photoInput.nativeElement.value = null;
    this.selectedRoleObject = null;
  }

  rolesRowClickedForMenu(event) {}

  filterModifiedUIMenuTable() {
    this.UIMenuTableFilter = this.tableFilterService.filter(
      this.agRoleTable,
      this.columnDefsForMenu
    );
  }

  clearFilterUIMenuTable(filter) {
    this.UIMenuTableFilter = this.tableFilterService.clearFilter(
      this.agRoleTable,
      this.columnDefsForMenu,
      filter
    );
  }

  sizeToFitForMenu() {
    this.agRoleTable.api.sizeColumnsToFit();
  }

  openCreateRoleModal() {
    this.buttonText = 'Save';
    this.isEdit = false;
    this.isAddForMenu = true;
    this.newUIMenuList = JSON.parse(localStorage.getItem('userObject'));
    this.newRoleName = '';
    this.roleDescription = '';
    this.rolePermissionsList = [];
    this.selectedItems = [];
    /* this.selectedItems = [
			{ objectId: 2, objectName: "View Reports", objectPath: "Reporting", route: "/reporting/reportruns" }
		];
		this.newUIMenuList[1].isDisabled = true;
		this.newUIMenuList = [...this.newUIMenuList]; */
    this.newUIMenuList = this.newUIMenuList.filter((obj) => {
      return obj.isPage == 1;
    });

    this.AddRoleModal.show();
  }

  openEditRoleModal() {
    this.buttonText = 'Update';
    this.isEdit = true;
    this.isAddForMenu = false;
    this.rolePermissionsList = [];
    this.newUIMenuList = [];
    this.newUIMenuList = JSON.parse(localStorage.getItem('userObject'));
    this.newRoleName =
      this.tableRowClicked == 'user table'
        ? this.roleDataObject[0]['roleName']
        : this.selectedRoleObj['roleName'];
    this.roleDescription =
      this.tableRowClicked == 'user table'
        ? this.roleDataObject[0]['roleDescription']
        : this.selectedRoleObj['roleDescription'];
    this.getRolePermissionsByRole();
    /* this.newUIMenuList[1].isDisabled = true;
		this.newUIMenuList = [...this.newUIMenuList]; */
    this.newUIMenuList = this.newUIMenuList.filter((obj) => {
      return obj.isPage == 1;
    });
    this.AddRoleModal.show();
  }

  onItemSelect(item: any) {
    this.permissionId.push(item.objectId);
  }

  onSelectAll(items: any) {
    this.permissionId = [];
    this.selectedItems.push(items);
    items.forEach((obj) => {
      this.permissionId.push(obj.objectId);
    });
  }

  onItemDeSelect(item: any) {
    this.permissionId.forEach((obj) => {
      if (obj == item.objectId) {
        this.permissionId.splice(item.objectId, 1);
      }
    });
  }

  refresh(): boolean {
    return false;
  }

  selectedNewRole;
  saveRole() {
    this.selectedNewRole = this.myForm.get('addedPermission').value;
    let landingPageId = [];
    landingPageId = this.newUIMenuList.filter((obj) => {
      return obj.isLanding == 1;
    });
    let newValue = this.selectedNewRole.filter((data) => {
      return data.objectId === landingPageId[0].objectId;
    });
    if (newValue.length == 0) {
      this.toaster.warning(
        'Please select the ' +
          landingPageId[0].objectName +
          '  option from the dropdown as it’s a landing page.'
      );
      return;
    }
    this.loading = true;
    this.newUIMenuList = JSON.parse(localStorage.getItem('userObject'));
    let data = ([] = this.permissionId);
    let roleobjectPermission = [];
    let filteredData = [];
    let valid = false;
    let text = this.buttonText == 'Save' ? 'Save' : 'Update';
    let value = ([] = this.myForm.get('addedPermission').value);
    let selectedMenu = [];
    let result = [];
    let uncheckedMenu = [];
    value.forEach((obj) => {
      selectedMenu.push(obj.objectId);
    });

    this.newUIMenuList.forEach((obj) => {
      uncheckedMenu.push(obj.objectId);
    });

    result = selectedMenu.filter(
      (element, i) => i === selectedMenu.indexOf(element)
    );

    uncheckedMenu = uncheckedMenu.filter(function (el) {
      return !result.includes(el);
    });

    if (text == 'Save') {
      this.roleDataObject.filter((obj) => {
        if (obj.roleName.toLowerCase() == this.newRoleName.toLowerCase()) {
          filteredData.push(obj);
        }
      });

      if (filteredData.length > 0) {
        valid = false;
      } else {
        valid = true;
      }
    }

    if (this.isEdit) {
      for (let i = 0; i < result.length; i++) {
        roleobjectPermission.push({
          updatedBy: localStorage.getItem('authenticatedUserFirstName'),
          userObjectId: result[i],
          roleId: this.selectedRoleObj.roleId,
          permissionId: 3,
        });
      }

      for (let i = 0; i < uncheckedMenu.length; i++) {
        roleobjectPermission.push({
          updatedBy: localStorage.getItem('authenticatedUserFirstName'),
          userObjectId: uncheckedMenu[i],
          roleId: this.selectedRoleObj.roleId,
          permissionId: 4,
        });
      }

      let body = {
        role: {
          roleId: this.selectedRoleObj.roleId,
          roleDescription: this.roleDescription,
          roleName: this.newRoleName,
          updatedBy: localStorage.getItem('authenticatedUserFirstName'),
          IsActive: 'Y',
        },
        roleobjectPermission: roleobjectPermission,
      };

      this.userService.updateRole(body).subscribe(
        (response) => {
          this.loading = false;
          this.AddRoleModal.hide();
          this.tableRowClicked = 'user table';
          // this.getAllusers();
          this.toaster.success('Permissions updated successfully.');
        },
        (error) => {
          this.loading = false;
          this.AddRoleModal.hide();
          let msg = this.getMessageByMessage(error.status);
          this.toaster.error(msg);
          if (error.status == 401) {
            localStorage.clear();
            this.router.navigate(['/']);
          }
        }
      );
    } else {
      if (valid) {
        for (let i = 0; i < result.length; i++) {
          roleobjectPermission.push({
            createdBy: localStorage.getItem('authenticatedUserFirstName'),
            updatedBy: localStorage.getItem('authenticatedUserFirstName'),
            userObjectId: result[i],
            roleId: this.selectedRoleObj.roleId,
            permissionId: 3,
          });
        }

        for (let i = 0; i < uncheckedMenu.length; i++) {
          roleobjectPermission.push({
            createdBy: localStorage.getItem('authenticatedUserFirstName'),
            updatedBy: localStorage.getItem('authenticatedUserFirstName'),
            userObjectId: uncheckedMenu[i],
            roleId: this.selectedRoleObj.roleId,
            permissionId: 4,
          });
        }

        let body = {
          role: {
            roleDescription: this.roleDescription,
            roleName: this.newRoleName,
            createdBy: localStorage.getItem('authenticatedUserFirstName'),
            IsActive: 'Y',
          },
          roleobjectPermission: roleobjectPermission,
        };

        this.userService.saveRole(body).subscribe(
          (response) => {
            this.loading = false;
            this.AddRoleModal.hide();
            this.tableRowClicked = 'user table';
            // this.getAllusers();
            this.toaster.success('Role added successfully.');
          },
          (error) => {
            this.loading = false;
            this.AddRoleModal.hide();
            let msg = this.getMessageByMessage(error.status);
            this.toaster.error(msg);
            if (error.status == 401) {
              localStorage.clear();
              this.router.navigate(['/']);
            }
          }
        );
      } else {
        this.loading = false;
        this.toaster.warning('Role name should not be duplicate.');
      }
    }
  }
}

export class saveRole {
  role: {
    roleDescription: string;
    roleName: string;
    createdBy: string;
    IsActive: string;
  };
  roleobjectPermission: [];
}
