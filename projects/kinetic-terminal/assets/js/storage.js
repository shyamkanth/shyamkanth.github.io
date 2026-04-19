// Enhanced Storage Module with Backup/Restore and Activity Logging
class Storage {
  constructor() {
    this.DB_NAME = "KineticTerminalDB";
    this.VERSION = "2.1.0";
    this.initDB();
  }

  initDB() {
    const stored = localStorage.getItem(this.DB_NAME);
    if (!stored) {
      this.createDefaultData();
    } else {
      // Migrate old data if needed
      const data = JSON.parse(stored);
      if (!data.version || data.version !== this.VERSION) {
        this.migrateData(data);
      }
    }
  }

  createDefaultData() {
    const defaultData = {
      version: this.VERSION,
      projects: [],
      tasks: [],
      settings: {
        theme: "dark",
        autoSaveInterval: 30,
        viewMode: "kanban",
        notifications: true,
      },
      activityLog: [],
      people: [
        { id: "person-1", name: "Me", email: "me@example.com" }
      ],
      metadata: {
        created: new Date().toISOString(),
        lastBackup: null,
        totalProjects: 0,
        totalTasks: 0,
      },
    };
    localStorage.setItem(this.DB_NAME, JSON.stringify(defaultData));
    this.logActivity("system", "Database initialized", "System setup complete");
  }

  migrateData(oldData) {
    const newData = {
      version: this.VERSION,
      projects: oldData.projects || [],
      tasks: oldData.tasks || [],
      settings: {
        theme: oldData.settings?.theme || "dark",
        autoSaveInterval: oldData.settings?.autoSaveInterval || 30,
        viewMode: oldData.settings?.viewMode || "kanban",
        notifications: true,
      },
      activityLog: oldData.activityLog || [],
      people: oldData.people || [
        { id: "person-1", name: "Me", email: "me@example.com" }
      ],
      metadata: {
        created: oldData.metadata?.created || new Date().toISOString(),
        lastBackup: oldData.metadata?.lastBackup || null,
        totalProjects: oldData.projects?.length || 0,
        totalTasks: oldData.tasks?.length || 0,
      },
    };
    localStorage.setItem(this.DB_NAME, JSON.stringify(newData));
    this.logActivity(
      "system",
      "Data migrated",
      `Migrated to version ${this.VERSION}`,
    );
  }

  getData() {
    const data = localStorage.getItem(this.DB_NAME);
    return data ? JSON.parse(data) : null;
  }

  setData(data) {
    data.metadata.lastModified = new Date().toISOString();
    localStorage.setItem(this.DB_NAME, JSON.stringify(data));
  }

  // Project Methods
  createProject(projectData) {
    const data = this.getData();
    const project = {
      id: this.generateId("PROJ"),
      key: projectData.key.toUpperCase(),
      name: projectData.name,
      description: projectData.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskCount: 0,
    };
    data.projects.push(project);
    data.metadata.totalProjects = data.projects.length;
    this.setData(data);
    this.logActivity(
      "create",
      "Project created",
      `Created project: ${project.name}`,
      project.id,
    );
    return project;
  }

  getProjects() {
    const data = this.getData();
    return data?.projects || [];
  }

  getProject(projectId) {
    const data = this.getData();
    return data?.projects.find((p) => p.id === projectId);
  }

  updateProject(projectId, updates) {
    const data = this.getData();
    const project = data.projects.find((p) => p.id === projectId);
    if (project) {
      const oldName = project.name;
      Object.assign(project, updates, {
        updatedAt: new Date().toISOString(),
      });
      this.setData(data);
      this.logActivity(
        "update",
        "Project updated",
        `Updated "${oldName}" to "${project.name}"`,
        projectId,
      );
    }
    return project;
  }

  deleteProject(projectId) {
    const data = this.getData();
    const project = data.projects.find((p) => p.id === projectId);
    if (project) {
      const tasksDeleted = data.tasks.filter(
        (t) => t.projectId === projectId,
      ).length;
      data.projects = data.projects.filter((p) => p.id !== projectId);
      data.tasks = data.tasks.filter((t) => t.projectId !== projectId);
      data.metadata.totalProjects = data.projects.length;
      data.metadata.totalTasks = data.tasks.length;
      this.setData(data);
      this.logActivity(
        "delete",
        "Project deleted",
        `Deleted project "${project.name}" and ${tasksDeleted} tasks`,
        projectId,
      );
    }
  }

