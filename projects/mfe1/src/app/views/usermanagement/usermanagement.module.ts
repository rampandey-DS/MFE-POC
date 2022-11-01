import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { UsermanagementComponent} from './usermanagement.component';
import { UsermanagementRoutingModule } from './usermanagement-routing.module';

@NgModule({
  declarations: [UsermanagementComponent],
  imports: [
    CommonModule,
    SharedModule,
    UsermanagementRoutingModule 
    
  ]
})
export class UsermanagementModule { }
