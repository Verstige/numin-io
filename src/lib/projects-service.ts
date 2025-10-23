// Supabase Projects Service
// CRUD operations for projects in Supabase

import { supabase } from './supabase';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  team_id?: string;
  // Enhanced business details
  location?: string;
  website?: string;
  industry?: string;
  products?: string;
  target_audience?: string;
  business_stage?: string;
  revenue?: string;
  employees?: string;
  founded?: string;
  contact_email?: string;
  phone?: string;
  social_media?: string;
  additional_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
  location?: string;
  website?: string;
  industry?: string;
  products?: string;
  target_audience?: string;
  business_stage?: string;
  revenue?: string;
  employees?: string;
  founded?: string;
  contact_email?: string;
  phone?: string;
  social_media?: string;
  additional_notes?: string;
}

/**
 * Get all projects for the current user
 */
export async function getUserProjects(): Promise<Project[]> {
  try {
    console.log('📦 Fetching projects from Supabase...');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('⚠️ No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching projects:', error);
      throw error;
    }

    console.log(`✅ Fetched ${data?.length || 0} projects from Supabase`);
    return data || [];
  } catch (error) {
    console.error('❌ Failed to fetch projects:', error);
    return [];
  }
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<Project | null> {
  try {
    console.log('📝 Creating project in Supabase:', input.name);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('User must be authenticated to create projects');
    }

    const projectData = {
      name: input.name,
      description: input.description,
      status: input.status || 'Active',
      priority: input.priority || 'medium',
      created_by: user.id,
      team_id: user.id, // Use user ID as team ID for now
      location: input.location,
      website: input.website,
      industry: input.industry,
      products: input.products,
      target_audience: input.target_audience,
      business_stage: input.business_stage,
      revenue: input.revenue,
      employees: input.employees,
      founded: input.founded,
      contact_email: input.contact_email,
      phone: input.phone,
      social_media: input.social_media,
      additional_notes: input.additional_notes,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating project:', error);
      throw error;
    }

    console.log('✅ Project created successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to create project:', error);
    return null;
  }
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, updates: Partial<CreateProjectInput>): Promise<Project | null> {
  try {
    console.log('📝 Updating project in Supabase:', id);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('User must be authenticated to update projects');
    }

    // Map snake_case to camelCase
    const projectUpdates = {
      name: updates.name,
      description: updates.description,
      status: updates.status,
      priority: updates.priority,
      location: updates.location,
      website: updates.website,
      industry: updates.industry,
      products: updates.products,
      target_audience: updates.target_audience,
      business_stage: updates.business_stage,
      revenue: updates.revenue,
      employees: updates.employees,
      founded: updates.founded,
      contact_email: updates.contact_email,
      phone: updates.phone,
      social_media: updates.social_media,
      additional_notes: updates.additional_notes,
    };

    // Remove undefined values
    Object.keys(projectUpdates).forEach(key => {
      if (projectUpdates[key as keyof typeof projectUpdates] === undefined) {
        delete projectUpdates[key as keyof typeof projectUpdates];
      }
    });

    const { data, error } = await supabase
      .from('projects')
      .update(projectUpdates)
      .eq('id', id)
      .eq('created_by', user.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating project:', error);
      throw error;
    }

    console.log('✅ Project updated successfully');
    return data;
  } catch (error) {
    console.error('❌ Failed to update project:', error);
    return null;
  }
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting project from Supabase:', id);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('User must be authenticated to delete projects');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id);

    if (error) {
      console.error('❌ Error deleting project:', error);
      throw error;
    }

    console.log('✅ Project deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to delete project:', error);
    return false;
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('created_by', user.id)
      .single();

    if (error) {
      console.error('❌ Error fetching project:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Failed to fetch project:', error);
    return null;
  }
}

