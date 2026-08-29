// next-sitemap.config.js
module.exports = {
  siteUrl: "https://dmechservices.ng",
  generateRobotsTxt: true,
  exclude: [
    "/portal",
    "/ops",
    "/dashboard",
    "/api/*",
    "/auth/*",
  ],
  sitemapSize: 5000,
};