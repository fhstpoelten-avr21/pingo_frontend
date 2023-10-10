import { TestBed } from '@angular/core/testing';

import { UserToPingoApiService } from './user-to-pingo-api.service';

describe('UserToPingoApiService', () => {
  let service: UserToPingoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserToPingoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
