/**
 * Integration tests — IDs align with docs/TESTING_PLAN.md (IT-xx-TV).
 */
const request = require('supertest');

jest.mock('../models/User', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../DatabaseManager', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  getAllBooks: jest.fn(),
  getBookById: jest.fn(),
  addBook: jest.fn(),
  updateBook: jest.fn(),
  deleteBook: jest.fn(),
}));

const app = require('../app');
const dataBaseManager = require('../DatabaseManager');
const User = require('../models/User');

describe('API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dataBaseManager.getAllBooks.mockResolvedValue([
      { _id: '507f1f77bcf86cd799439011', title: 'Dune', author: 'Frank Herbert' },
    ]);
    dataBaseManager.getBookById.mockResolvedValue(null);
  });

  test('IT-01-TB: GET / — health', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('running');
  });

  test('IT-02-OB: POST /api/auth/login — validation (no DB)', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('IT-03-OB: POST /api/auth/signup — ignores client role, always user', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test',
      email: 't@t.com',
      role: 'user',
      toObject: function () {
        return { _id: this._id, name: this.name, email: this.email, role: this.role };
      },
    });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test',
        email: 't@t.com',
        password: 'secret1',
        role: 'admin',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user',
      })
    );
  });

  test('IT-04-CB: GET /api/auth/me — missing Authorization', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('IT-05-CB: GET /api/auth/me — invalid JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-jwt');
    expect(res.status).toBe(401);
  });

  test('IT-06-TB: GET /api/books — Express + DatabaseManager', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe('Dune');
    expect(dataBaseManager.getAllBooks).toHaveBeenCalled();
  });

  // Empty List Test
  test('IT-08-OB: GET /api/books — empty list', async () => {
    dataBaseManager.getAllBooks.mockResolvedValue([]);

    const res = await request(app).get('/api/books');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

});
