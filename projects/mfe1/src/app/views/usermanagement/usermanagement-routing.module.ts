import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { AuthService } from 'src/app/services/authService/auth.service';
import { UsermanagementComponent} from './usermanagement.component';


const routes: Routes = [
  {
    path:'',
    component: UsermanagementComponent,
    // data: {
    //   id: 6
    // },
    // canActivate: [ AuthService ],

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsermanagementRoutingModule { }
