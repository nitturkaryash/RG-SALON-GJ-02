import { videoCallService } from './videoCallService';

// Google Meet API Configuration
export const GOOGLE_MEET_CONFIG = {
  clientId: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  apiKey: "YOUR_GOOGLE_API_KEY",
  discoveryDoc: "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  scopes: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar"
};

export interface GoogleMeetEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    email: string;
    displayName?: string;
  }>;
  conferenceData?: {
    entryPoints: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
    conferenceSolution: {
      key: {
        type: string;
      };
    };
    conferenceId: string;
  };
  meetLink?: string;
  location?: string;
}

export interface MeetingScheduleData {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  clientId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  meetingType: 'support' | 'training' | 'consultation' | 'demo';
}

export class GoogleMeetService {
  private static instance: GoogleMeetService;
  private gapi: any = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GoogleMeetService {
    if (!GoogleMeetService.instance) {
      GoogleMeetService.instance = new GoogleMeetService();
    }
    return GoogleMeetService.instance;
  }

  // Initialize Google API
  public async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Load Google API script
      await this.loadGoogleAPI();
      
      await this.gapi.load('client:auth2', async () => {
        await this.gapi.client.init({
          apiKey: GOOGLE_MEET_CONFIG.apiKey,
          clientId: GOOGLE_MEET_CONFIG.clientId,
          discoveryDocs: [GOOGLE_MEET_CONFIG.discoveryDoc],
          scope: GOOGLE_MEET_CONFIG.scopes
        });
        
        this.isInitialized = true;
        console.log('Google Meet API initialized successfully');
      });
    } catch (error) {
      console.error('Error initializing Google Meet API:', error);
      throw new Error('Failed to initialize Google Meet integration');
    }
  }

  // Load Google API script dynamically
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.gapi = window.gapi;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapi = window.gapi;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  // Sign in to Google account
  public async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      if (user.isSignedIn()) {
        console.log('Google authentication successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  // Schedule a Google Meet
  public async scheduleMeeting(meetingData: MeetingScheduleData): Promise<GoogleMeetEvent> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const authInstance = this.gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await this.signIn();
      }

      const event = {
        summary: meetingData.title,
        description: `${meetingData.description}\n\nClient: ${meetingData.clientId}\nPriority: ${meetingData.priority}\nType: ${meetingData.meetingType}`,
        start: {
          dateTime: meetingData.startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: meetingData.endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: meetingData.attendees.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await this.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      });

      const createdEvent = response.result;
      const meetLink = createdEvent.conferenceData?.entryPoints?.find(
        (entry: any) => entry.entryPointType === 'video'
      )?.uri;

      return {
        ...createdEvent,
        meetLink
      } as GoogleMeetEvent;
    } catch (error) {
      console.error('Error scheduling Google Meet:', error);
      throw new Error('Failed to schedule Google Meet');
    }
  }

  // Get upcoming meetings
  public async getUpcomingMeetings(): Promise<GoogleMeetEvent[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const response = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.result.items
        .filter((event: any) => event.conferenceData?.entryPoints)
        .map((event: any) => ({
          ...event,
          meetLink: event.conferenceData?.entryPoints?.find(
            (entry: any) => entry.entryPointType === 'video'
          )?.uri
        }));
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw new Error('Failed to fetch upcoming meetings');
    }
  }

  // Update meeting
  public async updateMeeting(eventId: string, updates: Partial<MeetingScheduleData>): Promise<GoogleMeetEvent> {
    try {
      const event = await this.gapi.client.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      const updatedEvent = {
        ...event.result,
        summary: updates.title || event.result.summary,
        description: updates.description || event.result.description,
        start: updates.startTime ? {
          dateTime: updates.startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        } : event.result.start,
        end: updates.endTime ? {
          dateTime: updates.endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        } : event.result.end,
        attendees: updates.attendees ? 
          updates.attendees.map(email => ({ email })) : 
          event.result.attendees
      };

      const response = await this.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: updatedEvent,
        sendUpdates: 'all'
      });

      return response.result as GoogleMeetEvent;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw new Error('Failed to update meeting');
    }
  }

  // Cancel meeting
  public async cancelMeeting(eventId: string): Promise<void> {
    try {
      await this.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      console.log('Meeting cancelled successfully');
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      throw new Error('Failed to cancel meeting');
    }
  }

  // Generate meeting link for immediate calls
  public generateInstantMeetLink(): string {
    const meetingId = `instant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return `https://meet.google.com/${meetingId}`;
  }

  // Check authentication status
  public isAuthenticated(): boolean {
    if (!this.isInitialized || !this.gapi) return false;
    
    const authInstance = this.gapi.auth2.getAuthInstance();
    return authInstance && authInstance.isSignedIn.get();
  }

  // Sign out
  public async signOut(): Promise<void> {
    try {
      if (this.isAuthenticated()) {
        const authInstance = this.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
        console.log('Google sign-out successful');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}

// Export singleton instance
export const googleMeetService = GoogleMeetService.getInstance();

// Meeting templates for different types
export const MEETING_TEMPLATES = {
  support: {
    title: "Technical Support Session",
    duration: 60, // minutes
    description: "Technical support session to resolve client issues"
  },
  training: {
    title: "Platform Training Session",
    duration: 90,
    description: "Training session for platform features and best practices"
  },
  consultation: {
    title: "Business Consultation",
    duration: 45,
    description: "Business consultation and strategy discussion"
  },
  demo: {
    title: "Product Demo",
    duration: 30,
    description: "Product demonstration and feature overview"
  }
};

// Utility functions
export const meetingUtils = {
  // Format meeting duration
  formatDuration: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  },

  // Generate meeting description
  generateDescription: (type: string, clientName: string, issues?: string[]): string => {
    const template = MEETING_TEMPLATES[type as keyof typeof MEETING_TEMPLATES];
    let description = template.description;
    
    description += `\n\nClient: ${clientName}`;
    
    if (issues && issues.length > 0) {
      description += `\n\nTopics to discuss:\n${issues.map(issue => `• ${issue}`).join('\n')}`;
    }
    
    return description;
  },

  // Calculate optimal meeting time
  suggestMeetingTime: (urgency: string): Date => {
    const now = new Date();
    let suggestedTime = new Date(now);
    
    switch (urgency) {
      case 'urgent':
        suggestedTime.setMinutes(now.getMinutes() + 30); // 30 minutes from now
        break;
      case 'high':
        suggestedTime.setHours(now.getHours() + 2); // 2 hours from now
        break;
      case 'medium':
        suggestedTime.setDate(now.getDate() + 1); // Tomorrow
        suggestedTime.setHours(10, 0, 0, 0); // 10 AM
        break;
      default:
        suggestedTime.setDate(now.getDate() + 3); // 3 days from now
        suggestedTime.setHours(14, 0, 0, 0); // 2 PM
    }
    
    return suggestedTime;
  }
};

export default GoogleMeetService; 