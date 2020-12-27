import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyPrivateTalksComponent } from './my-private-talks/my-private-talks.component';
import { PrivateTalkMessagesComponent } from './private-talk-messages/private-talk-messages.component';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarModule } from '../navbar/navbar.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PipesModule } from 'src/infrastructure/pipes/pipes.module';
import { UiToolsModule } from '../ui-tools/ui-tools.module';
import { ReceiversComponent } from './receivers/receivers.component';
import { LiAnimateDirective } from './_directives/li-animate.directive';
import { ShowDirective } from './_directives/show.directive';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { EditReceiversComponent } from './edit-receivers/edit-receivers.component';

import { MatChipsModule, MatFormFieldModule, MatIconModule, MatAutocompleteModule } from '@angular/material';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { PrivateTalksComponent } from './private-talks/private-talks.component';



@NgModule({
  declarations: [LiAnimateDirective, MyPrivateTalksComponent, PrivateTalkMessagesComponent,
    ReceiversComponent, EditReceiversComponent, ShowDirective, PrivateTalksComponent],
  imports: [
    CommonModule, FormsModule, NgbModule, NavbarModule, InfiniteScrollModule, PipesModule, UiToolsModule,
    MatChipsModule, MatFormFieldModule, MatIconModule, MatAutocompleteModule, ReactiveFormsModule, PickerModule,
    RouterModule
  ],
  exports: [PrivateTalksComponent, MyPrivateTalksComponent, PrivateTalkMessagesComponent, EditReceiversComponent],

})
export class PrivateTalkModule { }
