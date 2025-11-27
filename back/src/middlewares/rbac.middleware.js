// RBAC middleware for TODO app
const hasPermission = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const user = req.authuser;

      if (!user) {
        // No user info attached → logincheck not run
        return res.status(401).json({ message: "Please login first" });
      }

      // If no roles specified, allow any logged-in user
      if (allowedRoles.length === 0) {
        return next();
      }

      // Check if user's role is allowed
      if (allowedRoles.includes(user.role)) {
        return next();
      }

      // Forbidden if role not allowed
      return res.status(403).json({ message: "You do not have access to this resource" });
    } catch (error) {
      console.error("RBAC middleware error:", error);
      next({ status: 500, message: "Internal server error" });
    }
  };
};

module.exports = hasPermission;
