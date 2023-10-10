import { TestBed } from '@angular/core/testing';

import { StationApiService } from './station-api.service';

describe('StationApiService', () => {
  let service: StationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
