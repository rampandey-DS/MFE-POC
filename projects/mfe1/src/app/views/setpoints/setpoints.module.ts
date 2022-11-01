import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { SetpointsComponent} from './setpoints.component';
import { SetpointsRoutingModule } from './setpoints-routing.module';

@NgModule({
  declarations: [SetpointsComponent],
  imports: [
    CommonModule,
    SetpointsRoutingModule,
    SharedModule
  ]
})
export class SetpointsModule { }
