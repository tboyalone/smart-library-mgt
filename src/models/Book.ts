export class Book {
  private copiesAvailable: number;
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly totalCopies: number;

  constructor(
    id: string,
    title: string,
    author: string,
    totalCopies = 1,
  ) {
    if (!id.trim() || !title.trim() || !author.trim()) {
      throw new Error("Book id, title, and author are required.");
    }
    if (!Number.isInteger(totalCopies) || totalCopies < 1) {
      throw new Error("A book must have at least one copy.");
    }

    this.id = id;
    this.title = title;
    this.author = author;
    this.totalCopies = totalCopies;
    this.copiesAvailable = totalCopies;
  }

  get availableCopies(): number {
    return this.copiesAvailable;
  }

  borrowCopy(): void {
    if (this.copiesAvailable === 0) {
      throw new Error(`No copies of "${this.title}" are available.`);
    }
    this.copiesAvailable -= 1;
  }

  returnCopy(): void {
    if (this.copiesAvailable >= this.totalCopies) {
      throw new Error(`All copies of "${this.title}" are already in the library.`);
    }
    this.copiesAvailable += 1;
  }
}
