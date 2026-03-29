
export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  public getPermission(): NotificationPermission {
    return this.permission;
  }

  public sendNotification(title: string, options?: NotificationOptions) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (this.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico', // Fallback icon
          ...options
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }

  public async testNotification() {
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return;
      }
    }

    this.sendNotification('Test Notification', {
      body: 'Ceci est une notification de test de Evo ! 🚀',
      tag: 'test-notification'
    });
  }
}

export const notificationService = NotificationService.getInstance();
