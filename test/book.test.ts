import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { BookService } from '../src/modules/Book/services/book.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../src/modules/Book/entities/book.entity';

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('BookController (e2e)', () => {
  let app: INestApplication;
  let bookService: BookService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        BookService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    bookService = moduleFixture.get<BookService>(BookService);
    await app.init();
  });

  let id

  it('/book/add (POST) should create Book', async () => {
    mockRepository.save.mockReturnValueOnce({ title: 'Test Book', isbn: '123-456-789' });

    const response = await request(app.getHttpServer())
      .post('/book/add')
      .send({ title: 'Test Book', isbn: '123-456-789' })
      .expect(HttpStatus.CREATED);

    const res = JSON.parse(response.text)
    id = res?.id

    expect(response.body.title).toEqual('Test Book');
  });

  it('/book/add (POST) should throw BadRequestException for an invalid ISBN', async () => {
    const response = await request(app.getHttpServer())
      .post('/book/add')
      .send({ title: 'Test Book', isbn: 'asd-aa' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/book/add (POST) should throw Exception for already exists book', async () => {
    mockRepository.save.mockReturnValueOnce({ title: 'Test Book', isbn: '123-456-789' });

    await request(app.getHttpServer())
      .post('/book/add')
      .send({ title: 'Test Book', isbn: '123-456-789' })
      .expect(HttpStatus.CONFLICT);
  });

  it('/book/:id (GET) should return a book by ID', async () => {
    const mockBook = { id, title: 'Test Book', isbn: '123-456-789' };
    mockRepository.findOne.mockReturnValueOnce(mockBook);

    await request(app.getHttpServer())
      .get(`/book/${id}`)
      .expect(HttpStatus.OK);
  });

  it('/book/:id should throw NotFoundException for a non-existing book', async () => {
    const bookId = 0;
    await request(app.getHttpServer())
      .get(`/book/${bookId}`)
      .expect(HttpStatus.NOT_FOUND)
  });

  it('/book (GET) should retrun get all books', async () => {
    const response = await request(app.getHttpServer())
      .get('/book')
      .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
  });

  it('/book/:id should update the title of book', async () => {
    const updatedBook = { title: 'Updated Book' };
    mockRepository.update.mockReturnValueOnce({ affected: 1 });

    const response = await request(app.getHttpServer())
      .put(`/book/${id}`)
      .send(updatedBook)
      .expect(HttpStatus.OK);

    const responseBody = JSON.parse(response.text);
    expect(responseBody.message).toEqual('Book updated successfully');
  });

  it('/book/:id should delete(soft delete) the book', async () => {
    mockRepository.softDelete.mockReturnValueOnce({ affected: 1 });

    const response = await request(app.getHttpServer())
      .delete(`/book/${id}`)
      .expect(HttpStatus.OK);

    const responseBody = JSON.parse(response.text);
    expect(responseBody.message).toEqual('Book deleted successfully');
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});



