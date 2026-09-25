import { spawn } from 'child_process'
import { mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { setTimeout as delay } from 'timers/promises'
import axios from 'axios'

const EDGE =
  process.env.EDGE_PATH ||
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const PORT = 9334
const BASE = 'http://localhost:5173'

let cdpId = 1

function sendCdp(ws, method, params = {}) {
  const id = cdpId
  cdpId += 1
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener('message', onMessage)
      reject(new Error(`CDP timeout: ${method}`))
    }, 10000)

    function onMessage(event) {
      const message = JSON.parse(event.data)
      if (message.id !== id) {
        return
      }
      clearTimeout(timer)
      ws.removeEventListener('message', onMessage)
      if (message.error) {
        reject(new Error(JSON.stringify(message.error)))
      } else {
        resolve(message.result)
      }
    }

    ws.addEventListener('message', onMessage)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function waitFor(ws, expression, timeoutMs = 15000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const value = await evaluate(ws, expression)
    if (value) {
      return value
    }
    await delay(250)
  }
  const currentHref = await evaluate(ws, 'location.href')
  const bodyText = await evaluate(ws, 'document.body.innerText')
  console.log('DEBUG TIMEOUT HREF:', currentHref)
  console.log('DEBUG TIMEOUT BODY:', bodyText)
  throw new Error(`Timed out waiting for: ${expression}`)
}

async function evaluate(ws, expression) {
  const result = await sendCdp(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  return result.result?.value
}

function waitEvent(ws, method, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener('message', onMessage)
      reject(new Error(`Timed out waiting for event ${method}`))
    }, timeoutMs)

    function onMessage(event) {
      const message = JSON.parse(event.data)
      if (message.method === method) {
        clearTimeout(timer)
        ws.removeEventListener('message', onMessage)
        resolve(message.params)
      }
    }

    ws.addEventListener('message', onMessage)
  })
}

async function waitForJson(url) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const { data } = await axios.get(url, { timeout: 500 })
      return data
    } catch {
      await delay(150)
    }
  }
  throw new Error(`Could not reach ${url}`)
}

const profileDir = mkdtempSync(join(tmpdir(), 'nexgensis-edge-'))
const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--disable-sync',
    '--disable-features=Sync,Translate',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    `${BASE}/login`,
  ],
  { stdio: 'ignore' },
)

let ws

try {
  const version = await waitForJson(`http://127.0.0.1:${PORT}/json/version`)
  const targets = await waitForJson(`http://127.0.0.1:${PORT}/json/list`)
  const pageTarget =
    targets.find((target) => target.url && target.url.includes('localhost:5173')) ||
    targets.find((target) => target.type === 'page')
  ws = new WebSocket(pageTarget.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve)
    ws.addEventListener('error', reject)
  })

  await sendCdp(ws, 'Runtime.enable')
  await sendCdp(ws, 'Page.enable')
  const loaded = waitEvent(ws, 'Page.loadEventFired')
  await sendCdp(ws, 'Page.navigate', { url: `${BASE}/login` })
  await loaded
  await delay(500)
  console.log('href', await evaluate(ws, 'location.href'))

  const login = await axios.post('https://dummyjson.com/auth/login', {
    username: 'emilys',
    password: 'emilyspass',
  })
  const user = {
    id: login.data.id,
    username: login.data.username,
    email: login.data.email,
    firstName: login.data.firstName,
    lastName: login.data.lastName,
    image: login.data.image,
  }

  await waitFor(
    ws,
    `document.querySelector('#username') && document.querySelector('#username').name === 'username'`,
  )

  await evaluate(
    ws,
    `localStorage.setItem('authToken', ${JSON.stringify(login.data.accessToken)});
     localStorage.setItem('authUser', ${JSON.stringify(JSON.stringify(user))});
     true;`,
  )

  async function go(path) {
    await sendCdp(ws, 'Page.navigate', { url: `${BASE}${path}` })
    await delay(300)
  }

  async function snapshot() {
    return evaluate(
      ws,
      `({
        href: location.href,
        text: document.body.innerText,
        hasTable: Boolean(document.querySelector('table') && document.querySelector('table').offsetParent !== null),
        cardCount: document.querySelectorAll('article').length,
        width: document.documentElement.clientWidth,
      })`,
    )
  }

  await go('/products?page=2&limit=20')
  await waitFor(ws, `document.body.innerText.includes('Showing 21')`)
  let state = await snapshot()
  if (!state.href.includes('page=2') || !state.href.includes('limit=20')) {
    throw new Error(`Expected page/limit in URL, got ${state.href}`)
  }
  if (!state.text.includes('Showing 21–40 of 194') && !state.text.includes('Showing 21-40 of 194')) {
    throw new Error(`Unexpected range text:\n${state.text}`)
  }
  console.log('pass: page 2 limit 20 range')

  await go('/products?page=abc&limit=999')
  await waitFor(ws, `location.search.includes('page=1') && location.search.includes('limit=10')`)
  await waitFor(ws, `document.body.innerText.includes('Showing 1')`)
  console.log('pass: invalid page/limit normalized')

  await go('/products?page=999999&limit=10')
  await waitFor(ws, `location.search.includes('page=20')`)
  await waitFor(ws, `document.body.innerText.includes('of 194')`)
  console.log('pass: oversized page clamped to last page')

  await go('/products?page=1&limit=50')
  await waitFor(ws, `document.body.innerText.includes('Showing 1') && document.body.innerText.includes('of 194')`)
  state = await snapshot()
  if (!state.href.includes('limit=50')) {
    throw new Error(`Expected limit=50, got ${state.href}`)
  }
  console.log('pass: limit 50')

  await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 720,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await delay(400)
  state = await snapshot()
  if (state.hasTable) {
    throw new Error('Table should be hidden at 320px')
  }
  if (state.cardCount < 1) {
    throw new Error('Expected product cards at 320px')
  }
  console.log('pass: 320px cards')

  await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await delay(400)
  state = await snapshot()
  if (!state.hasTable) {
    throw new Error('Table should be visible at 1440px')
  }
  console.log('pass: 1440px table')

  await sendCdp(ws, 'Network.enable')
  await sendCdp(ws, 'Network.setBlockedURLs', {
    urls: ['*dummyjson.com/products*'],
  })
  await go('/products?page=1&limit=10')
  await waitFor(ws, `document.body.innerText.includes('Something went wrong')`)
  console.log('pass: error state')

  await sendCdp(ws, 'Network.setBlockedURLs', { urls: [] })
  await evaluate(
    ws,
    `document.querySelector('button') && Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === 'Retry')?.click()`,
  )
  await waitFor(ws, `document.body.innerText.includes('Showing 1')`)
  console.log('pass: retry')

  console.log('all e2e checks passed')
} finally {
  if (ws) {
    ws.close()
  }
  edge.kill()
}
