/** Integration test — health endpoint. */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

// Create a minimal app for testing health endpoint
const app = express();
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

describe('Health endpoint', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
