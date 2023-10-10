import { TestBed } from '@angular/core/testing';

import { PingoApiService } from './pingo-api.service';

describe('PingoApiService', () => {
  let service: PingoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PingoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
