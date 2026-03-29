/**
 * Unit tests — IDs UT-31–UT-32.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getAdminEvents, logAdminEvent } from './adminAudit'

describe('adminAudit', () => {
  let store
  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => {
        store[k] = v
      },
      removeItem: (k) => {
        delete store[k]
      },
    })
  })

  it('UT-31-OB: logAdminEvent records actor and message', () => {
    logAdminEvent({ actor: 'Admin', type: 'test', message: 'hello' })
    const ev = getAdminEvents()
    expect(ev.length).toBe(1)
    expect(ev[0].message).toBe('hello')
    expect(ev[0].actor).toBe('Admin')
  })

  it('UT-32-TB: getAdminEvents returns [] on bad JSON', () => {
    store['devinc_admin_audit_events'] = 'not-json{'
    expect(getAdminEvents()).toEqual([])
  })
})
