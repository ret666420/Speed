import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PremiosPage } from './premios.page';

describe('PremiosPage', () => {
  let component: PremiosPage;
  let fixture: ComponentFixture<PremiosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PremiosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
