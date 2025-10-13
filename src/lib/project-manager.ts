import { supabase } from './supabase';
import { 
  AIAgent, 
  Workflow, 
  APIConnector 
} from '@/types/nexus';

// Enhanced Project Management Service
export class ProjectManager {
  private static instance: ProjectManager;

  private constructor() {}

  public static getInstance(): ProjectManager {
    if (!ProjectManager.instance) {
      ProjectManager.instance = new ProjectManager();
    }
    return ProjectManager.instance;
  }

  // Create a new project node in the enhanced map
  public async createProjectNode(
    projectData: {
      title: string;
      description: string;
      status: 'planning' | 'active' | 'completed' | 'paused';
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
      progress?: number;
      team?: string[];
      tags?: string[];
      deadline?: Date;
      budget?: number;
    },
    userId: string,
    teamId?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.title,
          description: projectData.description,
          status: projectData.status,
          priority: projectData.priority,
          team_id: teamId || 'default-team',
          created_by: userId,
          // Store enhanced data in a JSON field
          enhanced_data: {
            category: projectData.category,
            progress: projectData.progress || 0,
            team: projectData.team || [],
            tags: projectData.tags || [],
            deadline: projectData.deadline,
            budget: projectData.budget
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project node:', error);
      throw new Error('Failed to create project node');
    }
  }

