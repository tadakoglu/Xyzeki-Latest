import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { XyzekiAuthService } from 'src/app/model/auth-services/xyzeki-auth-service';
import { MemberLicense } from 'src/app/model/member-license.model';
import { AdminRepository } from 'src/app/model/repository/admin-repository';

@Component({
  selector: 'app-license-management',
  templateUrl: './license-management.component.html',
  styleUrls: ['./license-management.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class LicenseManagementComponent {

  constructor(private repository: AdminRepository, public xyzekiAuthService: XyzekiAuthService) { }

  get allLicenses(): MemberLicense[] {
    return this.repository.getAllLicenses();
  }

  modelSent: boolean = false;
  modelSubmitted: boolean = false; // That's for validation method

  public licenseModel: MemberLicense = new MemberLicense(null, null, null, null, null, null, null, null, null, null, null, null);
  addLicense(licenseForm: NgForm) {
    this.modelSubmitted = true;
    if (licenseForm.valid) {
      this.repository.newLicense(this.licenseModel);
      this.modelSent = true;
      this.modelSubmitted = false;
    }
  }
  deleteLicense(licenseId) {
    this.repository.deleteLicense(licenseId);
  }

  newLicensePanelOpen: boolean = false;
  toggleNewLicensePanel() {
    if (this.newLicensePanelOpen == false) {
      this.newLicensePanelOpen = true;
      this.licenseModel = new MemberLicense(null, null, null, null, null, null, null, null, null, null, null, null);

    }
    else {
      this.newLicensePanelOpen = false;
    }
  }

  startDate: NgbDateStruct = null
  endDate: NgbDateStruct = null;

  //Important Note: Validate date model format in UI with regex, because NgbDateStruct value can be 'f',1993, 22 only, because it fires on change event.

  onSelectStartDate(date: NgbDateStruct) {
    if (date != null) {
      this.startDate = date;
      let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
      let day: string = date.day < 10 ? '0' + date.day : date.day.toString()
      this.licenseModel.StartDate = `${date.year}-${month}-${day}` + `T00:00+0300`
    }
  }
  onSelectEndDate(date: NgbDateStruct) {
    if (date != null) {
      this.endDate = date;
      let month: string = date.month < 10 ? '0' + date.month : date.month.toString()
      let day: string = date.day < 10 ? '0' + date.day : date.day.toString()
      this.licenseModel.EndDate = `${date.year}-${month}-${day}` + `T00:00+0300`
    }
  }
}
