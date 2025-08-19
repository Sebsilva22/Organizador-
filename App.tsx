import React, { useState, useEffect, useCallback } from 'react';
import { Task, Meeting, Priority, AssignedTo, Status, LinkItem, View, Project } from './types';
import { MeetingScheduler } from './components/MeetingScheduler';
import { AddEditMeetingModal } from './components/AddEditMeetingModal';
import { Sidebar } from './components/Sidebar';
import { TaskEditorForm } from './components/TaskEditorForm';
import { TaskTabs } from './components/TaskTabs';
import { LinksManager } from './components/LinksManager';
import { ProjectEditorForm } from './components/ProjectEditorForm';
import { ProjectTabs } from './components/ProjectTabs';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      if (!savedTasks) return [];
      const parsedTasks: (Omit<Task, 'assignedTo' | 'status'> & { assignedTo?: AssignedTo | AssignedTo[], status?: Status, isCompleted?: boolean })[] = JSON.parse(savedTasks);
      
      return parsedTasks.map(task => {
        let assignedToArray = Array.isArray(task.assignedTo)
          ? task.assignedTo
          : (task.assignedTo ? [task.assignedTo] : [AssignedTo.General]);

        // Filter out any invalid assignments that might exist in old data
        assignedToArray = assignedToArray.filter(a => Object.values(AssignedTo).includes(a));
        if (assignedToArray.length === 0) {
            assignedToArray = [AssignedTo.General];
        }

        const migratedTask = {
          ...task,
          id: task.id || Date.now().toString(),
          priority: task.priority || Priority.Medium,
          assignedTo: assignedToArray,
          status: task.status || (task.isCompleted ? Status.Completed : Status.Pending),
          projectId: task.projectId,
        };
        delete (migratedTask as any).isCompleted;
        return migratedTask;
      });
    } catch (error) {
      console.error("Could not parse tasks from localStorage", error);
      return [];
    }
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const savedMeetings = localStorage.getItem('meetings');
      return savedMeetings ? JSON.parse(savedMeetings) : [];
    } catch (error) {
      console.error("Could not parse meetings from localStorage", error);
      return [];
    }
  });
  
  const [links, setLinks] = useState<LinkItem[]>(() => {
    try {
      const savedLinks = localStorage.getItem('links');
      return savedLinks ? JSON.parse(savedLinks) : [];
    } catch (error) {
      console.error("Could not parse links from localStorage", error);
      return [];
    }
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem('projects');
      if (!savedProjects) return [];
      const parsedProjects: Project[] = JSON.parse(savedProjects);
      return parsedProjects.map(p => {
         let assignedToArray = p.assignedTo || [AssignedTo.General];
         assignedToArray = assignedToArray.filter(a => Object.values(AssignedTo).includes(a));
         if (assignedToArray.length === 0) {
            assignedToArray = [AssignedTo.General];
         }
        return {
          ...p,
          assignedTo: assignedToArray
        };
      });
    } catch (error) {
      console.error("Could not parse projects from localStorage", error);
      return [];
    }
  });

  const [activeView, setActiveView] = useState<View>('tasks');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [newMeetingDate, setNewMeetingDate] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Could not save tasks to localStorage", error);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('meetings', JSON.stringify(meetings));
    } catch (error) {
      console.error("Could not save meetings to localStorage", error);
    }
  }, [meetings]);

  useEffect(() => {
    try {
      localStorage.setItem('links', JSON.stringify(links));
    } catch (error) {
      console.error("Could not save links to localStorage", error);
    }
  }, [links]);

  useEffect(() => {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (error) {
      console.error("Could not save projects to localStorage", error);
    }
  }, [projects]);


  const handleSetEditingTask = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);
  
  const handleClearEditingTask = useCallback(() => {
    setEditingTask(null);
  }, []);

  const handleSetEditingProject = useCallback((project: Project) => {
    setEditingProject(project);
  }, []);

  const handleClearEditingProject = useCallback(() => {
    setEditingProject(null);
  }, []);


  const handleOpenAddMeetingModal = useCallback((date?: string) => {
    setEditingMeeting(null);
    setNewMeetingDate(date || new Date().toISOString().split('T')[0]);
    setIsMeetingModalOpen(true);
  }, []);

  const handleOpenEditMeetingModal = useCallback((meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsMeetingModalOpen(true);
  }, []);
  
  const handleCloseMeetingModal = useCallback(() => {
    setIsMeetingModalOpen(false);
    setEditingMeeting(null);
    setNewMeetingDate(null);
  }, []);

  const handleSaveTask = useCallback((taskData: Omit<Task, 'id' | 'status'>, id: string | null) => {
    if (id) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...taskData, id } : t));
    } else {
      setTasks(prev => [...prev, { ...taskData, id: Date.now().toString(), status: Status.Pending }]);
    }
    setEditingTask(null);
  }, []);

  const handleSaveMeeting = useCallback((meeting: Omit<Meeting, 'id'>) => {
    if (editingMeeting) {
      setMeetings(prev => prev.map(m => m.id === editingMeeting.id ? { ...editingMeeting, ...meeting } : m));
    } else {
      setMeetings(prev => [...prev, { ...meeting, id: Date.now().toString() }]);
    }
    handleCloseMeetingModal();
  }, [editingMeeting, handleCloseMeetingModal]);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const handleDeleteMeeting = useCallback((meetingId: string) => {
    setMeetings(prev => prev.filter(m => m.id !== meetingId));
  }, []);
  
  const handleUpdateTaskStatus = useCallback((taskId: string, status: Status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  }, []);

  const handleSaveLink = useCallback((linkData: Omit<LinkItem, 'id'>) => {
    setLinks(prev => [...prev, { ...linkData, id: Date.now().toString() }]);
  }, []);

  const handleDeleteLink = useCallback((linkId: string) => {
    setLinks(prev => prev.filter(l => l.id !== linkId));
  }, []);

  const handleSaveProject = useCallback((projectData: Omit<Project, 'id'>, id: string | null) => {
    if (id) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...projectData, id } : p));
    } else {
      setProjects(prev => [...prev, { ...projectData, id: Date.now().toString() }]);
    }
    setEditingProject(null);
  }, []);

  const handleDeleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.map(t => t.projectId === projectId ? {...t, projectId: undefined} : t));
  }, []);

  return (
    <div className="flex h-screen bg-sky-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'tasks' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-0 overflow-hidden">
            {/* Editor Panel */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-800 p-4 sm:p-6 overflow-y-auto">
              <TaskEditorForm
                key={editingTask?.id || 'new-task'}
                task={editingTask}
                projects={projects}
                onSave={handleSaveTask}
                onCancelEdit={handleClearEditingTask}
              />
            </div>

            {/* Task Board */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col overflow-hidden bg-sky-50 dark:bg-slate-900">
              <TaskTabs
                tasks={tasks}
                projects={projects}
                onEditTask={handleSetEditingTask}
                onDeleteTask={handleDeleteTask}
                onUpdateStatus={handleUpdateTaskStatus}
              />
            </div>
          </div>
        )}
        {activeView === 'meetings' && (
          <MeetingScheduler
            meetings={meetings}
            onAddMeeting={handleOpenAddMeetingModal}
            onEditMeeting={handleOpenEditMeetingModal}
            onDeleteMeeting={handleDeleteMeeting}
          />
        )}
        {activeView === 'links' && (
           <LinksManager
                links={links}
                onSave={handleSaveLink}
                onDelete={handleDeleteLink}
            />
        )}
        {activeView === 'projects' && (
           <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 gap-0 overflow-hidden">
            <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-800 p-4 sm:p-6 overflow-y-auto">
                <ProjectEditorForm
                    key={editingProject?.id || 'new-project'}
                    project={editingProject}
                    onSave={handleSaveProject}
                    onCancelEdit={handleClearEditingProject}
                />
            </div>
             <div className="lg:col-span-6 xl:col-span-7 flex flex-col overflow-hidden bg-sky-50 dark:bg-slate-900">
                <ProjectTabs
                    projects={projects}
                    tasks={tasks}
                    onEditProject={handleSetEditingProject}
                    onDeleteProject={handleDeleteProject}
                />
             </div>
           </div>
        )}
      </main>

      {isMeetingModalOpen && (
        <AddEditMeetingModal
          isOpen={isMeetingModalOpen}
          onClose={handleCloseMeetingModal}
          onSave={handleSaveMeeting}
          meeting={editingMeeting}
          defaultDate={newMeetingDate}
        />
      )}
    </div>
  );
};

export default App;