import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  [x: string]: any;
  
  constructor(http: HttpClient) {
    console.debug('http', http);
  }
}
