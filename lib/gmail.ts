import { google, gmail_v1 } from 'googleapis';

interface GmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  user: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const requiredGmailEnvironmentVariables = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GMAIL_REFRESH_TOKEN',
  'GMAIL_USER',
] as const;

export class GmailConfigurationError extends Error {
  public readonly missingVariables: readonly string[];

  constructor(missingVariables: readonly string[]) {
    super(`Gmail is not configured. Missing: ${missingVariables.join(', ')}`);
    this.name = 'GmailConfigurationError';
    this.missingVariables = missingVariables;
  }
}

class GmailService {
  private oauth2Client: InstanceType<typeof google.auth.OAuth2>;
  private gmail: gmail_v1.Gmail;
  private config: GmailConfig;

  constructor(config: GmailConfig) {
    this.config = config;
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      'https://developers.google.com/oauthplayground'
    );

    this.oauth2Client.setCredentials({
      refresh_token: config.refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.gmail.users.getProfile({ userId: 'me' });
      console.log('Gmail API connection verified successfully');
      return true;
    } catch (error) {
      console.error('Gmail API connection failed:', error);
      return false;
    }
  }

  private createMessage(options: EmailOptions): string {
    const messageParts = [
      `From: ${this.config.user}`,
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="boundary123"',
      '',
      '--boundary123',
      'Content-Type: text/plain; charset=utf-8',
      '',
      options.text || options.html.replace(/<[^>]*>/g, ''),
      '',
      '--boundary123',
      'Content-Type: text/html; charset=utf-8',
      '',
      options.html,
      '',
      '--boundary123--'
    ];

    return messageParts.join('\n');
  }

  private encodeMessage(message: string): string {
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const message = this.createMessage(options);
      const encodedMessage = this.encodeMessage(message);

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log('Email sent successfully:', response.data.id);
      return true;
    } catch (error) {
      console.error('Failed to send email via Gmail:', error);

      // Try to refresh token once if authentication fails
      if (error.code === 401 || error.message?.includes('invalid_grant')) {
        try {
          await this.oauth2Client.refreshAccessToken();

          // Retry once
          const retryResponse = await this.gmail.users.messages.send({
            userId: 'me',
            requestBody: {
              raw: encodedMessage,
            },
          });

          console.log('Email sent successfully after token refresh:', retryResponse.data.id);
          return true;
        } catch (retryError) {
          console.error('Failed to send email after token refresh:', retryError);
          return false;
        }
      }

      return false;
    }
  }
}

// Create Gmail service instance
let gmailService: GmailService | null = null;

export function getGmailService(): GmailService {
  if (!gmailService) {
    const missingVariables = requiredGmailEnvironmentVariables.filter(
      (variable) => !process.env[variable]?.trim()
    );

    if (missingVariables.length > 0) {
      // Do not log values: these environment variables contain credentials.
      console.error(`Gmail service is not configured. Missing: ${missingVariables.join(', ')}`);
      throw new GmailConfigurationError(missingVariables);
    }

    const config = {
      clientId: process.env.GOOGLE_CLIENT_ID!.trim(),
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
      refreshToken: process.env.GMAIL_REFRESH_TOKEN!.trim(),
      user: process.env.GMAIL_USER!.trim(),
    };

    gmailService = new GmailService(config);
  }

  return gmailService;
}

export { GmailService };
export type { EmailOptions };
