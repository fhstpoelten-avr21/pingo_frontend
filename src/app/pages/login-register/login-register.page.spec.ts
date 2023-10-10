import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginRegisterPage } from './login-register.page';

describe('LoginRegisterPage', () => {
  let component: LoginRegisterPage;
  let fixture: ComponentFixture<LoginRegisterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LoginRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
