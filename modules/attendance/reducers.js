import { combineReducers } from 'redux'
import {
    SET_DATE,
    SET_ATTEND,
    SET_GAINED,
    SET_SHARED,
    SET_REASON
} from './actions'

function attendance(state = {}, action) {
    switch (action.type) {
        case SET_DATE:
            return Object.assign({}, state, {
                date: action.date
            });
        case SET_ATTEND:
            return Object.assign({}, state, {
                attend: action.attend
            });
        case SET_GAINED:
            return Object.assign({}, state, {
                gained: action.gained
            });
        case SET_SHARED:
            return Object.assign({}, state, {
                shared: action.shared
            });
        case SET_REASON:
            return Object.assign({}, state, {
                reason: action.reason
            });
        default:
            return state
    }
}

const attendanceApp = combineReducers({ attendance })

export default attendanceApp