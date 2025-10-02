"use strict"
// check-env.js
// ローカルで実行する場合は .env.local を読み込む
function loadEnvLocal() {
  try {
    // まず dotenv があれば使う
    const dotenv = require('dotenv')
    dotenv.config({ path: '.env.local' })
    return
  } catch (e) {
    // dotenv が無い場合は自前でパースする
  }

  const fs = require('fs')
  const path = '.env.local'
  if (!fs.existsSync(path)) return
  try {
    const raw = fs.readFileSync(path, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const eq = trimmed.indexOf('=')
      if (eq === -1) return
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      // remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = val
    })
  } catch (err) {
    // ignore parse errors
  }
}

loadEnvLocal()
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
