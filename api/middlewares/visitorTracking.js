const visitorService = require("../services/visitorService");

// Middleware for tracking visitor data
async function visitorTracking(req, res, next) {
  // Langsung proceed ke next middleware
  next();

  // Jalankan tracking di background (fire and forget)
  setImmediate(async () => {
    try {
      const clientIp =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const cookieVisitorId = req.cookies["visitor_id"];
      let visitorId;

      if (!cookieVisitorId) {
        visitorId = `${clientIp}-${new Date().getTime()}`;
        // Set cookie akan dilakukan di response berikutnya
      } else {
        visitorId = cookieVisitorId;
      }

      // Track visitor dengan timeout
      await Promise.race([
        visitorService.trackVisitor(visitorId, clientIp),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Tracking timeout")), 3000)
        ),
      ]);
    } catch (error) {
      console.error("Background visitor tracking failed:", error);
    }
  });
}

module.exports = visitorTracking;
