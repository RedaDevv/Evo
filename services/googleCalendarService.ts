
export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  htmlLink?: string;
}

export const googleCalendarService = {
  /**
   * Lists events from the primary Google Calendar for a given rate.
   */
  async listEvents(accessToken: string, timeMin: string, timeMax: string): Promise<GoogleCalendarEvent[]> {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Calendar error listing events:', errText);
      throw new Error(`Erreur lors de la récupération des événements Google Calendar: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.items || []) as GoogleCalendarEvent[];
  },

  /**
   * Creates a new event in the primary Google Calendar.
   */
  async createEvent(accessToken: string, event: Omit<GoogleCalendarEvent, 'id'>): Promise<GoogleCalendarEvent> {
    const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Calendar error creating event:', errText);
      throw new Error(`Erreur lors de la création de l'événement Google Calendar: ${response.statusText}`);
    }

    return await response.json() as GoogleCalendarEvent;
  },

  /**
   * Deletes an event in the primary Google Calendar.
   */
  async deleteEvent(accessToken: string, eventId: string): Promise<void> {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Calendar error deleting event:', errText);
      throw new Error(`Erreur lors de la suppression de l'événement Google Calendar: ${response.statusText}`);
    }
  }
};
