const express = require("express");
const authController = require("../controllers/auth.controller");
const avatarUpload = require("../middlewares/avatar-upload.middleware");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

module.exports.setup = (app) => {
    app.use("/api/v1/auth", router);

    router.post("/login", authController.login);

    router.post("/signup", avatarUpload, authController.signUp);

    router.post("/refresh-token", authController.refreshToken);

    router.get("/infoLogin", authenticateToken, authController.getInfo);
}