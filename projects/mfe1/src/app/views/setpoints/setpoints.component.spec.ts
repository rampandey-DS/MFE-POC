import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetpointsComponent } from './setpoints.component';

describe('SetpointsComponent', () => {
  let component: SetpointsComponent;
  let fixture: ComponentFixture<SetpointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetpointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetpointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
