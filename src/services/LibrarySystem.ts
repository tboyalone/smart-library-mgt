import { Book } from "../models/Book.js";
import { BorrowTransaction } from "../models/BorrowTransaction.js";
import type { User } from "../models/User.js";
import { NotificationService } from "./NotificationService.js";

export class LibrarySystem {
  private static instance: LibrarySystem | undefined;

  private readonly users = new Map<string, User>();
  private readonly books = new Map<string, Book>();
  private readonly transactions = new Map<string, BorrowTransaction>();
  private readonly notificationService = new NotificationService();
  private transactionSequence = 0;

  private constructor() {}

  static getInstance(): LibrarySystem {
    LibrarySystem.instance ??= new LibrarySystem();
    return LibrarySystem.instance;
  }

  addUser(user: User): void {
    if (this.users.has(user.id)) {
      throw new Error(`User "${user.id}" already exists.`);
    }
    this.users.set(user.id, user);
    this.notificationService.subscribe(user.id, user);
  }

  addBook(book: Book): void {
    if (this.books.has(book.id)) {
      throw new Error(`Book "${book.id}" already exists.`);
    }
    this.books.set(book.id, book);
  }

  borrowBook(
    userId: string,
    bookId: string,
    dueDate: Date,
    borrowedAt = new Date(),
  ): BorrowTransaction {
    this.requireUser(userId);
    const book = this.requireBook(bookId);
    book.borrowCopy();

    try {
      const transaction = new BorrowTransaction(
        `transaction-${++this.transactionSequence}`,
        userId,
        bookId,
        borrowedAt,
        dueDate,
      );
      this.transactions.set(transaction.id, transaction);
      return transaction;
    } catch (error) {
      book.returnCopy();
      throw error;
    }
  }

  returnBook(transactionId: string, returnedAt = new Date()): BorrowTransaction {
    const transaction = this.requireTransaction(transactionId);
    const book = this.requireBook(transaction.bookId);

    transaction.returnBook(returnedAt);
    book.returnCopy();
    return transaction;
  }

  getBorrowedBooks(userId: string): Book[] {
    this.requireUser(userId);
    return [...this.transactions.values()]
      .filter(
        (transaction) =>
          transaction.userId === userId && !transaction.isReturned,
      )
      .map((transaction) => this.requireBook(transaction.bookId));
  }

  getBorrowedTransactions(userId: string): BorrowTransaction[] {
    this.requireUser(userId);
    return [...this.transactions.values()].filter(
      (transaction) =>
        transaction.userId === userId && !transaction.isReturned,
    );
  }

  getUsers(): User[] {
    return [...this.users.values()];
  }

  getBooks(): Book[] {
    return [...this.books.values()];
  }

  getTransactions(): BorrowTransaction[] {
    return [...this.transactions.values()];
  }

  markOverdue(transactionId: string): BorrowTransaction {
    const transaction = this.requireTransaction(transactionId);
    transaction.markOverdue();
    this.notifyIfOverdue(transaction);
    return transaction;
  }

  checkOverdueTransactions(asOf = new Date()): BorrowTransaction[] {
    const overdueTransactions: BorrowTransaction[] = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.isReturned || !transaction.isOverdueAt(asOf)) {
        continue;
      }
      overdueTransactions.push(transaction);
      this.notifyIfOverdue(transaction, asOf);
    }
    return overdueTransactions;
  }

  private notifyIfOverdue(
    transaction: BorrowTransaction,
    asOf = new Date(),
  ): void {
    if (
      !transaction.isOverdueAt(asOf) ||
      !transaction.markOverdueNotificationSent()
    ) {
      return;
    }
    const book = this.requireBook(transaction.bookId);
    this.notificationService.notify(
      transaction.userId,
      `The due date for "${book.title}" has passed.`,
    );
  }

  private requireUser(userId: string): User {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User "${userId}" was not found.`);
    }
    return user;
  }

  private requireBook(bookId: string): Book {
    const book = this.books.get(bookId);
    if (!book) {
      throw new Error(`Book "${bookId}" was not found.`);
    }
    return book;
  }

  private requireTransaction(transactionId: string): BorrowTransaction {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction "${transactionId}" was not found.`);
    }
    return transaction;
  }
}
