'use strict';

const fs = require('fs');
const path = require('path');

const SHEET_URL = process.env.SHEET_URL || 'https://script.google.com/macros/s/AKfycbxEBqRF5o1O50-HCIZUE6YuHrw6rCO5o-R7id8-Lf7HOpZW2AAqO9jfb_98q34yWE1ocg/exec';
const SHEET_TOKEN = process.env.SHEET_TOKEN || 'aB3k9XmQ7vP1wZ5rN8tY2uL4';
const SHEET_TIMEOUT_MS = 15000;

const LIMITS = { name: 60, email: 120, wish: 500 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

function readLocalWishes() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'wishes.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const list = JSON.parse(content);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {}
  return [];
}

async function pushToSheet(entry) {
  if (!SHEET_URL) return { ok: false, error: 'No SHEET_URL configured' };
  try {
    const res = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: SHEET_TOKEN, name: entry.name, email: entry.email, wish: entry.wish }),
      redirect: 'follow',
      signal: AbortSignal.timeout(SHEET_TIMEOUT_MS),
    });
    return await res.json().catch(() => ({}));
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const wishes = readLocalWishes().slice(0, 50).map(({ name, wish, time }) => ({ name, wish, time }));
    return res.status(200).json(wishes);
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Dữ liệu không đúng định dạng JSON.' });
      }
    }
    body = body || {};

    const name = clean(body.name, LIMITS.name);
    const email = clean(body.email, LIMITS.email).toLowerCase();
    const wish = clean(body.wish, LIMITS.wish);

    if (!name) return res.status(400).json({ error: 'Vui lòng nhập họ tên.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Email chưa đúng định dạng.' });
    if (!wish) return res.status(400).json({ error: 'Vui lòng nhập lời chúc.' });

    const entry = {
      id: Date.now().toString(36),
      name,
      email,
      wish,
      time: Date.now(),
    };

    await pushToSheet(entry);

    return res.status(201).json({
      ok: true,
      name: entry.name,
      wish: entry.wish,
      time: entry.time,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
