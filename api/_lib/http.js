// api/_lib/http.js
// Small shared helpers so every route doesn't reinvent error handling.

function sendOk(res, data = {}) {
  res.status(200).json({ ok: true, ...data });
}

function sendError(res, status, message) {
  res.status(status).json({ ok: false, error: message });
}

// Wraps a route handler so unexpected throws become clean 500s instead of
// opaque platform error pages, and so Redis mis-configuration is reported
// clearly instead of crashing the function.
function withErrorHandling(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      sendError(res, 500, err.message || 'Internal server error');
    }
  };
}

module.exports = { sendOk, sendError, withErrorHandling };
