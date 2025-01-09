const jwt = require("jsonwebtoken");

module.exports.createToken = (data) => {
  const token = jwt.sign(data, process.env.SECRET, {
    expiresIn: "7d",
  });

  return token;
};
