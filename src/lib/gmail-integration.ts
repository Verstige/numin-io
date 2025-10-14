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

  constructor() {
    this.loadAuthConfig();
    this.loadConnectedAccounts();
  }

  // Initialize Gmail integration with OAuth configuration
  initialize(config: GmailAuthConfig): void {
    this.authConfig = config;
    this.saveAuthConfig();
  }

  // Get Gmail OAuth authorization URL
  getAuthUrl(accountId?: string): string {
    if (!this.authConfig) {
      throw new Error('Gmail integration not initialized');
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
      throw new Error('Gmail integration not initialized');
    }

    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.authConfig.clientId,
          client_secret: this.authConfig.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.authConfig.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code for tokens');
      }

      const tokens = await tokenResponse.json();
      
      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user information');
      }

      const userInfo = await userResponse.json();

      const account: GmailAccount = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
        connected: true,
        lastSync: new Date()
      };

      this.connectedAccounts.set(account.id, account);
      this.saveConnectedAccounts();

      return account;
    } catch (error) {
      console.error('Gmail auth callback error:', error);
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
            `https://gmail.googleapis.com/gmail/v1/users/${account.email}/messages/${messageRef.id}`,
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
    
    if (messageData.payload.body && messageData.payload.body.data) {
      body = atob(messageData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } else if (messageData.payload.parts) {
      for (const part of messageData.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body && part.body.data) {
          body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
          htmlBody = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      }
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
}

// Export singleton instance
export const gmailService = new GmailIntegrationService();

// Initialize with default configuration
gmailService.initialize({
  clientId: import.meta.env.VITE_GMAIL_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GMAIL_CLIENT_SECRET || '',
  redirectUri: `${window.location.origin}/auth/gmail/callback`,
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.labels'
  ]
});