  // Task Methods
  createTask(projectId, taskData) {
    const data = this.getData();
    const project = data.projects.find((p) => p.id === projectId);

    if (!project) {
      console.error("Project not found");
      return null;
    }

    const taskNumber =
      data.tasks.filter((t) => t.projectId === projectId).length + 1;
    const task = {
      id: `${project.key}-${taskNumber}`,
      projectId,
      title: taskData.title,
      description: taskData.description || "",
      type: taskData.type || "task",
      status: taskData.status || "todo",
      priority: taskData.priority || "medium",
      assignee: taskData.assignee || "",
      reporter: taskData.reporter || "Me",
      sprint: taskData.sprint || "",
      dueDate: taskData.dueDate || "",
      estimate: parseInt(taskData.estimate) || 0,
      tags: taskData.tags || [],
      dependency: taskData.dependency || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };

    data.tasks.push(task);

    // Update project task count
    project.taskCount = data.tasks.filter(
      (t) => t.projectId === projectId,
    ).length;
    data.metadata.totalTasks = data.tasks.length;

    this.setData(data);
    this.logActivity(
      "create",
      "Task created",
      `Created task: ${task.id} - ${task.title}`,
      task.id,
      task.projectId
    );
    return task;
  }

  getTasks(projectId) {
    const data = this.getData();
    return data?.tasks.filter((t) => t.projectId === projectId) || [];
  }

  getTask(taskId) {
    const data = this.getData();
    return data?.tasks.find((t) => t.id === taskId);
  }

  updateTask(taskId, updates) {
    const data = this.getData();
    const taskIndex = data.tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      console.error("Task not found:", taskId);
      return null;
    }

    const task = data.tasks[taskIndex];
    const oldStatus = task.status;

    // CRITICAL FIX: Update the task IN PLACE, don't create a new object
    Object.assign(task, updates, {
      updatedAt: new Date().toISOString(),
    });

    // Update the task in the array
    data.tasks[taskIndex] = task;

    this.setData(data);

