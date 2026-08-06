// Who is connected right now.
//
// userId -> Set of that user's live socket ids. A user counts as online while at
// least one socket is open, which is what makes multiple tabs behave: closing
// one tab must not mark someone offline while another is still connected.
//
// Kept in its own module rather than inline in index.js so the transition logic
// — the part that's easy to get subtly wrong with multiple tabs — is testable on
// its own.
const onlineSockets = new Map();

function isUserOnline(id) {
  const set = onlineSockets.get(String(id));
  return Boolean(set && set.size > 0);
}

/**
 * @returns {boolean} true ONLY on the offline -> online transition, so callers
 * broadcast "came online" once instead of on every extra tab.
 */
function addPresence(userId, socketId) {
  const key = String(userId);
  if (!onlineSockets.has(key)) onlineSockets.set(key, new Set());
  const set = onlineSockets.get(key);
  const wasOffline = set.size === 0;
  set.add(socketId);
  return wasOffline;
}

/**
 * @returns {boolean} true ONLY on the online -> offline transition, i.e. when
 * the socket removed was the user's last one.
 */
function removePresence(userId, socketId) {
  const key = String(userId);
  const set = onlineSockets.get(key);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) {
    onlineSockets.delete(key);
    return true;
  }
  return false;
}

function onlineFrom(userIds = []) {
  return userIds.map(String).filter(isUserOnline);
}

module.exports = { isUserOnline, addPresence, removePresence, onlineFrom, onlineSockets };
