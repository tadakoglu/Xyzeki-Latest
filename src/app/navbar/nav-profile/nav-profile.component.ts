import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { XyzekiAuthService } from 'src/app/model/auth-services/xyzeki-auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-profile',
  templateUrl: './nav-profile.component.html',
  styleUrls: ['./nav-profile.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class NavProfileComponent implements OnInit {

  constructor(private router: Router, public xyzekiAuthService: XyzekiAuthService) { }

  ngOnInit() {
  }
  deAuth(){
    this.xyzekiAuthService.DeAuth();
    this.router.navigate(['/'])
  }
  @Input() isLocked=false;

}
