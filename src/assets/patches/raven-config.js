(function() {
  'use strict';

  /* global Raven */

  Raven.config('https://9c358ae983074a5893c06c25a9a1f8e9@sentry.io/98864', {
    whitelistUrls: [
      /ridestore\.(com|se|de|fi|no)/i,
      /ridestore\.imgix\.net/i,
      /ridestore\-contentful\.imgix\.net/i
    ],
    ignoreUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      //localhost
      /127\.0\.0\.1/,
      /localhost/
    ]
  }).addPlugin(Raven.Plugins.Angular).install();

}());
