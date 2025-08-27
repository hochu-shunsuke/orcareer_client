#!/usr/bin/env node
"use strict"
// check-env.js
// 環境変数の存在をビルド前に検証する簡易スクリプト
const required = [
  'APP_BASE_URL',
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_SECRET'
]

const missing = required.filter((k) => !process.env[k])
if (missing.length) {
  console.error('[check-env] Missing required environment variables: ' + missing.join(', '))
  console.error('Copy .env.example to .env.local and fill these values.')
  process.exit(1)
}

// Basic sanity check for AUTH0_DOMAIN (should not include protocol)
if (process.env.AUTH0_DOMAIN && process.env.AUTH0_DOMAIN.match(/^https?:\/\//)) {
  console.error('[check-env] AUTH0_DOMAIN must not include protocol (http:// or https://).')
  console.error("Use only the host portion, e.g. your-tenant.us.auth0.com")
  process.exit(1)
}

console.log('[check-env] All required env vars present')
