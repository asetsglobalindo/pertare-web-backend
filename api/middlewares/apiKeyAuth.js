// middlewares/apiKeyAuth.js
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY || 'your-secret-api-key-here';
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API Key required'
    });
  }
  
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API Key'
    });
  }
  
  next();
};

module.exports = apiKeyAuth;