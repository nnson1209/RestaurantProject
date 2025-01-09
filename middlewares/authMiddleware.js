const jwt = require("jsonwebtoken");

module.exports.authMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.redirect("/auth/login");
    }

    try {
      const decodeToken = jwt.verify(accessToken, process.env.SECRET);
      req.email = decodeToken.email;
      req.role = decodeToken.role;

      if (allowedRoles && !allowedRoles.includes(req.role)) {
        return res.redirect("/auth/login");
      }

      next();
    } catch (error) {
      console.log(error);
      return res.redirect("/auth/login");
    }
  };
};
