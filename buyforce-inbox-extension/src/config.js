/* BuyForce Inbox Overlay — configuration.
 * Loaded first in the Facebook content-script bundle; exposes globalThis.BF_CONFIG.
 * The proxy ENDPOINT and stage dictionary are pre-filled. The FB SELECTORS are a
 * best-guess starting point — VERIFY them against the live inbox in DevTools and
 * anchor to href/aria, never FB's randomized class names.
 */
globalThis.BF_CONFIG = {
  // n8n proxy (used by background.js). Verified live; returns { ok, count, items: [...] }.
  endpoint: 'https://buyforce.app.n8n.cloud/webhook/bf-inbox-index',
  refreshMs: 5 * 60 * 1000,           // refetch the pipeline index every 5 minutes
  matchThreshold: 0.5,                // fuzzy score (0..1) required to show an "≈" match
  linkEndpoint: 'https://buyforce.app.n8n.cloud/webhook/bf-inbox-link', // write-back: stamp fbThreadId on a confident match
  linkMinScore: 0.72,                 // fuzzy score required before stamping the thread id back

  // stage enum -> badge presentation. stale = days in stage before it flags stale.
  stages: {
    FRESH_LEADS:                                  { label: 'Fresh Lead',       color: '#3b82f6', stale: 1, next: 'Request VIN' },
    ENGAGED_AWAITING_VIN:                         { label: 'Awaiting VIN',     color: '#6366f1', stale: 2, next: 'Get the VIN' },
    VIN_RECEIVED_APPRAISAL_NEEDED:                { label: 'Appraise',         color: '#8b5cf6', stale: 1, next: 'Run appraisal' },
    APPRAISAL_REVIEW_NEEDED:                      { label: 'Apprsl Review',    color: '#a855f7', stale: 1, next: 'Review appraisal' },
    APPRAISAL_REVIEW_COMPLETE:                    { label: 'Apprsl Done',      color: '#9333ea', stale: 1, next: 'Enter offer values' },
    APPRAISAL_COMPLETE_ENTER_OFFER_SHEET_VALUES:  { label: 'Build Offer',      color: '#7c3aed', stale: 1, next: 'Generate offer sheet' },
    OFFER_SHEET_GENERATED:                        { label: 'Offer Ready',      color: '#0ea5e9', stale: 1, next: 'Send offer' },
    OFFER_SENT_0_2_DAYS:                          { label: 'Offer Sent',       color: '#22c55e', stale: 2, next: 'Follow up on offer' },
    SCHEDULED:                                    { label: 'Scheduled',        color: '#14b8a6', stale: 2, next: 'Confirm appt' },
    APPT_SHOWN_FOLLOW_UP:                         { label: 'Appt Shown',       color: '#10b981', stale: 1, next: 'Follow up post-appt' },
    VERBAL_YES_SCHEDULE_APPT:                     { label: 'Verbal Yes',       color: '#16a34a', stale: 1, next: 'Schedule appt' },
    NURTURING_FOLLOW_UP_AND_RE_ENGAGE:            { label: 'Nurturing',        color: '#f59e0b', stale: 3, next: 'Re-engage' }
  },
  unknownStage: { label: 'In Pipeline', color: '#6b7280', stale: 3, next: '' },

  // ---- FACEBOOK SELECTORS — VERIFY IN DEVTOOLS ----
  // A conversation row in the Marketplace "Buying" inbox. Anchor to stable URL/role
  // patterns. These are starting points; tune after inspecting the live DOM.
  selectors: {
    // Verified on /marketplace/inbox: each conversation is a role=button tabindex=0 div inside <main>
    // (~one per conversation). Row text reads "Seller · Vehicle · trim · last message".
    // No href/thread-id in the list, so matching is seller+vehicle fuzzy; the matcher only badges
    // rows that resolve to a real active deal, so an over-broad selector is harmless.
    rowCandidates: '[role="main"] div[role="button"][tabindex="0"]'
  }
};
