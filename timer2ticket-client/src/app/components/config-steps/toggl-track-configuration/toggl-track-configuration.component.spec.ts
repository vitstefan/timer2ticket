import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TogglTrackConfigurationComponent } from './toggl-track-configuration.component';

describe('TogglTrackConfigurationComponent', () => {
  let component: TogglTrackConfigurationComponent;
  let fixture: ComponentFixture<TogglTrackConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TogglTrackConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TogglTrackConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
