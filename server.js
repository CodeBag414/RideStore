/* jshint esversion:6 */
var express = require('express');

function traillingSlashMiddleware(req, res, next) {
  if (req.url.substr(-1) === '/' && req.url.length > 1) {
    res.redirect(301, req.url.slice(0, -1));
  } else {
    next();
  }
}

var app = express();

app.use(traillingSlashMiddleware);

app.use('/bower_components', express.static('./bower_components'));
app.use('/app', express.static('./src/app'));
app.use('/assets', express.static('./src/assets'));
app.use('/', express.static('./build/dev'));
app.use('*', express.static('./build/dev/index.html'));

var port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('App running on port ' + port);
});

var dist = express();

dist.use(traillingSlashMiddleware);

dist.use('/', express.static('./build/dist'));
dist.use('*', express.static('./build/dist/index.html'));

dist.listen(3001, () => {
  console.log('Dist running on port 3001');
});
