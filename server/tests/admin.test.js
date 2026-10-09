import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

test('admin endpoints require authentication and are registered', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // Calling /api/admin/users without auth token should return 401
    const resUsers = await fetch(`http://127.0.0.1:${port}/api/admin/users`);
    assert.equal(resUsers.status, 401, 'Admin users endpoint should require auth (401)');

    const resStats = await fetch(`http://127.0.0.1:${port}/api/admin/stats`);
    assert.equal(resStats.status, 401, 'Admin stats endpoint should require auth (401)');

    const resMod = await fetch(`http://127.0.0.1:${port}/api/admin/moderation`);
    assert.equal(resMod.status, 401, 'Admin moderation endpoint should require auth (401)');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
