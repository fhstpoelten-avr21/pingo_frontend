import { TestBed } from '@angular/core/testing';

import { JoinApiService } from './join-api.service';

describe('PingoApiService', () => {
  let service: JoinApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JoinApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
