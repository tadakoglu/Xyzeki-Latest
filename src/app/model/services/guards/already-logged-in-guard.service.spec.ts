/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AlreadyLoggedInGuardService } from './already-logged-in-guard.service';

describe('Service: AlreadyLoggedInGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlreadyLoggedInGuardService]
    });
  });

  it('should ...', inject([AlreadyLoggedInGuardService], (service: AlreadyLoggedInGuardService) => {
    expect(service).toBeTruthy();
  }));
});
