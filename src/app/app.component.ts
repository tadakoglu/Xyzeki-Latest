import { Component, OnInit, AfterViewInit, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { XyzekiAuthService } from './model/auth-services/xyzeki-auth-service';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from 'src/infrastructure/custom-NgbDate-parser-formatter';
import { MembersService } from './model/services/members.service';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { SwitchHourDataService } from './model/services/shared/switch-hour-data.service';
import { DataService } from './model/services/shared/data.service';
import { isNullOrUndefined } from 'util';
import { SwPush, ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { AuthService } from './model/services/auth.service';
import { CryptoHelpers } from 'src/infrastructure/cryptoHelpers';
import { XyzekiAuthHelpersService } from './model/auth-services/xyzeki-auth-helpers-service';


export const customNgbPFProvider = () => { return new CustomNgbDateParserFormatter(); };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [{
    provide: NgbDateParserFormatter,
    useFactory: customNgbPFProvider
  }]
})

export class AppComponent implements OnInit, AfterViewInit {
  constructor(public xyzekiAuthService: XyzekiAuthService, public xyzekiAuthHelpersService: XyzekiAuthHelpersService, private router: Router, private switchHourDataService: SwitchHourDataService, public dataService: DataService) { // Initialize our member.

    this.loading = true;
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.xyzekiAuthHelpersService.AuthAutoIfPossible(); // If a valid token found in local storage, load it and authenticate automatically.
   
  }

  title = 'Xyzeki İş Yönetimi Çözümleri';
  public innerWidth: any;
  public innerHeight: any;

  @HostListener('window:resize', ['$event']) // respond to browser resizing
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
  }

  ngOnInit(): void {

    this.switchHourDataService.setupStyle.subscribe((c: { Left, Top, Visibility, isOpen }) => {
      this.switchHourStyle.Left = c.Left
      this.switchHourStyle.Top = c.Top
      this.switchHourStyle.Visibility = c.Visibility
      this.switchHourStyle.isOpen = c.isOpen
    })
    this.dataService.signalConnectionSeconds.subscribe(seconds => {
      this.secondsLeft = seconds;
      clearInterval(this.intervalId); // Always restart
      if (isNullOrUndefined(seconds)) {
        return;
      }
      this.intervalId = setInterval(() => {
        this.secondsLeft = this.secondsLeft - 1;
        if (this.secondsLeft === 0)
          clearInterval(this.intervalId)
      }, 1000)

    })

  }
  private intervalId;
  switchHourStyle = { Left: '0px', Top: '0px', Visibility: 'hidden', isOpen: false }

  public secondsLeft: number

  startConnectionNow() {

    this.dataService.startSignalConnection.next();
  }

  @Input()
  loading = true;
  ngAfterViewInit() {

    this.router.events.subscribe((event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.loading = true;
          break;
        }

        case event instanceof NavigationEnd:
        case event instanceof NavigationCancel:
        case event instanceof NavigationError: {
          this.loading = false;


          break;
        }
        default: {
          break;
        }
      }
    });


    // this.testFonk();


  }
  // testFonk(){
  //   var brands = [];
  //   getLikedBrands(1).then(res => {
  //     brands = res as []
  //   })
  // }

}


// function getLikedBrands(userID) {
//   const promise = new Promise((resolve, reject) => {
//     resolve(['x markası', 'y markası']);
//   });
//   return promise;
// }




