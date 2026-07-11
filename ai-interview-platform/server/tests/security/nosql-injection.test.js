const request = require('supertest');
const express = require('express');
const { sanitizeMiddleware } = require('../../middleware/sanitizeMiddleware');

const app = express();
app.use(express.json());
app.use(sanitizeMiddleware);

app.post('/test', (req, res) => {
  res.json({ body: req.body });
});

describe('NoSQL Injection Prevention', () => {
  it('should block $where operator in request body', async () => {
    const res = await request(app)
      .post('/test')
      .send({ $where: '1==1', email: 'test@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.body).not.toHaveProperty('$where');
    expect(res.body.body).toHaveProperty('_$where');
    expect(res.body.body.email).toBe('test@test.com');
  });

  it('should block nested $gt operator', async () => {
    const res = await request(app)
      .post('/test')
      .send({ age: { $gt: 21 } });
    expect(res.status).toBe(200);
    expect(res.body.body.age).not.toHaveProperty('$gt');
    expect(res.body.body.age).toHaveProperty('_$gt');
  });

  it('should block $regex operator', async () => {
    const res = await request(app)
      .post('/test')
      .send({ email: { $regex: '.*' } });
    expect(res.status).toBe(200);
    expect(res.body.body.email).toHaveProperty('_$regex');
  });

  it('should allow legitimate request bodies', async () => {
    const res = await request(app)
      .post('/test')
      .send({ email: 'user@test.com', name: 'John', age: 30 });
    expect(res.status).toBe(200);
    expect(res.body.body.email).toBe('user@test.com');
    expect(res.body.body.name).toBe('John');
  });

  it('should handle array of objects', async () => {
    const res = await request(app)
      .post('/test')
      .send({ items: [{ $ne: null }, { id: 1 }] });
    expect(res.status).toBe(200);
    expect(res.body.body.items[0]).toHaveProperty('_$ne');
    expect(res.body.body.items[1].id).toBe(1);
  });

  it('should strip deep query operators', async () => {
    const res = await request(app)
      .post('/test')
      .send({ query: { user: { $in: ['admin'] } } });
    expect(res.status).toBe(200);
    expect(res.body.body.query.user).toHaveProperty('_$in');
  });
});