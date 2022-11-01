import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SetpointsComponent } from './setpoints.component';

const routes: Routes = [
  {
  path:'',
  component: SetpointsComponent,
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
export class SetpointsRoutingModule { }
