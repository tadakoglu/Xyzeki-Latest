/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BlobsService } from './blobs.service';

describe('Service: Blobs', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BlobsService]
    });
  });

  it('should ...', inject([BlobsService], (service: BlobsService) => {
    expect(service).toBeTruthy();
  }));
});
