module.exports = {
  globDirectory: "web-build/",
  globPatterns: [
    "**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff,json}"
  ],
  swDest: "web-build/service-worker.js",
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30,
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    {
      urlPattern: /\.(?:mp3|wav)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 Days
        },
      },
    },
  ],
};