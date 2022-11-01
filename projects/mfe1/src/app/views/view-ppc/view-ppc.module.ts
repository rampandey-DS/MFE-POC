import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPpcComponent } from './view-ppc.component';
import { ViewPpcRoutingModule } from './view-ppc-routing.module';
import { from } from 'rxjs';
import { SharedModule } from '../../shared/shared.module';
import { DateTimeAdapter, OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time-adapter.class';

export const MY_CUSTOM_FORMATS = {
  fullPickerInput: 'DD-MM-YYYY hh:mm:ss A',
  parseInput: 'DD-MM-YYYY hh:mm:ss A',
  datePickerInput: 'DD-MM-YYYY hh:mm:ss A',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY'
  };

@NgModule({
  declarations: [ViewPpcComponent],
  imports: [
    CommonModule,
    ViewPpcRoutingModule,
    SharedModule,
    OwlDateTimeModule,
     OwlNativeDateTimeModule,
  ],

  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_CUSTOM_FORMATS }
    ]
})
export class ViewPpcModule {    }


