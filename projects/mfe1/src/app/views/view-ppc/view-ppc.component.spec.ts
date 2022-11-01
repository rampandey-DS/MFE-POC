import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPpcComponent } from './view-ppc.component';

describe('ViewPpcComponent', () => {
  let component: ViewPpcComponent;
  let fixture: ComponentFixture<ViewPpcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewPpcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewPpcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
