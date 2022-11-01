import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewPpcComponent } from './view-ppc.component';

const routes: Routes = [
  {
  path:'',
  component: ViewPpcComponent,
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
export class ViewPpcRoutingModule { }
