console.log('Debug function loaded');

module.exports = function handler(req, res) {
  console.log('Debug function called');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', req.headers);
  
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      res.status(200).end();
      return;
    }
    
    console.log('Sending JSON response');
    res.status(200).json({
      message: 'Debug function works!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: Object.keys(req.headers)
    });
  } catch (error) {
    console.error('Debug function error:', error);
    res.status(500).json({
      error: 'Debug function failed',
      message: error.message
    });
  }
}; 