import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Book } from '../entities/book.entity'

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookService: Repository<Book>
  )
  {}

  async createBook(book: { title; isbn }): Promise<Book> {
    try {
      const isbnRegex = /^\d{3}-?\d{1,5}-?\d{1,7}-?\d{1,7}-?\d{1,7}-?(\d|X)$/i
      if (!book || !book.title || !book.isbn || !isbnRegex.test(book.isbn)) {
        throw new BadRequestException('Invalid title or ISBN number');
      }
      const existsBook = await this.bookService.findOne({
        where: {
          isbn: book?.isbn,
        },
      })
      if (existsBook) {
        throw new HttpException('Book already exists', HttpStatus.CONFLICT)
      }
      return this.bookService.save(book)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findAllBooks(): Promise<Book[]> {
    try {
      return this.bookService.find()
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findBookById(id: number): Promise<Book> {
    try {
      const getBook = await this.bookService.findOne({
        where: {
          id,
        },
      })
      if (!getBook) {
        throw new NotFoundException('Book not found')
      }
      return getBook
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateBook(id: number, book: Book): Promise<void> {
    try {
      const getBook = await this.findBookById(id)

      if (!getBook) {
        throw new NotFoundException('Book not found')
      }
      const updatedBook = await this.bookService.update(id, {
        title: book?.title,
      })

      if (updatedBook?.affected == 1) {
        throw new HttpException('Book updated successfully', HttpStatus.OK)
      } else {
        throw new HttpException(
          'Something went to wrong while updating the book',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async deleteBook(id: number): Promise<void> {
    try {
      const book = await this.findBookById(id)

      if (!book) {
        throw new NotFoundException('Book not found')
      }

      const isDelete = await this.bookService.softDelete(id)
      if (isDelete?.affected == 1) {
        throw new HttpException('Book deleted successfully', HttpStatus.OK)
      } else {
        throw new HttpException(
          'Something went to wrong while deleting the book',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
