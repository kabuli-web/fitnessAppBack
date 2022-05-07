const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  console.log(req.body)
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return  res.status(403).json({
      success:false,
      error: "No Token",
      message: "please provide an authentication token"
  })
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return  res.status(401).json({
      success:false,
      error: "Invalid Token",
      message: typeof(err)=="string"?errorMessage:err.stack
  })
  }
  return next();
};

module.exports = verifyToken;