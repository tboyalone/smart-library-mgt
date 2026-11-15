import { Student, Teacher, type User, type UserRole } from "../models/User.js";

export class UserFactory {
  static createUser(
    role: UserRole,
    id: string,
    name: string,
    email: string,
  ): User {
    switch (role) {
      case "student":
        return new Student(id, name, email);
      case "teacher":
        return new Teacher(id, name, email);
      default: {
        const unsupportedRole: never = role;
        throw new Error(`Unsupported user role: ${unsupportedRole}`);
      }
    }
  }
}
