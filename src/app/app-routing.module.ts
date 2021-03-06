import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { TeamsComponent } from './team/teams/teams.component';
import { MyTeamsComponent } from './team/teams/my-teams/my-teams.component';
import { ProjectsComponent } from './project/projects/projects.component';
import { MyProjectsComponent } from './project/projects/my-projects/my-projects.component';
import { HomeComponent } from './home/home/home.component';
import { TeamMembersComponent } from './team/teams/team-members/team-members.component';
import { MyToDosComponent } from './home/my-to-dos/my-to-dos.component';
import { AuthGuardService } from './model/services/guards/auth-guard.service';
import { MemberLicensesComponent } from './member/member-licenses/member-licenses.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { IncomingInvitationsComponent } from './team/teams/incoming-invitations/incoming-invitations.component';
import { SettingsComponent } from './member/settings/settings.component';
import { MyPrivateTalksComponent } from './private-talk/my-private-talks/my-private-talks.component';
import { SaveLastSeenGuardService } from './model/services/guards/save-last-seen-guard.service';
import { LicenseManagementComponent } from './admin/license-management/license-management.component';
import { AuthGuardAdminService } from './model/services/guards/auth-guard-admin.service';
import { FilesComponent } from './files/files/files.component';
import { FilesStatisticsComponent } from './files/files/files-statistics/files-statistics.component';
import { ProjectToDosComponent } from './project/projects/project-to-dos/project-to-dos.component';
import { IForgotPasswordComponent } from './auth/i-forgot-password/i-forgot-password.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { MyTeamsResolverService } from './model/resolvers/my-teams-resolver.service';
import { TeamMemberResolverService } from './model/resolvers/team-member-resolver.service';
import { MyProjectsResolverService } from './model/resolvers/my-projects-resolver.service';
import { ProjectToDosResolverService } from './model/resolvers/project-to-dos-resolver.service';
import { ProjectsAssignedResolverService } from './model/resolvers/projects-assigned-resolver.service';
import { ProjectToDosCommentsCountResolverService } from './model/resolvers/project-to-dos-comments-count-resolver.service';
import { ContainersResolverService } from './model/resolvers/containers-resolver.service';
import { AboutComponent } from './member/about/about.component';
import { AlreadyLoggedInGuardService } from './model/services/guards/already-logged-in-guard.service';
import { LoadToMemoryService } from './model/services/guards/load-to-memory.service';
import { PrivateTalksComponent } from './private-talk/private-talks/private-talks.component';
import { PrivateTalkMessagesComponent } from './private-talk/private-talk-messages/private-talk-messages.component';
import { BlobsComponent } from './files/files/blobs/blobs.component';
import { BlobsResolverService } from './model/resolvers/blobs-resolver.service';
import { ContainersComponent } from './files/files/containers/containers.component';

//#todo protect routes with guards(block login and register for authenticated user)
export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent, canActivate: [LoadToMemoryService] }, // #todo: Develop a 'Is Logged in' mechanism in HomeComponent, and if the member were Logged In, redirect to his/her projects.
  { path: 'isler', pathMatch: 'full', component: MyToDosComponent, canActivate: [AuthGuardService] },
  { path: 'giris', component: LoginComponent, canActivate: [AlreadyLoggedInGuardService] }, // /login 
  { path: 'kayit-ol', component: RegisterComponent, canActivate: [AlreadyLoggedInGuardService], data: { kind: 'register' }, }, // /register

  { path: 'sifremi-unuttum', component: IForgotPasswordComponent },
  { path: 'sifre-degistir/guvenlik-kodu/:SecurityCode', component: ChangePasswordComponent },
  { path: 'hakkinda', component: AboutComponent },// /my-settings

  { path: 'hesap', component: RegisterComponent, canActivate: [AuthGuardService], data: { kind: 'update' }, }, // /my-account
  { path: 'ayarlar', component: SettingsComponent, canActivate: [AuthGuardService] },// /my-settings
  { path: 'lisanslar', component: MemberLicensesComponent, canActivate: [AuthGuardService] },
  {
    path: 'takimlar', component: TeamsComponent, canActivate: [AuthGuardService], children: [ // /teams, that is enough to export in feature modules
      {
        path: '', component: MyTeamsComponent, resolve: { myTeams: MyTeamsResolverService },
        children: [{ path: ':TeamId/takim-uyeleri', component: TeamMembersComponent, resolve: { teamMembers: TeamMemberResolverService }, data: { kind: 'full-access' }, pathMatch: 'full', }]
      }, // /teams/my-teams    //  / teams/my-teams/1/team-members
      {
        path: 'gelen-takim-davetiyeleri', component: IncomingInvitationsComponent,
        children: [{ path: ':TeamId/takim-uyeleri', component: TeamMembersComponent, data: { kind: 'limited' }, pathMatch: 'full' }]
      }
    ]
  },
  {
    path: 'projeler', component: ProjectsComponent, canActivate: [AuthGuardService], children: [ //projects, that is enough to export in feature modules
      { path: '', pathMatch: 'prefix', component: MyProjectsComponent, resolve: { myProjects: MyProjectsResolverService, projectsAssigned: ProjectsAssignedResolverService } },
      { path: ':ProjectId/yapilacaklar', pathMatch: 'full', component: ProjectToDosComponent, resolve: { projectToDos: ProjectToDosResolverService, ptCommentsCount: ProjectToDosCommentsCountResolverService } },
    ]
  },
  {
    path: 'is-konusmalari', component: PrivateTalksComponent, canActivate: [AuthGuardService], children: [
      { path: '', pathMatch: 'prefix', component: MyPrivateTalksComponent },
      { path: ':PrivateTalkId/sohbet', pathMatch: 'full', component: PrivateTalkMessagesComponent, canActivate: [AuthGuardService] },
    ]
  },

  {
    path: 'dosyalar', component: FilesComponent, canActivate: [AuthGuardService],
    children: [
      { path: '', pathMatch: 'prefix', component: ContainersComponent, resolve: { containers: ContainersResolverService } },
      { path: ':ContainerName', pathMatch: 'full', component: BlobsComponent, resolve: { containerBlobs: BlobsResolverService } },
      { path: 'bilgi/istatistikler', pathMatch: 'full', component: FilesStatisticsComponent }]
  },
  {
    path: 'admin/license-management', component: LicenseManagementComponent, canActivate: [AuthGuardAdminService]
  },
  { path: '**', pathMatch: 'full', redirectTo: '/' } // Delete all path(absolute) and redirect to root(or use a 404notfoundcomponent)
];
//Use path match as 'full' in children paths. Don't use it on paths that include children..
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, initialNavigation: 'enabled', onSameUrlNavigation: 'ignore' })], // initial navigation enabled is in test
  exports: [RouterModule],
  providers: [AuthGuardService, AuthGuardAdminService, SaveLastSeenGuardService,
    MyTeamsResolverService, TeamMemberResolverService, MyProjectsResolverService, ProjectsAssignedResolverService, ProjectToDosResolverService, ProjectToDosCommentsCountResolverService,
    ContainersResolverService,
    BlobsResolverService]
})
export class AppRoutingModule { }
