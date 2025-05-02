// src/server/socketRateLimiter.js

const rateLimits = {};

export function isRateLimited(socket, action, limit = 5, windowMs = 15 * 60 * 1000) {
  const key = `${socket.handshake.address}:${action}`;
  const now = Date.now();

  if (!rateLimits[key]) {
    rateLimits[key] = { count: 1, firstRequestTime: now };
    return false;
  }

  const elapsed = now - rateLimits[key].firstRequestTime;
  if (elapsed > windowMs) {
    // Reset after time window
    rateLimits[key] = { count: 1, firstRequestTime: now };
    return false;
  }

  rateLimits[key].count++;

  return rateLimits[key].count > limit;
}
