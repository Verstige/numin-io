# Project Persistence with Supabase - Setup Guide

This guide explains how to set up project persistence so that user data saves to their Supabase account.

## 🎯 Overview

Projects and user data are now saved to Supabase instead of only localStorage. This ensures:
- ✅ Data persists across devices
- ✅ Data survives browser cache clears
- ✅ Better security with RLS policies
- ✅ Automatic backup to localStorage for offline access

## 📋 Setup Instructions

### Step 1: Update Projects Table Schema

Run this SQL script in your Supabase SQL Editor to add business detail fields:

**File**: `update-projects-table.sql`

```bash
# Open Supabase Dashboard
# Navigate to: SQL Editor > New Query
# Copy and paste the contents of update-projects-table.sql
# Click "Run" or press Cmd/Ctrl + Enter
```

This adds the following fields to the `projects` table:
- `location` - Business location
- `website` - Company website
- `industry` - Industry category
- `products` - Products/services offered
- `target_audience` - Target customer base
- `business_stage` - Current business stage (startup, growth, etc.)
- `revenue` - Revenue information
- `employees` - Number of employees
- `founded` - Founding date
- `contact_email` - Contact email
- `phone` - Phone number
- `social_media` - Social media links
- `additional_notes` - Additional business notes

### Step 2: Verify Table Updates

After running the SQL, verify in Supabase:

1. Go to **Table Editor** > **projects**
2. Check that all new columns exist
3. Verify RLS policies are enabled
4. Test creating a project from the app

## 🔧 Implementation Details

### Files Created/Updated

1. **`src/lib/projects-service.ts`** - New Supabase service for projects
   - `getUserProjects()` - Fetch all user projects
   - `createProject(input)` - Create new project
   - `updateProject(id, updates)` - Update existing project
   - `deleteProject(id)` - Delete project
   - `getProject(id)` - Get single project by ID

2. **`src/pages/Index.tsx`** - Updated to use Supabase
   - Load projects from Supabase on mount
   - Save projects to Supabase on create/update/delete
   - Fallback to localStorage if Supabase fails
   - Automatic localStorage backup for offline access

### Data Flow

```
User Action → Supabase Database → Local State → localStorage (backup)
                                ↓
                         Real-time Updates
```

1. **On Mount**: Load projects from Supabase
2. **On Create**: Save to Supabase → Update state → Backup to localStorage
3. **On Update**: Update Supabase → Update state → Backup to localStorage  
4. **On Delete**: Delete from Supabase → Update state → Backup to localStorage

### Field Mapping

The app uses `camelCase` while Supabase uses `snake_case`:

| App (camelCase) | Database (snake_case) |
|-----------------|----------------------|
| `targetAudience` | `target_audience` |
| `businessStage` | `business_stage` |
| `contactEmail` | `contact_email` |
| `socialMedia` | `social_media` |
| `additionalNotes` | `additional_notes` |

The `projects-service.ts` handles this conversion automatically.

## 🔐 Security

### Row Level Security (RLS)

Projects table has RLS policies:
- ✅ Users can only view their own projects
- ✅ Users can only create projects with their own `created_by`
- ✅ Users can only update their own projects
- ✅ Users can only delete their own projects

### Authentication Check

All operations verify authentication:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error('User must be authenticated');
}
```

## 🧪 Testing

### Test Project Creation

1. Sign in to your account
2. Click "New Project" or the `+` button
3. Fill in project details
4. Click "Create Project"
5. **Check Console** for:
   ```
   📝 Creating project in Supabase...
   ✅ Project created in Supabase: <project-id>
   ```

### Test Project Persistence

1. Create a project
2. **Sign out**
3. **Sign back in**
4. Verify the project is still there
5. **Check Console** for:
   ```
   🔄 Loading projects from Supabase...
   ✅ Loaded 1 projects from Supabase
   ```

### Test Cross-Device Sync

1. Create a project on Computer A
2. Sign in on Computer B (same account)
3. Verify the project appears on Computer B

### Test Offline Fallback

1. Create some projects
2. **Disable network** (turn off WiFi or go offline)
3. **Refresh the page**
4. Verify projects load from localStorage
5. **Check Console** for:
   ```
   ❌ Error loading projects from Supabase: <error>
   ⚠️ Falling back to localStorage projects
   ```

## 🐛 Troubleshooting

### Issue: Projects not saving to Supabase

**Check:**
1. Is user authenticated? `user?.id` should not be undefined
2. Are environment variables set correctly? `.env` file present
3. Did you run `update-projects-table.sql`?
4. Check browser console for errors

**Fix:**
- Verify `.env` file exists with correct Supabase credentials
- Run `update-projects-table.sql` in Supabase SQL Editor
- Check RLS policies in Supabase > Authentication > Policies

### Issue: "Column does not exist" error

**Fix:**
- You didn't run `update-projects-table.sql`
- Run it now in Supabase SQL Editor
- Refresh the app

### Issue: Projects not loading

**Check Console for:**
```
📦 Fetching projects from Supabase...
❌ Error fetching projects: <error>
```

**Common causes:**
1. RLS policies too restrictive
2. `created_by` doesn't match `user.id`
3. Network issues

**Fix:**
- Check RLS policies allow `SELECT` where `created_by = auth.uid()`
- Verify user is authenticated before loading
- Check network connection

### Issue: "Failed to create project"

**Check Console for:**
```
📝 Creating project in Supabase...
❌ Error creating project: <error>
```

**Common causes:**
1. Missing required fields (`name`, `description`)
2. User not authenticated
3. Invalid `created_by` value

**Fix:**
- Ensure project name is not empty
- Verify user is signed in
- Check that `created_by` field matches current user ID

## 📊 Database Schema

### projects table

```sql
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Business details
  location TEXT,
  website TEXT,
  industry TEXT,
  products TEXT,
  target_audience TEXT,
  business_stage TEXT,
  revenue TEXT,
  employees TEXT,
  founded TEXT,
  contact_email TEXT,
  phone TEXT,
  social_media TEXT,
  additional_notes TEXT
);
```

## 🚀 Next Steps

After setting up project persistence:

1. ✅ Test creating, updating, and deleting projects
2. ✅ Test cross-device sync
3. ✅ Test offline fallback to localStorage
4. 🔄 Migrate tasks, notes, and calendar events to Supabase (optional)
5. 🔄 Implement real-time collaboration (optional)

## 📝 Console Logs Guide

### On Load

```javascript
🔄 Loading projects from Supabase...
📦 Fetching projects from Supabase...
✅ Fetched 3 projects from Supabase
✅ Loaded 3 projects from Supabase
```

### On Create

```javascript
📝 Creating project in Supabase...
📝 Creating project in Supabase: My New Project
✅ Project created successfully: <uuid>
✅ Project created in Supabase: <uuid>
```

### On Update

```javascript
📝 Updating project in Supabase: <uuid>
✅ Project updated successfully
✅ Project updated in Supabase
```

### On Delete

```javascript
🗑️ Deleting project from Supabase: <uuid>
✅ Project deleted successfully
✅ Project deleted from Supabase
```

### On Error (with Fallback)

```javascript
❌ Error loading projects from Supabase: <error>
⚠️ Falling back to localStorage projects
```

---

## ✅ Summary

Your app now:
- ✅ Saves projects to Supabase database
- ✅ Loads projects from Supabase on mount
- ✅ Updates projects in Supabase
- ✅ Deletes projects from Supabase
- ✅ Falls back to localStorage if Supabase fails
- ✅ Maintains localStorage backup for offline access
- ✅ Secured with Row Level Security policies

**User data now persists across devices and sessions!** 🎉

