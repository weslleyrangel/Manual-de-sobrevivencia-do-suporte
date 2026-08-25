const request = require('supertest');
const app = require('../src/app');

describe('App endpoints', () => {
    it('should return 200 OK from /health', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
});
