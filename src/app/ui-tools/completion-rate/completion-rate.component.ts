import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ProjectsService } from 'src/app/model/services/projects.service';

@Component({
  selector: 'app-completion-rate',
  templateUrl: './completion-rate.component.html',
  styleUrls: ['./completion-rate.component.css']
})
export class CompletionRateComponent implements OnInit, OnChanges {

  constructor(private projectService: ProjectsService) { }

  ngOnInit() {
  }

  @Input()
  projectId

  // loaded=false;
  // @Input()
  // public set setProjectId(projectId: number) {
  //   this.projectId = projectId;
  //   if(this.projectId){
  //     this.loaded = true;
  //     console.log('load')
  //   }
  // }
  completionRate = 0

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'projectId': {
            this.projectService.getProjectCompletionRate(this.projectId).subscribe(rate => {
              this.completionRate = rate;
            })
          }
        }
      }
    }
  }


  get getCompletionRate(): number {
    return parseInt(this.completionRate.toFixed());
  }

  get getNumerator(): number { // x
    return parseInt(this.completionRate.toFixed());
  }
  get getDenominator(): number {
    return 100 - parseInt(this.completionRate.toFixed());
  }
  

}