  // Create a task node
  public async createTaskNode(
    taskData: {
      title: string;
      description: string;
      status: 'todo' | 'in-progress' | 'completed' | 'blocked';
      priority: 'low' | 'medium' | 'high' | 'critical';
      projectId: string;
      assignee?: string;
      deadline?: Date;
      estimatedHours?: number;
      tags?: string[];
    },
    userId: string,
    teamId?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          project_id: taskData.projectId,
          assignee_id: taskData.assignee,
          deadline: taskData.deadline,
          estimated_hours: taskData.estimatedHours,
          tags: taskData.tags || [],
          team_id: teamId || 'default-team',
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task node:', error);
      throw new Error('Failed to create task node');
    }
  }

  // Create a milestone node
  public async createMilestoneNode(
    milestoneData: {
      title: string;
      description: string;
      projectId: string;
      deadline: Date;
      completed?: boolean;
      dependencies?: string[];
    },
    userId: string,
    teamId?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .insert({
          title: milestoneData.title,
          description: milestoneData.description,
          project_id: milestoneData.projectId,
          deadline: milestoneData.deadline,
          completed: milestoneData.completed || false,
          dependencies: milestoneData.dependencies || [],
          team_id: teamId || 'default-team',
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating milestone node:', error);
      throw new Error('Failed to create milestone node');
    }
  }

  // Create a resource/team member node
  public async createResourceNode(
    resourceData: {
      title: string;
      role: string;
      skills: string[];
      available: boolean;
      workload: number;
      hourlyRate?: number;
      department?: string;
    },
    userId: string,
    teamId?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('project_resources')
        .insert({
          name: resourceData.title,
          role: resourceData.role,
          skills: resourceData.skills,
          available: resourceData.available,
          workload: resourceData.workload,
          hourly_rate: resourceData.hourlyRate,
          department: resourceData.department,
          team_id: teamId || 'default-team',
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating resource node:', error);
      throw new Error('Failed to create resource node');
    }
  }

  // Create a team/department node
  public async createTeamNode(
    teamData: {
      title: string;
      department: string;
      members: string[];
      projects: number;
      budget?: number;
    },
    userId: string,
    teamId?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('project_teams')
        .insert({
          name: teamData.title,
          department: teamData.department,
          members: teamData.members,
          project_count: teamData.projects,
          budget: teamData.budget,
          team_id: teamId || 'default-team',
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating team node:', error);
      throw new Error('Failed to create team node');
    }
  }

  // Create project connections/relationships
  public async createProjectConnection(
    connectionData: {
      sourceId: string;
      targetId: string;
      type: 'dependency' | 'collaboration' | 'timeline' | 'resource';
      label?: string;
      weight?: number;
      deadline?: Date;
    },
    userId: string,
    teamId?: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('project_connections')
        .insert({
          source_id: connectionData.sourceId,
          target_id: connectionData.targetId,
          connection_type: connectionData.type,
          label: connectionData.label,
          weight: connectionData.weight,
          deadline: connectionData.deadline,
          team_id: teamId || 'default-team',
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project connection:', error);
      throw new Error('Failed to create project connection');
    }
  }

  // Get all projects with enhanced data
  public async getProjectsWithEnhancedData(
    userId: string,
    teamId?: string
  ): Promise<any[]> {
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          project_tasks(*),
          project_milestones(*),
          project_resources(*),
          project_teams(*),
          project_connections(*)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting projects with enhanced data:', error);
      return [];
    }
  }

  // Update project node data
  public async updateProjectNode(
    nodeId: string,
    updates: any,
    userId: string
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          enhanced_data: updates.enhanced_data || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', nodeId)
        .eq('created_by', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project node:', error);
      throw new Error('Failed to update project node');
    }
  }

  // Delete project node and related data
  public async deleteProjectNode(
    nodeId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Delete related data first
      await supabase
        .from('project_connections')
        .delete()
        .or(`source_id.eq.${nodeId},target_id.eq.${nodeId}`);

      await supabase
        .from('project_tasks')
        .delete()
        .eq('project_id', nodeId);

      await supabase
        .from('project_milestones')
        .delete()
        .eq('project_id', nodeId);

      // Delete the main project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', nodeId)
        .eq('created_by', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project node:', error);
      return false;
    }
  }

  // Get project map layout data
  public async getProjectMapLayout(
    userId: string,
    teamId?: string
  ): Promise<{
    nodes: any[];
    edges: any[];
  }> {
    try {
      const projects = await this.getProjectsWithEnhancedData(userId, teamId);
      
      const nodes = projects.map((project, index) => ({
        id: project.id,
        type: 'project',
        position: {
          x: 100 + (index % 4) * 300,
          y: 100 + Math.floor(index / 4) * 200
        },
        data: {
          title: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          category: project.enhanced_data?.category || 'business',
          progress: project.enhanced_data?.progress || 0,
          team: project.enhanced_data?.team || [],
          tags: project.enhanced_data?.tags || [],
          deadline: project.enhanced_data?.deadline,
          budget: project.enhanced_data?.budget
        }
      }));

      // Add task nodes
      projects.forEach(project => {
        if (project.project_tasks) {
          project.project_tasks.forEach((task: any, index: number) => {
            nodes.push({
              id: `task_${task.id}`,
              type: 'task',
              position: {
                x: 100 + (nodes.length % 4) * 300,
                y: 100 + Math.floor(nodes.length / 4) * 200
              },
              data: {
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                deadline: task.deadline,
                assignee: task.assignee_id,
                tags: task.tags || []
              }
            });
          });
        }
      });

      // Add milestone nodes
      projects.forEach(project => {
        if (project.project_milestones) {
          project.project_milestones.forEach((milestone: any, index: number) => {
            nodes.push({
              id: `milestone_${milestone.id}`,
              type: 'milestone',
              position: {
                x: 100 + (nodes.length % 4) * 300,
                y: 100 + Math.floor(nodes.length / 4) * 200
              },
              data: {
                title: milestone.title,
                description: milestone.description,
                completed: milestone.completed,
                deadline: milestone.deadline,
                dependencies: milestone.dependencies || []
              }
            });
          });
        }
      });

      // Create edges from connections
      const edges: any[] = [];
      projects.forEach(project => {
        if (project.project_connections) {
          project.project_connections.forEach((connection: any) => {
            edges.push({
              id: `edge_${connection.id}`,
              source: connection.source_id,
              target: connection.target_id,
              type: 'smoothstep',
              animated: true,
              label: connection.label,
              style: {
                stroke: connection.connection_type === 'dependency' ? '#ef4444' :
                       connection.connection_type === 'collaboration' ? '#3b82f6' :
                       connection.connection_type === 'timeline' ? '#8b5cf6' : '#10b981',
                strokeWidth: 2
              }
            });
          });
        }
      });

      return { nodes, edges };
    } catch (error) {
      console.error('Error getting project map layout:', error);
      return { nodes: [], edges: [] };
    }
  }

  // Save project map layout
  public async saveProjectMapLayout(
    layoutData: {
      nodes: any[];
      edges: any[];
    },
    userId: string,
    teamId?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_map_layouts')
        .upsert({
          team_id: teamId || 'default-team',
          user_id: userId,
          layout_data: layoutData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving project map layout:', error);
      return false;
    }
  }

  // Get project analytics
  public async getProjectAnalytics(
    userId: string,
    teamId?: string
  ): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    teamUtilization: number;
    avgProjectDuration: number;
    budgetUtilization: number;
  }> {
    try {
      const projects = await this.getProjectsWithEnhancedData(userId, teamId);
      
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      
      const allTasks = projects.flatMap(p => p.project_tasks || []);
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === 'completed').length;
      
      const teamUtilization = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      const avgProjectDuration = projects.reduce((acc, project) => {
        const created = new Date(project.created_at);
        const updated = new Date(project.updated_at);
        return acc + (updated.getTime() - created.getTime());
      }, 0) / totalProjects / (1000 * 60 * 60 * 24); // Convert to days
      
      const totalBudget = projects.reduce((acc, project) => 
        acc + (project.enhanced_data?.budget || 0), 0);
      const usedBudget = projects.reduce((acc, project) => 
        acc + (project.enhanced_data?.budget || 0) * (project.enhanced_data?.progress || 0) / 100, 0);
      const budgetUtilization = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        teamUtilization,
        avgProjectDuration: Math.round(avgProjectDuration),
        budgetUtilization: Math.round(budgetUtilization)
      };
    } catch (error) {
      console.error('Error getting project analytics:', error);
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        teamUtilization: 0,
        avgProjectDuration: 0,
        budgetUtilization: 0
      };
    }
  }
}

// Export singleton instance
export const projectManager = ProjectManager.getInstance();
