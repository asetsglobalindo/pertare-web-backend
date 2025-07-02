const express = require("express");
const middleware = require("../helper/middleware");
const router = express.Router(),
  Controller = require("../controllers/CSRSocialController");

// Public routes for frontend API
router.get("/", Controller.get);
router.get("/detail/:program_id", Controller.getDetail);

// Admin-only routes for React CMS management (CRUD only)
router.get("/admin", middleware.authAdmin, Controller.getAdmin);
router.get("/admin/:program_id", middleware.authAdmin, Controller.getDetail);
router.post("/admin", middleware.authAdmin, Controller.add);
router.put("/admin/:program_id", middleware.authAdmin, Controller.update);
router.delete("/admin/:program_id", middleware.authAdmin, Controller.delete);

// Debug route (remove in production)
router.get("/debug", Controller.debug);

module.exports = router;