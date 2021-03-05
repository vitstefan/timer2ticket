import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ServicesChooseComponent } from './services-choose.component';

describe('ServicesChooseComponent', () => {
  let component: ServicesChooseComponent;
  let fixture: ComponentFixture<ServicesChooseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicesChooseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesChooseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
