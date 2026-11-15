export class BorrowTransaction {
  private returnedAtValue: Date | null = null;
  private manuallyOverdue = false;
  private overdueNotificationSent = false;
  readonly id: string;
  readonly userId: string;
  readonly bookId: string;
  readonly borrowedAt: Date;
  readonly dueDate: Date;

  constructor(
    id: string,
    userId: string,
    bookId: string,
    borrowedAt: Date,
    dueDate: Date,
  ) {
    if (dueDate.getTime() <= borrowedAt.getTime()) {
      throw new Error("The due date must be after the borrow date.");
    }
    this.id = id;
    this.userId = userId;
    this.bookId = bookId;
    this.borrowedAt = borrowedAt;
    this.dueDate = dueDate;
  }

  get returnedAt(): Date | null {
    return this.returnedAtValue;
  }

  get isReturned(): boolean {
    return this.returnedAtValue !== null;
  }

  get isOverdue(): boolean {
    return this.isOverdueAt(new Date());
  }

  isOverdueAt(asOf: Date): boolean {
    return (
      this.manuallyOverdue ||
      (!this.isReturned && asOf.getTime() > this.dueDate.getTime())
    );
  }

  returnBook(returnedAt: Date): void {
    if (this.isReturned) {
      throw new Error(`Transaction "${this.id}" has already been returned.`);
    }
    if (returnedAt.getTime() < this.borrowedAt.getTime()) {
      throw new Error("The return date cannot be before the borrow date.");
    }
    this.returnedAtValue = returnedAt;
  }

  markOverdue(): void {
    if (this.isReturned) {
      throw new Error(`Transaction "${this.id}" has already been returned.`);
    }
    this.manuallyOverdue = true;
  }

  markOverdueNotificationSent(): boolean {
    if (this.overdueNotificationSent) {
      return false;
    }
    this.overdueNotificationSent = true;
    return true;
  }
}
