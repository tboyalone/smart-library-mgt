import { Book } from "./models/Book.js";
import type { UserRole } from "./models/User.js";
import { LibrarySystem } from "./services/LibrarySystem.js";
import { UserFactory } from "./services/UserFactory.js";

interface UserProfile {
  readonly role: UserRole;
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

interface BookDetails {
  readonly id: string;
  readonly title: string;
  readonly author: string;
}

function chooseRandom<T>(items: readonly T[]): T {
  const item = items[Math.floor(Math.random() * items.length)];
  if (item === undefined) {
    throw new Error("Cannot choose an item from an empty list.");
  }
  return item;
}

const userProfiles: readonly UserProfile[] = [
  {
    role: "student",
    id: "student-001",
    name: "Amina Yusuf",
    email: "amina@example.com",
  },
  {
    role: "teacher",
    id: "teacher-001",
    name: "Marcus Chen",
    email: "marcus@example.com",
  },
  {
    role: "student",
    id: "student-002",
    name: "Sofia Patel",
    email: "sofia@example.com",
  },
];

const bookCatalog: readonly BookDetails[] = [
  {
    id: "book-001",
    title: "The Pragmatic Programmer",
    author: "David Thomas and Andrew Hunt",
  },
  {
    id: "book-002",
    title: "Clean Code",
    author: "Robert C. Martin",
  },
  {
    id: "book-003",
    title: "The Hobbit",
    author: "J. R. R. Tolkien",
  },
  {
    id: "book-004",
    title: "Pride and Prejudice",
    author: "Jane Austen",
  },
];

const library = LibrarySystem.getInstance();
const profile = chooseRandom(userProfiles);
const bookDetails = chooseRandom(bookCatalog);
const user = UserFactory.createUser(
  profile.role,
  profile.id,
  profile.name,
  profile.email,
);
const book = new Book(bookDetails.id, bookDetails.title, bookDetails.author);
const borrowedAt = new Date();
const dueDateOffsetDays = Math.floor(Math.random() * 20) - 7;
const dueDate = new Date(borrowedAt);
dueDate.setDate(dueDate.getDate() + dueDateOffsetDays);
const dueDateFrom = new Date(borrowedAt);
dueDateFrom.setDate(dueDateFrom.getDate() - 14);

library.addUser(user);
library.addBook(book);

const transaction = library.borrowBook(
  user.id,
  book.id,
  dueDate,
  dueDateFrom,
);

console.log(`Random library scenario for ${user.name} (${user.role}):`);
console.log(`Due date: ${transaction.dueDate.toLocaleDateString()}`);
console.log(`Borrowed books for ${user.name}:`);
for (const book of library.getBorrowedBooks(user.id)) {
  console.log(`- ${book.title} by ${book.author}`);
}

library.checkOverdueTransactions();
console.log(`Notifications for ${user.name}:`);
if (user.notifications.length === 0) {
  console.log("- No overdue notifications.");
}
for (const notification of user.notifications) {
  console.log(`- ${notification.message}`);
}
