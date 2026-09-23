// Anonymous visit tracking. Writes through the track_page_view() RPC only —
// see cfdqanda-server/sql/page_events.sql for the table and what it stores.
//
// A "visit" is one browser tab (random id in sessionStorage, gone when the tab
// closes). Dwell time comes from a heartbeat that fires only while the tab is
// visible, so a page left open in a background tab does not inflate it.
//
// Nothing here may ever break the app: every call is wrapped, and a browser
// that blocks storage simply goes untracked.

import { supabase } from './supabaseClient'

const SESSION_KEY = 'fa_session_id'
const HEARTBEAT_MS = 15000

let timer = null
let currentPath = null

function sessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return null // private mode / storage blocked: skip tracking entirely
  }
}

function referrerOrigin() {
  // Origin only — never the full referring URL, which can carry search terms.
  try {
    return document.referrer ? new URL(document.referrer).origin : null
  } catch {
    return null
  }
}

async function ping(path) {
  const sid = sessionId()
  if (!sid || !path) return
  try {
    await supabase.rpc('track_page_view', {
      p_session: sid,
      p_path: path,
      p_referrer: referrerOrigin(),
    })
  } catch {
    // analytics is never worth an error in front of a user
  }
}

export function trackPage(path) {
  currentPath = path
  ping(path)
  stopTracking()
  timer = setInterval(() => {
    if (document.visibilityState === 'visible') ping(currentPath)
  }, HEARTBEAT_MS)
}

export function stopTracking() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// One last beat when the tab goes away, so the final stretch is not lost.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') ping(currentPath)
  })
}
