/*
 * action types
 */
export const actionTypes = {
  SET_TOPINFO: 'SET_TOPINFO',
  SET_LIKE_TOPINFO: 'SET_LIKE_TOPINFO',
  SET_PROPOSE: 'SET_PROPOSE',
  ADD_PROPOSE: 'ADD_PROPOSE',
  CONFIRM_PROPOSE: 'CONFIRM_PROPOSE',
  SET_CURRENT_PROPOSE: 'SET_CURRENT_PROPOSE',
  SET_MEMORY: 'SET_MEMORY',
};
/*
 * action creators
 */
export const setLikeTopInfo = data => ({ type: actionTypes.SET_LIKE_TOPINFO, data });
export const setTopInfo = data => ({ type: actionTypes.SET_TOPINFO, data });
export const setPropose = data => ({ type: actionTypes.SET_PROPOSE, data });
export const addPropose = data => ({ type: actionTypes.ADD_PROPOSE, data });
export const confirmPropose = data => ({ type: actionTypes.CONFIRM_PROPOSE, data });
export const setCurrentPropose = data => ({ type: actionTypes.SET_CURRENT_PROPOSE, data });
export const setMemory = data => ({ type: actionTypes.SET_MEMORY, data });
