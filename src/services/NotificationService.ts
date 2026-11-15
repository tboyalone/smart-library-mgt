import type { Notification, NotificationObserver } from "../models/Notification.js";

export class NotificationService {
  private readonly observers = new Map<string, NotificationObserver>();

  subscribe(userId: string, observer: NotificationObserver): void {
    this.observers.set(userId, observer);
  }

  notify(userId: string, message: string): void {
    const observer = this.observers.get(userId);
    if (!observer) {
      throw new Error(`No notification subscriber found for user "${userId}".`);
    }

    const notification: Notification = {
      message,
      createdAt: new Date(),
    };
    observer.update(notification);
  }
}
