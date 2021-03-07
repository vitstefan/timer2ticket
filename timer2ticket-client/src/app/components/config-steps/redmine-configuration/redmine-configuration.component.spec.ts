import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedmineConfigurationComponent } from './redmine-configuration.component';

describe('RedmineConfigurationComponent', () => {
  let component: RedmineConfigurationComponent;
  let fixture: ComponentFixture<RedmineConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedmineConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedmineConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
