import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { XyzekiAuthService } from 'src/app/model/auth-services/xyzeki-auth-service';
import { Router } from '@angular/router';
import { XyzekiAuthHelpersService } from 'src/app/model/auth-services/xyzeki-auth-helpers-service';
import { AuthService } from 'src/app/model/services/auth.service';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-nav-profile',
  templateUrl: './nav-profile.component.html',
  styleUrls: ['./nav-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class NavProfileComponent implements OnInit {

  constructor(public authService: AuthService, public xyzekiAuthService: XyzekiAuthService, private router: Router, public xyzekiAuthHelpersService: XyzekiAuthHelpersService) { }

  ngOnInit() {
  }
  deAuth() {
    this.authService.revoke().subscribe(() => {
      this.xyzekiAuthHelpersService.DeAuth();
      this.router.navigate(['/'])
    }, catchError((err) => { // in case access token & and refresh token both expired and user cannot call backend revoke and delete local member& token files.
      this.xyzekiAuthHelpersService.DeAuth();
      return EMPTY;
    }))

  }
  @Input() isLocked = false;

}
