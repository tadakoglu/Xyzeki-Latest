using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using XYZToDo.Infrastructure;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.DatabasePersistanceLayer;
using XYZToDo.Models.ViewModels;

namespace XYZToDo.Models.Repository
{
    public class ProjectRepository : IProjectRepository
    {
        XYZToDoSQLDbContext context;
        public ProjectRepository(XYZToDoSQLDbContext context)
        {
            this.context = context;
        }

        public IQueryable<Project> Projects => context.Project;
        public Project[] GetProjects(string username) // Returns null or objects
        {
            return context.Project.Where(p => p.Owner == username).ToArray();
        }

        //1 = çocuğu olmayan baba görevleri bul( çocuğu olmayan tüm zindex=0'lar)
        //2 = çocuğu olan baba görevlerin çocuklarını bul(ya da tüm zindex=1 lerin bulunması anlamına geliyor.)
        public float GetProjectCompletionRate(long projectId)
        {
            //tamamından çocuğu olan baba görevleri çıkar
            ProjectTask[] all = context.ProjectTask.Where(pt => pt.ProjectId == projectId).ToArray();
            ProjectTask[] allWithout = all.Where(pt =>
            {
                int nextIndex = (int)pt.Order + 1;
                ProjectTask nextPT = all.Where(pt2 => pt2.Order == nextIndex).FirstOrDefault();
                if (pt.Zindex == 0 && nextIndex <= all.Length - 1 && nextPT?.Zindex == 1)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }).ToArray();

            ProjectTask[] result = all.Except(allWithout).ToArray();

            int resultInt = result.Select(pt =>
            {
                 if (pt.Deadline.HasValue && pt.Start.HasValue)
                 {
                    //  int diff = (pt.Deadline - pt.Start).Value.Minutes;
                    //  return diff > 0 ? diff : 0;
                     int diff = (int)pt.Deadline.Value.Subtract(pt.Start.Value).TotalMinutes;
                     return diff > 0 ? diff : 0;
                 }
                 else
                 {
                     return 0;
                 }
            }).Sum();

            ProjectTask[] resultCompleted = result.Where(pt => pt.IsCompleted == true).ToArray();

            int resultCompletedInt = resultCompleted.Select(pt =>
             {
                
                 if (pt.Deadline.HasValue && pt.Start.HasValue)
                 {
                    //  int diff = (pt.Deadline - pt.Start).Value.Minutes;
                    //  return diff > 0 ? diff : 0;
                     int diff = (int)pt.Deadline.Value.Subtract(pt.Start.Value).TotalMinutes;
                     return diff > 0 ? diff : 0;
                 }
                 else
                 {
                     return 0;
                 }
             }).Sum();

            float completionRate = resultInt == 0 ? 0 : (100 * resultCompletedInt / resultInt);

            return completionRate;

          
        }
        public bool isMyProjectGuard(long projectId, string thisMember)
        {
            Project project = Projects.Where(p => p.ProjectId == projectId).FirstOrDefault();
            if (project == null)
                return false;
            if (project.Owner == thisMember)
                return true;
            else
                return false;
        }

        public bool isProjectAssignedGuard(long projectId, string thisMember)
        {
            Project p1 = context.ProjectTask.Where(pt => pt.AssignedTo == thisMember).Select(pt => pt.Project).Where(p => p.Owner != thisMember).
                        Where(p => p.Privacy != (int)PrivacyModes.onlyOwner &&
                         (p.Privacy == (int)PrivacyModes.open
                         || p.Privacy == (int)PrivacyModes.listMode
                         || (p.Privacy == (int)PrivacyModes.onlyOwnerAndPM && p.ProjectManager == thisMember)
                         || (p.Privacy == (int)PrivacyModes.openOnlyTasks && p.ProjectManager == thisMember))).Where(p => p.ProjectId == projectId).FirstOrDefault();

            if (p1 != null)
                return true;

            Project p2 = this.Projects.Where(p => p.ProjectManager == thisMember && p.Owner != thisMember).
                        Where(p => p.Privacy != (int)PrivacyModes.onlyOwner &&
                           (p.Privacy == (int)PrivacyModes.open
                           || p.Privacy == (int)PrivacyModes.listMode
                           || (p.Privacy == (int)PrivacyModes.onlyOwnerAndPM && p.ProjectManager == thisMember)
                           || (p.Privacy == (int)PrivacyModes.openOnlyTasks && p.ProjectManager == thisMember))).Where(p => p.ProjectId == projectId).FirstOrDefault();

            if (p2 != null)
                return true;



            return false;
        }

