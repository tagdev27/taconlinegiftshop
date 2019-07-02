import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialTreeComponent } from './social-tree.component';

describe('LandingComponent', () => {
  let component: SocialTreeComponent;
  let fixture: ComponentFixture<SocialTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
