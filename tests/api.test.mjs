import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../client/node_modules/vite/dist/node/index.js';

test('API attaches current token and clears only rejected protected sessions', async () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  };
  globalThis.window = new EventTarget();
  const server = await createServer({ root: new URL('../client', import.meta.url).pathname, server: { middlewareMode: true } });
  try {
    const { default: API, SESSION_EVENT } = await server.ssrLoadModule('/src/api.js');
    assert.equal(API.defaults.timeout, 15000);
    let sent;
    API.defaults.adapter = async config => {
      sent = config;
      return { status: 200, data: {}, config, headers: {} };
    };
    storage.set('token', 'first');
    await API.get('/api/auth/me');
    assert.equal(sent.headers.Authorization, 'Bearer first');
    storage.set('token', 'second');
    await API.get('/api/posts');
    assert.equal(sent.headers.Authorization, 'Bearer second');
    await API.post('/api/auth/login', {});
    assert.equal(sent.headers.Authorization, undefined);
    let expired = 0;
    window.addEventListener(SESSION_EVENT, () => expired++);
    let status = 401;
    API.defaults.adapter = async config => { throw Object.assign(new Error('Rejected'), { config, response: { status } }); };
    await assert.rejects(API.post('/api/auth/login', {}));
    assert.equal(storage.get('token'), 'second');
    assert.equal(expired, 0);
    status = 503;
    await assert.rejects(API.get('/api/auth/me'));
    assert.equal(storage.get('token'), 'second');
    status = 401;
    await assert.rejects(API.get('/api/posts'));
    assert.equal(storage.get('token'), undefined);
    assert.equal(expired, 1);
  } finally {
    await server.close();
    delete globalThis.localStorage;
    delete globalThis.window;
  }
});
