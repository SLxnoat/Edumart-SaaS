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

test('chatbot endpoints are registered', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // Test that the chatbot endpoint is registered (will return 400 without proper data)
    const response = await fetch(`http://127.0.0.1:${port}/api/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test', sessionId: 'test-session' })
    });

    // Should return either 200 (success) or 400/500 (validation/error) but not 404 (not found)
    assert.notEqual(response.status, 404, 'Chatbot endpoint should be registered');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
