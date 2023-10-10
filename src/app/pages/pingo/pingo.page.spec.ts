import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PingoPage } from './pingo.page';

describe('PingoPage', () => {
  let component: PingoPage;
  let fixture: ComponentFixture<PingoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PingoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
