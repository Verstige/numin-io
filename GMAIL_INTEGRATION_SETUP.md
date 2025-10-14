# Gmail Integration Setup Guide

This guide will help you set up Gmail integration for the Nexus AI platform, allowing users to connect their Gmail accounts and manage emails directly from the workspace.

## Prerequisites

- Google Cloud Console account
- Access to create OAuth 2.0 credentials
- Domain/hosting for the application

## Step 1: Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click on it and press "Enable"

## Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have Google Workspace)
3. Fill in the required information:
   - App name: "Nexus AI"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/gmail.labels`
5. Add test users (during development)
6. Save and continue

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Configure the application:
   - Name: "Nexus AI Gmail Integration"
   - Authorized JavaScript origins: 
     - `http://localhost:5173` (for development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/gmail/callback` (for development)
     - `https://your-domain.com/auth/gmail/callback` (for production)
5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

1. Copy your credentials to the `.env` file:
```env
VITE_GMAIL_CLIENT_ID=your-client-id-here
VITE_GMAIL_CLIENT_SECRET=your-client-secret-here
```

2. Update the redirect URI in `src/lib/gmail-integration.ts` if needed:
```typescript
redirectUri: `${window.location.origin}/auth/gmail/callback`
```

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to Settings > Integrations
3. Click "Connect Gmail" in the Gmail integration section
4. Complete the OAuth flow
5. Verify that emails sync to the Email tab

## Features

### Email Synchronization
- **Automatic Sync**: Emails are automatically fetched from connected Gmail accounts
- **Real-time Updates**: Manual sync button to refresh emails
- **Multiple Accounts**: Support for multiple Gmail accounts
- **Smart Filtering**: Emails are organized by labels and folders

### Email Management
- **Read/Unread Status**: Track email read status
- **Starring**: Mark important emails
- **Labels**: Organize emails with Gmail labels
- **Search**: Search through synced emails

### AI Integration
- **Email Analysis**: AI-powered sentiment and intent analysis
- **Smart Drafts**: AI-generated email responses
- **Auto-categorization**: Automatic email categorization
- **Priority Detection**: Identify important emails

### Sending Emails
- **Gmail Integration**: Send emails directly through Gmail
- **AI Assistance**: AI-powered email composition
- **Multiple Recipients**: Support for CC and BCC
- **Rich Formatting**: HTML email support

## Security & Privacy

### OAuth 2.0 Security
- **Secure Authentication**: Uses Google's OAuth 2.0 protocol
- **Token Management**: Automatic token refresh
- **Limited Permissions**: Only requests necessary Gmail permissions
- **User Control**: Users can revoke access at any time

### Data Protection
- **Local Storage**: Emails stored locally in browser
- **No Server Storage**: Gmail data never stored on our servers
- **Encrypted Communication**: All API calls use HTTPS
- **Privacy First**: Users maintain full control over their data

## Troubleshooting

### Common Issues

**"Popup blocked" Error**
- Ensure popups are allowed for your domain
- Check browser popup settings

**"Invalid redirect URI" Error**
- Verify the redirect URI in Google Cloud Console matches your domain
- Ensure the URI is exactly: `https://your-domain.com/auth/gmail/callback`

**"Access denied" Error**
- Check if the user is in the test users list (during development)
- Verify OAuth consent screen is properly configured

**"API not enabled" Error**
- Ensure Gmail API is enabled in Google Cloud Console
- Check API quotas and billing

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
VITE_DEBUG_GMAIL=true
```

## Production Deployment

### Domain Configuration
1. Update authorized origins in Google Cloud Console
2. Update redirect URIs for production domain
3. Configure OAuth consent screen for production
4. Remove test users and publish the app

### Environment Variables
```env
VITE_GMAIL_CLIENT_ID=your-production-client-id
VITE_GMAIL_CLIENT_SECRET=your-production-client-secret
```

### Security Checklist
- [ ] HTTPS enabled on production domain
- [ ] OAuth consent screen published
- [ ] Client secret secured (never expose in frontend code)
- [ ] Redirect URIs properly configured
- [ ] API quotas set appropriately

## API Limits

### Gmail API Quotas
- **Requests per day**: 1,000,000,000 (default)
- **Requests per 100 seconds**: 250 (default)
- **Requests per 100 seconds per user**: 250 (default)

### Best Practices
- Implement proper error handling
- Use exponential backoff for retries
- Cache frequently accessed data
- Monitor API usage in Google Cloud Console

## Support

For issues with Gmail integration:
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Test with a different Gmail account
4. Check Google Cloud Console for API errors
5. Review the troubleshooting section above

## Future Enhancements

- **Batch Operations**: Bulk email operations
- **Advanced Filters**: Complex email filtering
- **Calendar Integration**: Email to calendar events
- **Team Sharing**: Shared email management
- **Analytics**: Email usage analytics
