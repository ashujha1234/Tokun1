/**
 * The admin gate, in one place.
 *
 * Every admin route file used to declare its own three-line copy of this
 * (adminNotifications.js, adminRefunds.js, adminEscrow.js, …). That was
 * survivable while every copy was identical — and then one file declared a
 * PASS-THROUGH pair instead:
 *
 *   // routes/userAdminRoutes.js, before this existed
 *   const requireAuth  = (req, res, next) => next();
 *   const requireAdmin = (req, res, next) => next();
 *   router.get("/", requireAuth, requireAdmin, handler);   // reads as gated
 *
 * That route listed both middlewares and enforced neither, so `GET /api/user`
 * returned every account — email, name, role, plan, kycStatus — to anyone who
 * asked. A local definition is what made it possible to look correct while
 * being open, so the fix is that there is now nothing to redefine: import this.
 *
 * Depends on requireAuth having run first — `req.isAdmin` is set there
 * (utils/auth.js), explicitly on BOTH branches, so an absent flag is a
 * programming error rather than a silent allow. Guarded anyway below.
 */

function requireAdmin(req, res, next) {
  // `!== true` rather than falsy: if requireAuth did not run, req.isAdmin is
  // undefined, and this must deny rather than depend on which of the two
  // middlewares a caller remembered to mount.
  if (req.isAdmin !== true) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  return next();
}

module.exports = { requireAdmin };
