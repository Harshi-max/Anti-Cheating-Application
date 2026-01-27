const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

const DEFAULT_SESSION_TTL_DAYS = 7;

/**
 * Create a new authenticated session and corresponding JWT.
 * The JWT is bound to the created session via sessionId and user agent.
 */
async function createSessionAndToken(user, req) {
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    undefined;

  const expiresAt =
    Date.now() +
    (parseInt(process.env.SESSION_TTL_DAYS || DEFAULT_SESSION_TTL_DAYS, 10) *
      24 *
      60 *
      60 *
      1000);

  const session = await Session.create({
    user: user._id,
    userAgent,
    ip,
    isActive: true,
    expiresAt: new Date(expiresAt)
  });

  const tokenPayload = {
    id: user._id,
    userId: user.userId,
    sessionId: session._id.toString()
  };

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'your_secret_key',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );

  return { token, session };
}

/**
 * Validate a decoded JWT payload against the Session store.
 * Ensures the session is active and user-agent/IP are consistent.
 */
async function validateSessionForRequest(decoded, req) {
  if (!decoded.sessionId) {
    return { valid: false, reason: 'SESSION_MISSING' };
  }

  const session = await Session.findById(decoded.sessionId);
  if (!session || !session.isActive) {
    return { valid: false, reason: 'SESSION_INACTIVE' };
  }

  const requestUserAgent = req.headers['user-agent'] || 'unknown';
  if (session.userAgent !== requestUserAgent) {
    return { valid: false, reason: 'USER_AGENT_MISMATCH' };
  }

  if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
    return { valid: false, reason: 'SESSION_EXPIRED' };
  }

  return { valid: true, session };
}

/**
 * Invalidate a session by ID (used for logout or security incidents).
 */
async function invalidateSession(sessionId) {
  await Session.findByIdAndUpdate(sessionId, { isActive: false });
}

module.exports = {
  createSessionAndToken,
  validateSessionForRequest,
  invalidateSession
};


