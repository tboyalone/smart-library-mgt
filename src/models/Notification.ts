export interface Notification {
  readonly message: string;
  readonly createdAt: Date;
}

export interface NotificationObserver {
  update(notification: Notification): void;
}
