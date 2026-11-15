# Smart Library Management System

A small, in-memory Library Management System built with TypeScript and object-oriented design. It models users, books, and borrowing transactions, and demonstrates the Factory, Singleton, and Observer patterns.

## Features

- Create student and teacher users through `UserFactory`.
- Add users and books to one central `LibrarySystem`.
- Track multiple copies of a book and prevent borrowing when none are available.
- Borrow and return books, keeping transaction history and copy availability in sync.
- View the currently borrowed books and transactions for a user.
- Mark a transaction overdue manually for a simple simulation, or check overdue transactions against a date.
- Notify the borrowing user once when a transaction becomes overdue.
- Run a randomized console demo that chooses a sample student or teacher, a book, and a due date.
- Validate identifiers, dates, duplicate records, and invalid borrowing/return operations.

Data is held in memory; it is reset when the application process ends.

## Requirements

- Node.js 22.18 or later
- npm

## Run the demo

```sh
npm install
npm start
```

`npm start` compiles the TypeScript project and runs a randomized console scenario. It chooses one of three sample users and one of four books, then selects a due date from seven days overdue to twelve days in the future. As a result, the borrower, book, due date, and whether an overdue notification appears can vary each time.

Example output (your results will vary):

```text
Random library scenario for Marcus Chen (teacher):
Due date: 11/12/2026
Borrowed books for Marcus Chen:
- Clean Code by Robert C. Martin
Notifications for Marcus Chen:
- The due date for "Clean Code" has passed.
```

To run the demo after building explicitly:

```sh
npm run build
node dist/index.js
```

## Run tests

```sh
npm test
```

The test command builds the TypeScript source and runs the Node.js test suite.

## Design and subsystems

### User management

- `User` is the abstract base class for common identity fields and notification handling.
- `Student` and `Teacher` specialize `User`.
- Each user has a `role` (`"student"` or `"teacher"`) and exposes received notifications through the read-only `notifications` getter.
- `UserFactory.createUser(role, id, name, email)` constructs the appropriate concrete user.
- Adding a user to the library also subscribes them to overdue notifications.

### Book management

- `Book` keeps its total and available copy counts encapsulated.
- Borrowing and returning copies are performed through `borrowCopy()` and `returnCopy()`.
- The library rejects duplicate book identifiers and unavailable copies.

### Borrowing system

- `BorrowTransaction` records the user, book, borrow date, due date, return date, and overdue state.
- `LibrarySystem.borrowBook()` creates a transaction and reserves a copy.
- `LibrarySystem.returnBook()` closes an active transaction and restores a copy.
- `getBorrowedBooks(userId)` and `getBorrowedTransactions(userId)` return only active loans.
- `checkOverdueTransactions(asOf)` supports date-based overdue checks; `markOverdue(transactionId)` can be used to simulate overdue status.

## Design patterns

- **Factory:** `UserFactory` centralizes creation of `Student` and `Teacher` objects.
- **Singleton:** `LibrarySystem.getInstance()` provides the single central library instance.
- **Observer:** users implement `NotificationObserver`; `NotificationService` notifies a subscribed user when a loan is overdue. A transaction's overdue alert is sent at most once.

## Project structure

```text
src/
  index.ts
  models/
    Book.ts
    BorrowTransaction.ts
    Notification.ts
    User.ts
  services/
    LibrarySystem.ts
    NotificationService.ts
    UserFactory.ts
test/
  library-system.test.js
```

## Example usage

```ts
const library = LibrarySystem.getInstance();
const user = UserFactory.createUser("teacher", "t-1", "Sam Lee", "sam@example.com");
library.addUser(user);
library.addBook(new Book("b-1", "Example Book", "A. Author", 2));

const transaction = library.borrowBook(
  user.id,
  "b-1",
  new Date("2027-01-15T00:00:00Z"),
);

console.log(library.getBorrowedBooks(user.id));
library.markOverdue(transaction.id);
console.log(user.notifications);
library.returnBook(transaction.id);
```
