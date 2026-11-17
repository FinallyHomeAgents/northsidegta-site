export function createChallengeHandler({ protection } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ok: false, error: 'Method not allowed'});
    }
    try { const active = protection || (await import('../lib/homepage-spam.mjs')).createFormProtection(); return res.status(200).json(await active.issue(req)); }
    catch (error) {
      if (error.retryAfter) res.setHeader('Retry-After', String(error.retryAfter));
      return res.status(error.status || 503).json({ok: false, error: error.message || 'Please contact us directly.'});
    }
  };
}
export default createChallengeHandler();
