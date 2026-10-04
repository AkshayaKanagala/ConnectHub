// Run with a local Vite server and Playwright installed: node tests/login.browser.cjs
const assert = require('node:assert/strict');
const { chromium } = require(require.resolve('playwright', {
  paths: [process.cwd(), process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean),
}));
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let mode = 'success';
  let loginBody;
  const user = { id: 'user1', _id: 'user1', name: 'Test Member', email: 'member@example.com' };
  await page.route('http://localhost:5000/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (mode === 'offline') return route.abort('failed');
    if (path === '/api/auth/login') {
      loginBody = request.postDataJSON();
      if (mode === 'bad') return route.fulfill({ status: 401, headers, json: { message: 'Invalid email or password' } });
      if (mode === 'malformed') return route.fulfill({ headers, json: { success: true, user } });
      return route.fulfill({ headers, json: { success: true, token: 'test-token', user } });
    }
    assert.equal(request.headers().authorization, 'Bearer test-token');
    if (mode === 'expired') return route.fulfill({ status: 401, headers, json: { message: 'Expired' } });
    if (mode === 'unavailable') return route.fulfill({ status: 503, headers, json: { message: 'Unavailable' } });
    return route.fulfill({ headers, json: path === '/api/auth/me' ? { success: true, user } : { success: true, posts: [] } });
  });
  const base = process.env.CLIENT_URL || 'http://127.0.0.1:5173';
  const submit = async () => {
    await page.locator('#email').fill('MEMBER@example.com');
    await page.locator('#password').fill('secret123');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
  };
  await page.goto(`${base}/profile`);
  await page.waitForURL('**/login');
  mode = 'bad'; await submit();
  await page.getByRole('alert').filter({ hasText: 'Invalid email or password' }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);
  mode = 'offline'; await submit();
  await page.getByRole('alert').filter({ hasText: 'Unable to reach' }).waitFor();
  mode = 'malformed'; await submit();
  await page.getByRole('alert').filter({ hasText: 'invalid login response' }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);
  mode = 'success'; await submit();
  await page.waitForURL('**/profile');
  assert.deepEqual(loginBody, { email: 'member@example.com', password: 'secret123' });
  await page.getByText('Signed in as Test Member').waitFor();
  await page.reload(); await page.getByText('Signed in as Test Member').waitFor();
  mode = 'unavailable'; await page.reload();
  await page.getByRole('button', { name: 'Retry', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('token')), 'test-token');
  mode = 'success'; await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.getByText('Signed in as Test Member').waitFor();
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await page.waitForURL('**/login');
  assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);
  await page.goto(`${base}/feed`); await page.waitForURL('**/login');
  mode = 'success'; await submit(); await page.waitForURL('**/feed');
  mode = 'expired'; await page.reload(); await page.waitForURL('**/login');
  assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);
  console.log('PASS: route protection, login errors, response validation, normalized credentials, Bearer headers, return route, reload, retry, logout, expired session');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
