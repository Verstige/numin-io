// Gmail Integration Service
// Handles Gmail API authentication and email operations

export interface GmailAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface GmailAccount {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  connected: boolean;
  lastSync?: Date;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  labels: string[];
  attachments?: GmailAttachment[];
}

export interface GmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  downloadUrl?: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  messagesTotal?: number;
  messagesUnread?: number;
}

export interface GmailSyncResult {
  success: boolean;
  messagesAdded: number;
  messagesUpdated: number;
  errors: string[];
  lastSync: Date;
}

class GmailIntegrationService {
  private authConfig: GmailAuthConfig | null = null;
  private connectedAccounts: Map<string, GmailAccount> = new Map();
  private currentUserId: string | null = null;

  constructor() {
    this.loadAuthConfig();
    this.loadConnectedAccounts();
  }

  // Initialize Gmail integration with OAuth configuration
  initialize(config: GmailAuthConfig): void {
    this.authConfig = config;
    this.saveAuthConfig();
  }

  // Check if service is initialized
  isInitialized(): boolean {
    return this.authConfig !== null && 
           this.authConfig.clientId !== null && 
           this.authConfig.clientId.trim() !== '';
  }

  // Set current user ID for per-user configs
  setCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
  }

  // Initialize with user-specific config from Firebase
  async initializeWithUserConfig(userId: string): Promise<void> {
    try {
      // Dynamic import to avoid circular dependencies
      const { FirebaseGmailConfigService } = await import('./firebase-gmail-config');
      const userConfig = await FirebaseGmailConfigService.getConfig(userId);
      
      if (userConfig && userConfig.clientId && userConfig.clientId.trim() !== '') {
        this.initialize({
          clientId: userConfig.clientId,
          clientSecret: userConfig.clientSecret,
          redirectUri: userConfig.redirectUri || `${window.location.origin}/auth/gmail/callback`,
          scopes: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.labels',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
          ]
        });
        this.currentUserId = userId;
        console.log('✅ Initialized Gmail service with user config');
      } else {
        console.log('ℹ️ No user config found, will use global config if available');
      }
    } catch (error) {
      console.error('❌ Error initializing with user config:', error);
      throw error;
    }
  }

  // Get Gmail OAuth authorization URL
  getAuthUrl(accountId?: string): string {
    if (!this.authConfig) {
      throw new Error('Gmail integration not initialized. Please configure Gmail OAuth credentials in settings.');
    }

    if (!this.authConfig.clientId || this.authConfig.clientId.trim() === '') {
      throw new Error('Gmail Client ID is not configured. Please set your Gmail OAuth credentials in settings.');
    }

    if (!this.authConfig.redirectUri || this.authConfig.redirectUri.trim() === '') {
      throw new Error('Gmail Redirect URI is not configured.');
    }

    const params = new URLSearchParams({
      client_id: this.authConfig.clientId,
      redirect_uri: this.authConfig.redirectUri,
      scope: this.authConfig.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: accountId || `gmail_${Date.now()}`
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Handle OAuth callback and exchange code for tokens
  async handleAuthCallback(code: string, state: string): Promise<GmailAccount> {
    if (!this.authConfig) {
      console.error('❌ Gmail integration not initialized in handleAuthCallback');
      throw new Error('Gmail integration not initialized. Please configure Gmail OAuth credentials.');
    }

    if (!this.authConfig.clientId || this.authConfig.clientId.trim() === '') {
      console.error('❌ Client ID is missing in handleAuthCallback');
      throw new Error('Gmail Client ID is not configured. Please set your Gmail OAuth credentials in settings.');
    }

    try {
      console.log('🔄 Exchanging code for tokens:', {
        clientId: this.authConfig.clientId.substring(0, 20) + '...',
        redirectUri: this.authConfig.redirectUri,
        hasClientSecret: !!this.authConfig.clientSecret,
        codeLength: code.length,
        codePrefix: code.substring(0, 10) + '...'
      });

      // IMPORTANT: For web applications, client_secret is REQUIRED by Google OAuth
      // If it's missing, the token exchange will fail
      if (!this.authConfig.clientSecret || this.authConfig.clientSecret.trim() === '') {
        console.warn('⚠️ Client Secret is missing! Google OAuth requires client_secret for web applications.');
        console.warn('⚠️ If your OAuth app type is "Web application", you MUST provide a client secret.');
      }

      const tokenParams: any = {
        client_id: this.authConfig.clientId,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.authConfig.redirectUri,
      };

      // Include client_secret - it's required for web applications
      if (this.authConfig.clientSecret && this.authConfig.clientSecret.trim() !== '') {
        tokenParams.client_secret = this.authConfig.clientSecret;
        console.log('✅ Client secret included in token request');
      } else {
        console.warn('⚠️ Client secret is empty - token exchange may fail for web applications');
      }

      console.log('🔄 Token request params:', {
        client_id: tokenParams.client_id.substring(0, 20) + '...',
        redirect_uri: tokenParams.redirect_uri,
        has_client_secret: !!tokenParams.client_secret,
        grant_type: tokenParams.grant_type
      });

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenParams),
      });

      if (!tokenResponse.ok) {
        const responseText = await tokenResponse.text();
        console.error('❌ Token exchange failed:', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          responseText: responseText
        });
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || 'Unknown error' };
        }
        
        console.error('❌ Parsed error data:', errorData);
        
        // Provide more specific error messages
        const errorMessage = errorData.error || errorData.error_description || tokenResponse.statusText;
        let userFriendlyMessage = `Failed to exchange authorization code: ${errorMessage}`;
        
        if (errorData.error === 'invalid_grant') {
          userFriendlyMessage = 'Authorization code expired or already used. Please try connecting again.';
        } else if (errorData.error === 'invalid_client') {
          userFriendlyMessage = 'Invalid OAuth client credentials. Please check your Client ID and Client Secret in settings.';
        } else if (errorData.error === 'redirect_uri_mismatch') {
          userFriendlyMessage = `Redirect URI mismatch. The redirect URI in your Google Cloud Console must exactly match: ${this.authConfig.redirectUri}`;
        }
        
        throw new Error(userFriendlyMessage);
      }

      const tokens = await tokenResponse.json();
      console.log('✅ Token exchange successful');
      console.log('✅ Tokens received:', {
        hasAccessToken: !!tokens.access_token,
        accessTokenType: typeof tokens.access_token,
        accessTokenLength: tokens.access_token?.length || 0,
        hasRefreshToken: !!tokens.refresh_token,
        expiresIn: tokens.expires_in,
        tokenType: tokens.token_type || 'Bearer',
        scope: tokens.scope
      });
      
      // Validate access token
      if (!tokens.access_token) {
        console.error('❌ Access token is missing from token response:', tokens);
        throw new Error('No access token received from Google');
      }
      
      if (typeof tokens.access_token !== 'string') {
        console.error('❌ Access token is not a string:', typeof tokens.access_token, tokens.access_token);
        throw new Error('Invalid access token type received from Google');
      }
      
      const accessToken = tokens.access_token.trim();
      if (accessToken === '') {
        console.error('❌ Access token is empty string');
        throw new Error('Empty access token received from Google');
      }
      
      console.log('✅ Access token validated:', {
        length: accessToken.length,
        startsWith: accessToken.substring(0, 15) + '...',
        tokenType: tokens.token_type || 'Bearer'
      });
      
      // Get user info
      console.log('🔄 Fetching user information from Google...');
      let userInfo;
      
      try {
        const userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
        console.log('🔄 Userinfo URL:', userInfoUrl);
        console.log('🔄 Authorization header:', `Bearer ${accessToken.substring(0, 20)}...`);
        
        const userResponse = await fetch(userInfoUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });

        console.log('🔄 Userinfo response status:', userResponse.status, userResponse.statusText);
        
        if (!userResponse.ok) {
          const errorText = await userResponse.text();
          console.error('❌ Failed to get user info:', {
            status: userResponse.status,
            statusText: userResponse.statusText,
            errorText: errorText,
            headers: Object.fromEntries(userResponse.headers.entries())
          });
          
          // Check if it's a 401 - authentication issue
          if (userResponse.status === 401) {
            console.error('❌ 401 Unauthorized - Access token may be invalid or expired');
            console.error('❌ Token used:', {
              length: accessToken.length,
              firstChars: accessToken.substring(0, 20),
              lastChars: accessToken.substring(accessToken.length - 10)
            });
            
            // Try to parse error if it's JSON
            let errorMessage = 'Authentication failed. The access token may be invalid or expired.';
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error?.message || errorData.error_description || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
            
            throw new Error(`Failed to get user information: ${errorMessage} (Status: ${userResponse.status})`);
          }
          
          // Try to parse error if it's JSON
          let errorMessage = userResponse.statusText || 'Unknown error';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error?.message || errorData.error_description || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(`Failed to get user information: ${errorMessage} (Status: ${userResponse.status})`);
        }

        userInfo = await userResponse.json();
        console.log('✅ User info retrieved:', userInfo.email);
        
        // Validate required fields
        if (!userInfo.email) {
          console.error('❌ User info missing email:', userInfo);
          throw new Error('User info from Google is missing email address');
        }
        
        if (!userInfo.id) {
          console.error('❌ User info missing id:', userInfo);
          throw new Error('User info from Google is missing user ID');
        }
      } catch (fetchError) {
        console.error('❌ Error fetching user info:', fetchError);
        // If it's already our formatted error, re-throw it
        if (fetchError instanceof Error && fetchError.message.includes('Failed to get user information')) {
          throw fetchError;
        }
        // Otherwise, wrap it
        throw new Error(`Failed to get user information: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }

      const account: GmailAccount = {
        id: userInfo.id || `gmail_${Date.now()}`,
        email: userInfo.email || 'unknown@example.com',
        name: userInfo.name || userInfo.email || 'Gmail User',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiresAt: Date.now() + ((tokens.expires_in || 3600) * 1000),
        connected: true,
        lastSync: new Date()
      };
      
      console.log('✅ Account created:', {
        id: account.id,
        email: account.email,
        hasAccessToken: !!account.accessToken,
        hasRefreshToken: !!account.refreshToken
      });

      this.connectedAccounts.set(account.id, account);
      this.saveConnectedAccounts();

      console.log('✅ Gmail account saved:', account.email);
      return account;
    } catch (error) {
      console.error('❌ Gmail auth callback error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to complete Gmail authentication');
    }
  }

  // Refresh access token
  async refreshToken(accountId: string): Promise<string> {
    const account = this.connectedAccounts.get(accountId);
    if (!account || !this.authConfig) {
      throw new Error('Account not found or integration not initialized');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.authConfig.clientId,
          client_secret: this.authConfig.clientSecret,
          refresh_token: account.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const tokens = await response.json();
      account.accessToken = tokens.access_token;
      account.expiresAt = Date.now() + (tokens.expires_in * 1000);

      this.connectedAccounts.set(accountId, account);
      this.saveConnectedAccounts();

      return tokens.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken(accountId: string): Promise<string> {
    const account = this.connectedAccounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (Date.now() >= account.expiresAt - 60000) { // Refresh 1 minute before expiry
      return await this.refreshToken(accountId);
    }

    return account.accessToken;
  }

  // Fetch emails from Gmail
  async fetchEmails(accountId: string, maxResults: number = 50, query?: string): Promise<GmailMessage[]> {
    const accessToken = await this.getValidAccessToken(accountId);
    const account = this.connectedAccounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    try {
      let url = `https://gmail.googleapis.com/gmail/v1/users/${account.email}/messages?maxResults=${maxResults}`;
      if (query) {
        url += `&q=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      const messages: GmailMessage[] = [];

      for (const messageRef of data.messages || []) {
        try {
          const messageResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/${account.email}/messages/${messageRef.id}?format=full`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );

          if (messageResponse.ok) {
            const messageData = await messageResponse.json();
            const parsedMessage = this.parseGmailMessage(messageData);
            messages.push(parsedMessage);
          }
        } catch (error) {
          console.error('Error fetching individual message:', error);
        }
      }

      return messages;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails from Gmail');
    }
  }

  // Send email via Gmail
  async sendEmail(accountId: string, to: string, subject: string, body: string, isHtml: boolean = false): Promise<void> {
    const accessToken = await this.getValidAccessToken(accountId);
    const account = this.connectedAccounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    try {
      const raw = this.createEmailRaw(account.email, to, subject, body, isHtml);
      const encodedRaw = btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/${account.email}/messages/send`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedRaw,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email via Gmail');
    }
  }

  // Get Gmail labels
  async getLabels(accountId: string): Promise<GmailLabel[]> {
    const accessToken = await this.getValidAccessToken(accountId);
    const account = this.connectedAccounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    try {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/${account.email}/labels`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch labels');
      }

      const data = await response.json();
      return data.labels.map((label: any) => ({
        id: label.id,
        name: label.name,
        type: label.type === 'system' ? 'system' : 'user',
        messagesTotal: label.messagesTotal,
        messagesUnread: label.messagesUnread,
      }));
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw new Error('Failed to fetch Gmail labels');
    }
  }

  // Modify Gmail message labels (star/unstar, add/remove labels)
  async modifyMessageLabels(accountId: string, messageId: string, addLabelIds: string[] = [], removeLabelIds: string[] = []): Promise<void> {
    const accessToken = await this.getValidAccessToken(accountId);
    const account = this.connectedAccounts.get(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    try {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/${account.email}/messages/${messageId}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addLabelIds,
            removeLabelIds,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to modify message labels: ${errorData.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error modifying message labels:', error);
      throw new Error('Failed to modify Gmail message labels');
    }
  }

  // Toggle star on a message
  async toggleStar(accountId: string, messageId: string, isStarred: boolean): Promise<void> {
    if (isStarred) {
      // Remove star
      await this.modifyMessageLabels(accountId, messageId, [], ['STARRED']);
    } else {
      // Add star
      await this.modifyMessageLabels(accountId, messageId, ['STARRED'], []);
    }
  }

  // Sync emails with local storage
  async syncEmails(accountId: string): Promise<GmailSyncResult> {
    const result: GmailSyncResult = {
      success: true,
      messagesAdded: 0,
      messagesUpdated: 0,
      errors: [],
      lastSync: new Date()
    };

    try {
      const account = this.connectedAccounts.get(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      const emails = await this.fetchEmails(accountId, 100);
      const existingEmails = this.getStoredEmails(accountId);
      const emailMap = new Map(existingEmails.map(email => [email.id, email]));

      for (const email of emails) {
        if (emailMap.has(email.id)) {
          // Update existing email
          emailMap.set(email.id, email);
          result.messagesUpdated++;
        } else {
          // Add new email
          emailMap.set(email.id, email);
          result.messagesAdded++;
        }
      }

      // Save updated emails
      const updatedEmails = Array.from(emailMap.values());
      this.saveEmails(accountId, updatedEmails);

      // Update last sync time
      account.lastSync = new Date();
      this.connectedAccounts.set(accountId, account);
      this.saveConnectedAccounts();

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  // Disconnect Gmail account
  disconnectAccount(accountId: string): void {
    this.connectedAccounts.delete(accountId);
    this.saveConnectedAccounts();
    
    // Remove stored emails
    localStorage.removeItem(`gmail_emails_${accountId}`);
  }

  // Get connected accounts
  getConnectedAccounts(): GmailAccount[] {
    return Array.from(this.connectedAccounts.values());
  }

  // Get account by ID
  getAccount(accountId: string): GmailAccount | undefined {
    return this.connectedAccounts.get(accountId);
  }

  // Parse Gmail message format
  private parseGmailMessage(messageData: any): GmailMessage {
    const headers = messageData.payload.headers;
    const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const timestamp = new Date(parseInt(messageData.internalDate));
    
    // Extract body content
    let body = '';
    let htmlBody = '';
    
    // Helper function to extract body from parts recursively
    const extractBodyFromParts = (parts: any[]) => {
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body && part.body.data) {
          try {
            body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          } catch (e) {
            console.error('Error decoding plain text body:', e);
          }
        } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
          try {
            htmlBody = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          } catch (e) {
            console.error('Error decoding HTML body:', e);
          }
        } else if (part.parts) {
          // Recursively check nested parts (for multipart messages)
          extractBodyFromParts(part.parts);
        }
      }
    };
    
    if (messageData.payload.body && messageData.payload.body.data) {
      try {
        body = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } catch (e) {
        console.error('Error decoding body:', e);
      }
    } else if (messageData.payload.parts) {
      extractBodyFromParts(messageData.payload.parts);
    }

    return {
      id: messageData.id,
      threadId: messageData.threadId,
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc') ? getHeader('Cc').split(',').map((email: string) => email.trim()) : undefined,
      subject: getHeader('Subject'),
      body,
      htmlBody,
      timestamp,
      isRead: !messageData.labelIds.includes('UNREAD'),
      isStarred: messageData.labelIds.includes('STARRED'),
      isImportant: messageData.labelIds.includes('IMPORTANT'),
      labels: messageData.labelIds || [],
    };
  }

  // Create raw email format for sending
  private createEmailRaw(from: string, to: string, subject: string, body: string, isHtml: boolean): string {
    const boundary = 'boundary_' + Math.random().toString(36).substr(2, 9);
    const contentType = isHtml ? 'text/html' : 'text/plain';
    
    let raw = `To: ${to}\r\n`;
    raw += `From: ${from}\r\n`;
    raw += `Subject: ${subject}\r\n`;
    raw += `MIME-Version: 1.0\r\n`;
    raw += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
    raw += `--${boundary}\r\n`;
    raw += `Content-Type: ${contentType}; charset="UTF-8"\r\n\r\n`;
    raw += `${body}\r\n\r\n`;
    raw += `--${boundary}--\r\n`;
    
    return raw;
  }

  // Storage methods
  private saveAuthConfig(): void {
    if (this.authConfig) {
      localStorage.setItem('gmail_auth_config', JSON.stringify(this.authConfig));
    }
  }

  private loadAuthConfig(): void {
    const stored = localStorage.getItem('gmail_auth_config');
    if (stored) {
      this.authConfig = JSON.parse(stored);
    }
  }

  private saveConnectedAccounts(): void {
    const accounts = Array.from(this.connectedAccounts.values());
    localStorage.setItem('gmail_connected_accounts', JSON.stringify(accounts));
  }

  private loadConnectedAccounts(): void {
    const stored = localStorage.getItem('gmail_connected_accounts');
    if (stored) {
      const accounts: GmailAccount[] = JSON.parse(stored);
      accounts.forEach(account => {
        this.connectedAccounts.set(account.id, account);
      });
    }
  }

  private saveEmails(accountId: string, emails: GmailMessage[]): void {
    localStorage.setItem(`gmail_emails_${accountId}`, JSON.stringify(emails));
  }

  private getStoredEmails(accountId: string): GmailMessage[] {
    const stored = localStorage.getItem(`gmail_emails_${accountId}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Public method to get stored emails
  getStoredEmailsForAccount(accountId: string): GmailMessage[] {
    return this.getStoredEmails(accountId);
  }
}

// Export singleton instance
export const gmailService = new GmailIntegrationService();

// Initialize with default configuration (global fallback)
// This will be used if no user-specific config is found
// The component will handle loading user-specific configs
const gmailClientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
const gmailClientSecret = import.meta.env.VITE_GMAIL_CLIENT_SECRET;

// Note: Global config initialization is now handled by the component
// This allows per-user configs to take precedence
if (gmailClientId && gmailClientId.trim() !== '') {
  // Store for potential use, but don't auto-initialize
  // The component will initialize with user config or global config as needed
  console.log('ℹ️ Global Gmail OAuth credentials detected. Will use as fallback if no user config is set.');
} else {
  console.warn('⚠️ Global Gmail integration not configured: VITE_GMAIL_CLIENT_ID is not set. Users can set their own credentials in settings.');
}
