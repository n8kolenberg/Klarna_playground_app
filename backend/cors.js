module.exports = function() {
    return function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Accept");
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Credentials' , true);
      req.header("Access-Control-Allow-Origin", "*");
      req.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      req.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Accept");
      req.header('Access-Control-Allow-Credentials', true);
      next();
    };
  }