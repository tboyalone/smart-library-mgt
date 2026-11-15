import type { Notification, NotificationObserver } from "./Notification.js";

export type UserRole = "student" | "teacher";

export abstract class User implements NotificationObserver {
  private readonly receivedNotifications: Notification[] = [];
  abstract readonly role: UserRole;

  readonly id: string;
  readonly name: string;
  readonly email: string;

  protected constructor(id: string, name: string, email: string) {
    if (!id.trim() || !name.trim() || !email.trim()) {
      throw new Error("User id, name, and email are required.");
    }
    this.id = id;
    this.name = name;
    this.email = email;
  }

  get notifications(): readonly Notification[] {
    return [...this.receivedNotifications];
  }

  update(notification: Notification): void {
    this.receivedNotifications.push(notification);
  }
}

export class Student extends User {
  readonly role = "student" as const;

  constructor(id: string, name: string, email: string) {
    super(id, name, email);
  }
}

export class Teacher extends User {
  readonly role = "teacher" as const;

  constructor(id: string, name: string, email: string) {
    super(id, name, email);
  }
}
