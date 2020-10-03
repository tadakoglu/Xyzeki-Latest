import { Injectable } from '@angular/core';
import { MemberLicenseService } from '../services/member-license.service';
import { MemberLicense } from '../member-license.model';
import { IAdminRepository } from '../abstract/i-admin-repository';
import { isNullOrUndefined } from 'util';
import { DataService } from '../services/shared/data.service';


@Injectable()
export class AdminRepository implements IAdminRepository {
    constructor(private service: MemberLicenseService, private dataService: DataService) {

        this.dataService.loadAllRepositoriesEvent.subscribe(() => this.loadAllLicences());
        this.dataService.clearAllRepositoriesEvent.subscribe(() => this.clearAllLicences());


    }
    clearAllLicences() {
        this.allLicenses = []
    }
    loadAllLicences() {
        this.service.allLicenses().subscribe((lics) => {
            this.allLicenses = lics
        }
        );
    }

    private allLicenses: MemberLicense[] = []

    getAllLicenses(): MemberLicense[] {
        return this.allLicenses;
    }

    newLicense(memberLicense: MemberLicense) {
        if (isNullOrUndefined(memberLicense.LicenseId)) {
            this.service.newLicense(memberLicense).subscribe(licenseGuid => {
                memberLicense.LicenseId = licenseGuid;
                this.allLicenses.push(memberLicense);
            });
        }
    }

    deleteLicense(licenseId: string) {
        this.service.deleteLicense(licenseId).subscribe(license => {
            let index: number = this.allLicenses.findIndex(value => value.LicenseId == licenseId)
            if (-1 != index)
                this.allLicenses.splice(index, 1);
        })
    }


}
