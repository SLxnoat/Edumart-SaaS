import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

test('server health endpoint returns OK', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'edumart-server');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('root API endpoint returns welcome payload', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.message, 'Welcome to the EduMart API');
    assert.equal(body.version, 'v1');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
