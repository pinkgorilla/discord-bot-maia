/*
 * action types
 */

export const SET_DATE = 'SET_DATE'
export const SET_GAINED = 'SET_GAINED'
export const SET_SHARED = 'SET_SHARED'
export const SET_REASON = 'SET_REASON'
export const SET_ATTEND = 'SET_ATTEND'


/*
 * action creators
 */

export function setDate(date) {
    return { type: SET_DATE, date: date }
}

export function setAttend(attend) {
    return { type: SET_ATTEND, attend: attend }
}

export function setReason(text) {
    return { type: SET_REASON, reason: text }
}

export function setGained(text) {
    return { type: SET_GAINED, gained: text }
}

export function setShared(text) {
    return { type: SET_SHARED, shared: text }
}
