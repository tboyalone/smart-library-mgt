import assert from "node:assert/strict";
import test from "node:test";
import { Book } from "../dist/models/Book.js";
import { LibrarySystem } from "../dist/services/LibrarySystem.js";
import { UserFactory } from "../dist/services/UserFactory.js";

let testSequence = 0;

function createLibraryFixture() {
  const library = LibrarySystem.getInstance();
  const suffix = ++testSequence;
  const user = UserFactory.createUser(
    "student",
    `student-${suffix}`,
    "Test Student",
    `student-${suffix}@example.com`,
  );
  const book = new Book(`book-${suffix}`, "Test Book", "Test Author", 2);
  library.addUser(user);
  library.addBook(book);
  return { library, user, book };
}

test("borrowing reduces availability and returning restores it", () => {
  const { library, user, book } = createLibraryFixture();
  const borrowedAt = new Date("2026-01-01T10:00:00Z");
  const dueDate = new Date("2026-01-15T10:00:00Z");
  const transaction = library.borrowBook(user.id, book.id, dueDate, borrowedAt);

  assert.equal(book.availableCopies, 1);
  assert.deepEqual(library.getBorrowedBooks(user.id), [book]);

  library.returnBook(transaction.id, new Date("2026-01-10T10:00:00Z"));
  assert.equal(book.availableCopies, 2);
  assert.deepEqual(library.getBorrowedBooks(user.id), []);
});

test("overdue notifications are sent once to the borrowing user", () => {
  const { library, user, book } = createLibraryFixture();
  const transaction = library.borrowBook(
    user.id,
    book.id,
    new Date("2026-01-02T10:00:00Z"),
    new Date("2026-01-01T10:00:00Z"),
  );

  library.markOverdue(transaction.id);
  library.markOverdue(transaction.id);

  assert.equal(transaction.isOverdue, true);
  assert.equal(user.notifications.length, 1);
  assert.match(user.notifications[0].message, /Test Book/);
});

test("overdue checks use the supplied date", () => {
  const { library, user, book } = createLibraryFixture();
  const transaction = library.borrowBook(
    user.id,
    book.id,
    new Date("2027-01-02T10:00:00Z"),
    new Date("2027-01-01T10:00:00Z"),
  );

  const atDueDate = library.checkOverdueTransactions(
    new Date("2027-01-02T10:00:00Z"),
  );
  assert.equal(atDueDate.includes(transaction), false);
  assert.equal(user.notifications.length, 0);

  const afterDueDate = library.checkOverdueTransactions(
    new Date("2027-01-03T10:00:00Z"),
  );
  assert.equal(afterDueDate.includes(transaction), true);
  assert.equal(user.notifications.length, 1);
});

test("borrowing fails when no copies are available", () => {
  const { library, user, book } = createLibraryFixture();
  library.borrowBook(
    user.id,
    book.id,
    new Date("2027-01-15T10:00:00Z"),
    new Date("2027-01-01T10:00:00Z"),
  );
  library.borrowBook(
    user.id,
    book.id,
    new Date("2027-01-16T10:00:00Z"),
    new Date("2027-01-02T10:00:00Z"),
  );

  assert.throws(
    () =>
      library.borrowBook(
        user.id,
        book.id,
        new Date("2027-01-17T10:00:00Z"),
        new Date("2027-01-03T10:00:00Z"),
      ),
    /No copies/,
  );
  assert.equal(book.availableCopies, 0);
});