        public bool isShareholder(long projectId, string username)
        {
            //Find shareholders of the project
            string projectManager = this.Projects.Where(p => p.ProjectId == projectId).Select(p => p.ProjectManager).FirstOrDefault();
            string[] shareholders = this.Projects.Where(p => p.ProjectId == projectId).SelectMany(p => p.ProjectTask).Select(pt => pt.AssignedTo).ToArray();

            List<string> all = new List<string>();
            all.Add(projectManager);
            all.AddRange(shareholders);
            string[] allUnique = all.GroupBy(str => str).Select(str => str.First()).ToArray();

            string result = allUnique.Where(sh => sh == username).FirstOrDefault();

            bool isSH = (result != null && result.Length > 0) ? true : false;
            return isSH;
        }
        public Project[] GetProjectsAssigned(string username)
        {
            // modes: onlyOwner, onlyOwnerAndPM, openOnlyTasks, open
            // !onlyOwner 
            Project[] p1 = this.Projects.Where(p => p.ProjectManager == username && p.Owner != username).ToArray();
            Project[] p2 = context.ProjectTask.Where(pt => pt.AssignedTo == username).Select(pt => pt.Project).Where(p => p.Owner != username).ToArray();
            return p1?.Concat(p2)?.GroupBy(p => p.ProjectId).Select(p => p.First()).ToArray();

            //open(0) listMode(1)  openOnlyTasks(2) onlyOwnerAndPM(3) onlyOwner(4)
            //  enum PrivacyModes {
            //     open = 0,
            //     listMode = 1,
            //     openOnlyTasks = 2,
            //     onlyOwnerAndPM = 3,
            //     onlyOwner = 4,
            // }
        }

        public Project FindProject(long projectId) // Returns null or object
        {
            return context.Project.Where(p => p.ProjectId == projectId).FirstOrDefault();
        }

        public ReturnModel NewProject(Project project) // Return -1 for any errors otherwise ProjectId
        {
            //Implement ModelState in Controller action methods.
            try
            {
                context.Project.Add(project);
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }

            return new ReturnModel { ErrorCode = ErrorCodes.OK, ReturnedId = project.ProjectId }; // Provides ProjectID(identity autoset from db)
        }
        // try
        // {
        //     // long lastIndex = GetProjects(project.Owner).Select(proj => proj.Order).Max() ?? 0;
        //     // // quickTask.Order = quickTask.TaskId;
        //     // project.Order = ++lastIndex;
        //     // project.Order = project.ProjectId;
        //     context.Entry(project).State = EntityState.Modified;
        //     context.SaveChanges();
        // }
        // catch { }

        public ReturnModel UpdateProject(Project project)
        {
            if (project.ProjectId == 0)
                return new ReturnModel { ErrorCode = ErrorCodes.ItemNotFoundError };
            try
            {
                // if (project.Order == null)
                // {
                //     long lastIndex = GetProjects(project.Owner).Select(proj => proj.Order).Max() ?? 0;
                //     // quickTask.Order = quickTask.TaskId;
                //     project.Order = ++lastIndex;
                // }

                context.Entry(project).State = EntityState.Modified;
                context.SaveChanges();
            }
            catch { return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError }; }
            return new ReturnModel { ErrorCode = ErrorCodes.OK };
        }
        public Project DeleteProject(long projectId) // Return null for any errors otherwise Project
        {
            Project project = context.Project.Where(p => p.ProjectId == projectId).FirstOrDefault();
            if (project != null)
            {
                context.Project.Remove(project);
                context.SaveChanges();
            }
            return project; // This is to inform user.

        }

        public ReturnModel SaveAllPOMs(ProjectOrderModel[] POMs)
        {
            try
            {
                Project project = null;
                foreach (var POM in POMs)
                {
                    project = Projects.Where(p => p.ProjectId == POM.ProjectId).FirstOrDefault();
                    if (project == null)
                        continue;

                    project.Order = POM.Order;
                    context.Entry(project).State = EntityState.Modified;
                }
                context.SaveChanges();
                return new ReturnModel { ErrorCode = ErrorCodes.OK };
            }
            catch (System.Exception)
            {
                return new ReturnModel { ErrorCode = ErrorCodes.DatabaseError };
            }
        }


    }
}
