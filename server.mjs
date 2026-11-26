import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root = resolve('.');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8' };

function loadEnv() {
  const env = { ...process.env };
  for (const name of ['.env', '.env.local']) {
    const path = resolve(root, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return env;
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 64_000) reject(new Error('Body too large')); });
    req.on('end', () => resolveBody(raw));
    req.on('error', reject);
  });
}

const env = loadEnv();
const DEEPSEEK_BASE = (env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');
const DEEPSEEK_MODEL = env.DEEPSEEK_MODEL || 'deepseek-flash';

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/ai/status' && req.method === 'GET') {
    return json(res, 200, { available: Boolean(env.DEEPSEEK_API_KEY), model: DEEPSEEK_MODEL, provider: 'DeepSeek' });
  }
  if (url.pathname === '/api/ai/chat' && req.method === 'POST') {
    if (!env.DEEPSEEK_API_KEY) return json(res, 503, { error: '本地未配置 DEEPSEEK_API_KEY' });
    try {
      const payload = JSON.parse(await readBody(req));
      const messages = Array.isArray(payload.messages) ? payload.messages.slice(0, 6) : [];
      const upstream = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages,
          thinking: { type: 'disabled' },
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 450
        })
      });
      const text = await upstream.text();
      res.writeHead(upstream.status, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(text);
    } catch (error) {
      return json(res, 502, { error: error.message || '上游请求失败' });
    }
  }
  try {
    const pathname = decodeURIComponent(url.pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(Number(env.PORT || 5173), '0.0.0.0', () => console.log(`Lunch demo: http://localhost:${env.PORT || 5173} (DeepSeek proxy: ${env.DEEPSEEK_API_KEY ? 'ready' : 'off'})`));
