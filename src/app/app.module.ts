import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TeamModule } from './team/team.module';
import { HomeModule } from './home/home.module';
import { ProjectModule } from './project/project.module';
import { ModelModule } from './model/model.module'; // Inject repositories(with services)
import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import { AuthModule } from './auth/auth.module';
import { MemberModule } from './member/member.module';
import { UiToolsModule } from './ui-tools/ui-tools.module';
import { PrivateTalkModule } from './private-talk/private-talk.module';
import { AdminModule } from './admin/admin.module';
import { FilesModule } from './files/files.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { XyzekiRefreshTokenInterceptor } from './model/interceptors/xyzeki-refresh-token-interceptor';
import { TokenInterceptor } from './model/interceptors/token-inceptor';
import { NavbarModule } from './navbar/navbar.module';
import { MatIconModule } from '@angular/material';



registerLocaleData(localeTr);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule, /*includes CommonModule*/
    BrowserAnimationsModule,
    AppRoutingModule,
    ModelModule, UiToolsModule, AuthModule, MemberModule, HomeModule, 
    TeamModule, ProjectModule, PrivateTalkModule, FilesModule,
    AdminModule, DragDropModule,
    NavbarModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'tr-TR' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: XyzekiRefreshTokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],

})
export class AppModule {

}


// {
//   provide: HTTP_INTERCEPTORS,
//   useClass: CustomInterceptor ,
//   multi: true
// }