/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ContainersService } from './containers.service';

describe('Service: Containers', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContainersService]
    });
  });

  it('should ...', inject([ContainersService], (service: ContainersService) => {
    expect(service).toBeTruthy();
  }));
});
