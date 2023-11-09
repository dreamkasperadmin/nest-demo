import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { Book } from '../entities/book.entity'
import { BookService } from '../services/book.service'

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('/add')
  async create(@Body() book: Book): Promise<Book> {
    const payload = {
      title: book.title,
      isbn: book.isbn
    }

    return this.bookService.createBook(payload)
  }

  @Get()
  async findAll(): Promise<Book[]> {
    return this.bookService.findAllBooks()
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<Book> {
    return this.bookService.findBookById(id)
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() book: Book): Promise<void> {
    await this.bookService.updateBook(id, book)
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.bookService.deleteBook(id)
  }
}
