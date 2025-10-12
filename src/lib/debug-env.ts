// Debug environment variables for Nova AI
export function debugEnvironment() {
  console.log('🔍 Debugging Nova AI Environment Variables:');
  console.log('VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('VITE_GEMINI_MODEL:', import.meta.env.VITE_GEMINI_MODEL || 'Not set');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  
  // Check if API key has correct format
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (apiKey) {
    console.log('API Key format check:', {
      length: apiKey.length,
      startsWith: apiKey.startsWith('AIza'),
      prefix: apiKey.substring(0, 10) + '...',
      isValid: apiKey.startsWith('AIza') && apiKey.length > 30
    });
  } else {
    console.error('❌ API Key is undefined or null');
  }
  
  return {
    hasGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
    hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    geminiModel: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'
  };
}
