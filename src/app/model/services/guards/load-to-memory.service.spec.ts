/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LoadToMemoryService } from './load-to-memory.service';

describe('Service: LoadToMemory', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadToMemoryService]
    });
  });

  it('should ...', inject([LoadToMemoryService], (service: LoadToMemoryService) => {
    expect(service).toBeTruthy();
  }));
});
