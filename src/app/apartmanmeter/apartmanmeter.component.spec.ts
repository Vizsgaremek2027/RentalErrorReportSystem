import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApartmanmeterComponent } from './apartmanmeter.component';

describe('ApartmanmeterComponent', () => {
  let component: ApartmanmeterComponent;
  let fixture: ComponentFixture<ApartmanmeterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApartmanmeterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApartmanmeterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
