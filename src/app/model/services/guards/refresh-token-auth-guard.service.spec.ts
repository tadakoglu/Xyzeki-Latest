/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RefreshTokenAuthGuardService } from './refresh-token-auth-guard.service';

describe('Service: RefreshTokenAuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RefreshTokenAuthGuardService]
    });
  });

  it('should ...', inject([RefreshTokenAuthGuardService], (service: RefreshTokenAuthGuardService) => {
    expect(service).toBeTruthy();
  }));
});
