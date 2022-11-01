import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { LoginService } from '../../services/loginService/login.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UiconfigService } from '../../services/uiconfig/uiconfig.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public spinnerText = '';
  public usertype: string = null;

  public icons = {
    signIn: faSignInAlt,
  };

  public credentials: Credentials = new Credentials();

  constructor(
    private router: Router,
    private loginService: LoginService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    private getLogo: UiconfigService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('authenticatedUser') != null) {
      this.router.navigate(['/poi']);
    }
    // this.getClientLogo();
  }

  getClientLogo(){
    this.getLogo.getLogo().subscribe(
      (res) => {       
      },
      (error) => {}
    );
  }

  isLogin(e) {
    if (e.key == 'Enter') {
      this.login();
    }
  }

  login() {
    this.spinnerText = 'Logging in...';
    this.spinner.show();
    var req = {
      emailId: this.credentials.username,
      password: this.credentials.password,
    };
    this.loginService.login(req).subscribe(
      (response) => {
        if (response.statusCode == 200) {
          localStorage.setItem('authToken',response.data.user.token);
          localStorage.setItem('role', response.role);
          if (response.role == null) {
            this.spinner.hide();
            this.toaster.error(
              'No Role assign to user. Please contact your administrator'
            );
          } else if (response.data.user.isactive == 'N') {
            this.spinner.hide();
            this.toaster.error(
              'User is not active. Please contact your Administrator.'
            );
          } else if (response.data.user.isenabled == 'Y') {
            this.spinner.hide();
            this.toaster.error(
              'User is locked. Please contact your Administrator.'
            );
          } else {
            localStorage.setItem(
              'username',
              response.data.user.firstName + ' ' + response.data.user.lastName
            );
            localStorage.setItem('loggedInUser', response.data.user.firstName);
            localStorage.setItem(
              'authenticatedUser',
              response.data.user.loginId
            );
            localStorage.setItem(
              'authenticatedUserFirstName',
              response.data.user.firstName
            );
            localStorage.setItem('usertype', this.usertype);
            localStorage.setItem('userId', response.data.user.userId);
            sessionStorage.setItem(
              'ppc-access',
              JSON.stringify(response.data.roleObjectPermissions)
            );
            let userObjects = [];
            response.data.roleObjectPermissions.forEach(obj => {
              userObjects.push(obj.userObject);
            });

            localStorage.setItem('userObject', JSON.stringify(userObjects));
            
            localStorage.setItem('ppc-access',JSON.stringify(response.data.roleObjectPermissions));
            let landingPageRoute = [];
            let userObject = JSON.parse(localStorage.getItem('userObject'));
            landingPageRoute = userObject.filter(obj => {
              return obj.isLanding == 1;
          });        
            this.spinner.hide();
            if(landingPageRoute.length != 0) {
              this.router.navigate([landingPageRoute[0].route]); 
            } else {
              localStorage.clear();
              this.router.navigate(["/"]);
              this.toaster.warning('No landing page configured for the application. Please contact your Administrator.');
            }
           
          }
        } else {
          this.spinner.hide();
          this.toaster.warning(response.message);
        }
      },
      (error) => {
        this.spinner.hide();
        this.toaster.error('Exception in login. Please try later.');
      }
    );
  }
}

export class Credentials {
  constructor(username?, password?, firstname?) {
    this.username = username;
    this.password = password;
    this.firstname = firstname;
  }

  username: string;
  password: string;
  firstname: string;
}
