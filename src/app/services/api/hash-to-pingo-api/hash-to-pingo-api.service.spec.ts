import { TestBed } from '@angular/core/testing';

import { HashToPingoApiService } from './hash-to-pingo-api.service';

describe('HashToPingoApiService', () => {
  let service: HashToPingoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HashToPingoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