    // Log different types of updates
    if (updates.status && updates.status !== oldStatus) {
      this.logActivity(
        "update",
        "Task status changed",
        `${task.id}: ${oldStatus} → ${updates.status}`,
        taskId,
        task.projectId
      );
    } else {
      this.logActivity("update", "Task updated", `Updated task: ${task.id}`, taskId, task.projectId);
    }
    return task;
  }

  addComment(taskId, commentContent) {
    const data = this.getData();
    const task = data.tasks.find((t) => t.id === taskId);

    if (!task) return null;

    if (!task.comments) task.comments = [];

    const comment = {
      id: Date.now().toString(),
      content: commentContent,
      author: "Me",
      createdAt: new Date().toISOString(),
    };

    task.comments.push(comment);
    task.updatedAt = new Date().toISOString();
    this.setData(data);

    this.logActivity(
      "comment",
      "Comment added",
      `Added comment to ${taskId}`,
      taskId,
      task.projectId
    );
    return comment;
  }

  deleteComment(taskId, commentId) {
    const data = this.getData();
    const task = data.tasks.find((t) => t.id === taskId);

    if (task && task.comments) {
      task.comments = task.comments.filter((c) => c.id !== commentId);
      task.updatedAt = new Date().toISOString();
      this.setData(data);
    }
  }

  getTask(taskId) {
    const data = this.getData();
    return data?.tasks.find((t) => t.id === taskId);
  }

  deleteTask(taskId) {
    const data = this.getData();
    const task = data.tasks.find((t) => t.id === taskId);

    if (task) {
      data.tasks = data.tasks.filter((t) => t.id !== taskId);
      data.metadata.totalTasks = data.tasks.length;
      this.setData(data);
      this.logActivity(
        "delete",
        "Task deleted",
        `Deleted task: ${taskId}`,
        taskId,
        task.projectId
      );
      return true;
    }
  }

  // People Methods
  getPeople() {
    const data = this.getData();
    return data?.people || [];
  }

  addPerson(personData) {
    const data = this.getData();
    const person = {
      id: this.generateId("PERSON"),
      name: personData.name,
      email: personData.email || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.people.push(person);
    this.setData(data);
    this.logActivity("create", "Person added", `Added person: ${person.name}`);
    return person;
  }

  updatePerson(personId, updates) {
    const data = this.getData();
    const person = data.people.find((p) => p.id === personId);
    if (person) {
      Object.assign(person, updates, {
        updatedAt: new Date().toISOString(),
      });
      this.setData(data);
      this.logActivity("update", "Person updated", `Updated person: ${person.name}`);
    }
    return person;
  }

  deletePerson(personId) {
    const data = this.getData();
    const person = data.people.find((p) => p.id === personId);
    if (person) {
      data.people = data.people.filter((p) => p.id !== personId);
      this.setData(data);
      this.logActivity("delete", "Person removed", `Removed person: ${person.name}`);
    }
  }

  // Activity Log Methods
  logActivity(type, action, description, entityId = null, projectId = null) {
    const data = this.getData();
    const activity = {
      id: this.generateId("ACT"),
      type, // create, update, delete, system
      action,
      description,
      entityId,
      projectId,
      timestamp: new Date().toISOString(),
    };

    data.activityLog = data.activityLog || [];
    data.activityLog.unshift(activity); // Add to beginning

    // Keep only last 500 activities
    if (data.activityLog.length > 500) {
      data.activityLog = data.activityLog.slice(0, 500);
    }

    this.setData(data);
    return activity;
  }

  getActivityLog(limit = 100, projectId = null) {
    const data = this.getData();
    let logs = data?.activityLog || [];
    
    if (projectId) {
      logs = logs.filter(l => l.projectId === projectId || l.type === "system");
    }
    
    return logs.slice(0, limit);
  }

  clearActivityLog() {
    const data = this.getData();
    data.activityLog = [];
    this.setData(data);
    this.logActivity(
      "system",
      "Activity log cleared",
      "All activity history was cleared",
    );
  }

  // Settings Methods
  getSetting(key) {
    const data = this.getData();
    return data?.settings[key];
  }

  setSetting(key, value) {
    const data = this.getData();
    data.settings[key] = value;
    this.setData(data);
    this.logActivity("update", "Setting changed", `${key} = ${value}`);
  }

  getSettings() {
    const data = this.getData();
    return data?.settings || {};
  }

  // Backup & Restore Methods
  exportAllData() {
    const data = this.getData();
    data.metadata.exportedAt = new Date().toISOString();
    data.metadata.exportedVersion = this.VERSION;

    this.logActivity("system", "Data exported", "Full database backup created");

    return {
      data: JSON.stringify(data, null, 2),
      filename: `kinetic-terminal-backup-${this.formatDateForFilename()}.json`,
    };
  }

  exportProject(projectId) {
    const data = this.getData();
    const project = data.projects.find((p) => p.id === projectId);

    if (!project) {
      return null;
    }

    const tasks = data.tasks.filter((t) => t.projectId === projectId);

    const exportData = {
      version: this.VERSION,
      exportType: "project",
      exportedAt: new Date().toISOString(),
      project,
      tasks,
    };

    this.logActivity(
      "system",
      "Project exported",
      `Exported project: ${project.name}`,
      projectId,
    );

    return {
      data: JSON.stringify(exportData, null, 2),
      filename: `${project.key}-backup-${this.formatDateForFilename()}.json`,
    };
  }

  importData(jsonString, replaceExisting = false) {
    try {
      const importedData = JSON.parse(jsonString);

      if (!importedData.version) {
        throw new Error("Invalid backup file format");
      }

      if (importedData.exportType === "project") {
        // Import single project
        return this.importProject(importedData, replaceExisting);
      } else {
        // Import full database
        return this.importFullDatabase(importedData, replaceExisting);
      }
    } catch (error) {
      console.error("Import failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  importProject(importedData, replaceExisting = false) {
    const data = this.getData();
    const { project, tasks } = importedData;

    // Check if project already exists
    const existingProject = data.projects.find((p) => p.key === project.key);

    if (existingProject && !replaceExisting) {
      return {
        success: false,
        error: `Project with key "${project.key}" already exists. Use replace mode to overwrite.`,
      };
    }

    if (existingProject && replaceExisting) {
      // Remove existing project and its tasks
      data.projects = data.projects.filter((p) => p.id !== existingProject.id);
      data.tasks = data.tasks.filter((t) => t.projectId !== existingProject.id);
    }

    // Generate new IDs
    const newProjectId = this.generateId("PROJ");
    const oldProjectId = project.id;
    project.id = newProjectId;
    project.importedAt = new Date().toISOString();

    data.projects.push(project);

    // Import tasks with new project ID
    tasks.forEach((task) => {
      task.projectId = newProjectId;
      task.importedAt = new Date().toISOString();
      data.tasks.push(task);
    });

    project.taskCount = tasks.length;
    data.metadata.totalProjects = data.projects.length;
    data.metadata.totalTasks = data.tasks.length;

    this.setData(data);
    this.logActivity(
      "system",
      "Project imported",
      `Imported project: ${project.name} with ${tasks.length} tasks`,
      newProjectId,
    );

    return {
      success: true,
      message: `Successfully imported project "${project.name}" with ${tasks.length} tasks`,
      projectId: newProjectId,
    };
  }

  importFullDatabase(importedData, replaceExisting = false) {
    if (replaceExisting) {
      // Complete replacement
      importedData.metadata.importedAt = new Date().toISOString();
      importedData.metadata.previousVersion = this.getData().version;
      this.setData(importedData);
      this.logActivity(
        "system",
        "Database restored",
        "Full database restored from backup",
      );

      return {
        success: true,
        message: `Database restored successfully. ${importedData.projects.length} projects and ${importedData.tasks.length} tasks imported.`,
      };
    } else {
      // Merge data
      const currentData = this.getData();
      const idMap = {}; // Mapping of original project ID to the local/new ID

      // Merge people
      importedData.people?.forEach((person) => {
        const exists = currentData.people.find((p) => p.email === person.email && p.name === person.name);
        if (!exists) {
          currentData.people.push(person);
        }
      });

      // Merge projects (skip duplicates by key)
      let newProjects = 0;
      importedData.projects.forEach((project) => {
        const originalId = project.id;
        const exists = currentData.projects.find((p) => p.key === project.key);

        if (!exists) {
          const newId = this.generateId("PROJ");
          project.id = newId;
          project.importedAt = new Date().toISOString();
          currentData.projects.push(project);
          idMap[originalId] = newId;
          newProjects++;
        } else {
          idMap[originalId] = exists.id;
        }
      });

      // Merge tasks
      let newTasks = 0;
      importedData.tasks.forEach((task) => {
        const mappedProjectId = idMap[task.projectId];

        if (mappedProjectId) {
          // Check if same task already exists (using its ID as unique identifier)
          const taskExists = currentData.tasks.find((t) => t.id === task.id);

          if (!taskExists) {
            task.projectId = mappedProjectId;
            task.importedAt = new Date().toISOString();
            currentData.tasks.push(task);
            newTasks++;
          }
        }
      });

      // Update counts
      currentData.projects.forEach((project) => {
        project.taskCount = currentData.tasks.filter(
          (t) => t.projectId === project.id,
        ).length;
      });

      currentData.metadata.totalProjects = currentData.projects.length;
      currentData.metadata.totalTasks = currentData.tasks.length;

      this.setData(currentData);
      this.logActivity(
        "system",
        "Data merged",
        `Merged ${newProjects} projects and ${newTasks} tasks from backup`,
      );

      return {
        success: true,
        message: `Merged ${newProjects} new projects and ${newTasks} tasks into existing database.`,
      };
    }
  }

  // Utility Methods
  generateId(prefix = "ID") {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}-${timestamp}${random}`.toUpperCase();
  }

  formatDateForFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}${month}${day}-${hours}${minutes}`;
  }

  clearAllData() {
    const confirmation = confirm(
      "This will permanently delete ALL projects, tasks, and activity history. This cannot be undone. Are you absolutely sure?",
    );

    if (confirmation) {
      localStorage.removeItem(this.DB_NAME);
      this.createDefaultData();
      return true;
    }
    return false;
  }

  getStatistics(projectId = null) {
    const data = this.getData();
    let tasks = data.tasks || [];

    if (projectId) {
      tasks = tasks.filter(t => t.projectId === projectId);
    }

    return {
      totalProjects: data.projects.length,
      totalTasks: tasks.length,
      tasksByStatus: {
        backlog: tasks.filter((t) => t.status === "backlog").length,
        todo: tasks.filter((t) => t.status === "todo").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        inReview: tasks.filter((t) => t.status === "in-review").length,
        done: tasks.filter((t) => t.status === "done").length,
      },
      tasksByPriority: {
        critical: tasks.filter((t) => t.priority === "critical").length,
        high: tasks.filter((t) => t.priority === "high").length,
        medium: tasks.filter((t) => t.priority === "medium").length,
        low: tasks.filter((t) => t.priority === "low").length,
      },
      recentActivity: this.getActivityLog(10),
      lastBackup: data.metadata.lastBackup,
      databaseSize: new Blob([JSON.stringify(data)]).size,
    };
  }
}

// Create global storage instance
const storage = new Storage();
