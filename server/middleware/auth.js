module.exports = function authMiddleware(req, res, next) {
  req.user = { _id: "000000000000000000000001", id: "000000000000000000000001" };
  next();
};