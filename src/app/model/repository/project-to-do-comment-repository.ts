import { Injectable } from '@angular/core';
import { concatMap } from 'rxjs/operators';
import { XyzekiSignalrService } from 'src/app/model/signalr-services/xyzeki-signalr.service';
import { IProjectToDoCommentRepository } from '../abstract/i-project-to-do-comment-repository';
import { ProjectTaskComment } from '../project-task-comment.model';
import { ProjectToDoCommentsService } from '../services/project-to-do-comments.service';
import { DataService } from '../services/shared/data.service';


@Injectable()
export class ProjectToDoCommentRepository implements IProjectToDoCommentRepository {

    constructor(private service: ProjectToDoCommentsService,
         private dataService: DataService,
        private signalService: XyzekiSignalrService) {
        this.signalService.newProjectToDoCommentAvailable.subscribe(ptComment => {
            this.savePTCommentViaSignalR(ptComment[0]);
        })
        this.signalService.deletedProjectToDoCommentAvailable.subscribe(ptComment => {
            this.deletePTCommentViaSignalR(ptComment);
        })

        this.dataService.clearAllRepositoriesEvent.subscribe(() => { this.clearPTComments() })

    }
    clearPTComments(){
        this.taskId = undefined;
        this.projectToDoComments =[]
    }

    private taskId: number
    loadComments(taskId: number) {
        this.taskId = taskId;
        this.service.projectTaskComments(taskId).subscribe(ptComments => {
            this.projectToDoComments = ptComments
        });
    }

    private projectToDoComments: ProjectTaskComment[] = []

    getProjectToDoComments(): ProjectTaskComment[] {
        return this.projectToDoComments;
    }

    saveProjectToDoComment(projectToDoComment: ProjectTaskComment) {
        if (projectToDoComment.MessageId == 0 || projectToDoComment.MessageId == null) {
            projectToDoComment.DateTimeSent = new Date().toISOString();
            this.service.saveProjectTaskComment(projectToDoComment).subscribe(messageId => {
                projectToDoComment.MessageId = messageId;
                this.projectToDoComments.push(projectToDoComment);
                //Signalling via SignalR                
                this.signalService.notifyProjectToDoComment(projectToDoComment, 'new');
            });


        }
        else {
            // There will not be update mechanism for comments for now.
            this.service.updateProjectTaskComment(projectToDoComment).subscribe(() => {
                let index = this.projectToDoComments.findIndex(value => value.TaskId == projectToDoComment.MessageId)
                if (index != -1)
                    this.projectToDoComments.splice(index, 1, projectToDoComment);

                this.signalService.notifyProjectToDoComment(projectToDoComment, 'update');
            })
        }
    }
    deleteProjectToDoComment(messageId: number) {
        this.service.deleteProjectTaskComment(messageId).subscribe(ptComment => {
            let index: number = this.projectToDoComments.findIndex(value => value.MessageId == ptComment.MessageId);
            this.projectToDoComments.splice(index, 1);
            this.signalService.notifyDeletedProjectToDoComment(ptComment)
        })
    }


    savePTCommentViaSignalR(projectTaskComment: ProjectTaskComment) {
        if (projectTaskComment.TaskId != this.taskId)
            return;
        let index = this.projectToDoComments.findIndex(val => val.MessageId == projectTaskComment.MessageId)
        if (-1 == index) // Not founded on repository
        {
            this.projectToDoComments.push(projectTaskComment);
        }
        else { // Founded on repository, just changes with what's sent( update mechanism)
            this.projectToDoComments.splice(index, 1, projectTaskComment); //change appearance     
        }

    }
    deletePTCommentViaSignalR(projectTaskComment: ProjectTaskComment) {
        let index: number = this.projectToDoComments.findIndex(value => value.MessageId == projectTaskComment.MessageId)
        if (-1 != index)
            this.projectToDoComments.splice(index, 1);
    }
   

}