/**
 * Dynamic API Base URL resolver that automatically works for:
 * 1. Local environment (localhost):
 *    - Admin 1: http://localhost/Admin-Panel-development
 *    - Admin 2: http://localhost/manual-pick
 *
 * 2. Server environment:
 *    - Admin 1: https://fortunescash.com
 *    - Admin 2: https://pick3.fortunescash.com
 */

export function getAdmin1BaseUrl(): string {
  // If running in browser on the server (not localhost)
  if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'https://fortunescash.com'
  }

  // Local environment: use env variable or local laragon path
  return (import.meta.env.VITE_API_URL || 'http://localhost/Admin-Panel-development').replace(/\/$/, '')
}

export function getAdmin2BaseUrl(): string {
  // If running in browser on the server (not localhost)
  if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'https://pick3.fortunescash.com'
  }

  // Local environment: use env variable or local laragon path
  return (import.meta.env.VITE_MANUAL_PICK_API_URL || 'http://localhost/manual-pick').replace(/\/$/, '')
}
