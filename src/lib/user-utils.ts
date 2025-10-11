// User utility functions for Nexus

/**
 * Get the display name for a user profile
 * Falls back to email if full_name is not available
 * Falls back to "User" if nothing is available
 */
export function getUserDisplayName(profile: { full_name?: string | null; email?: string | null } | null): string {
  if (!profile) return "User";
  
  if (profile.full_name && profile.full_name.trim()) {
    return profile.full_name.trim();
  }
  
  if (profile.email && profile.email.trim()) {
    // Extract name from email (part before @)
    const emailName = profile.email.split('@')[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  
  return "User";
}

/**
 * Get the user's first name only
 */
export function getUserFirstName(profile: { full_name?: string | null; email?: string | null } | null): string {
  const displayName = getUserDisplayName(profile);
  
  // If it's an email-derived name, return as is
  if (profile?.email && !profile.full_name) {
    return displayName;
  }
  
  // Extract first name from full name
  const firstName = displayName.split(' ')[0];
  return firstName || displayName;
}

/**
 * Get a personalized greeting for the user
 */
export function getPersonalizedGreeting(profile: { full_name?: string | null; email?: string | null } | null): string {
  const firstName = getUserFirstName(profile);
  return `Good to see you, ${firstName}.`;
}
