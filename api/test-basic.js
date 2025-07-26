module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    message: 'Basic function works',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}; 