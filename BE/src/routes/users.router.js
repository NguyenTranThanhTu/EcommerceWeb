const express = require("express");
const usersController = require("../controllers/users.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const avatarUpload = require("../middlewares/avatar-upload.middleware");
const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/users", router);
  
  router.get("/", usersController.getUsersByFilter);

  router.post("/", avatarUpload, authenticateToken, usersController.createUser);

  router.delete("/", authenticateToken, usersController.deleteMultiUsers);

  router.get("/:id", usersController.getUser);

  router.put("/:id", avatarUpload, authenticateToken, usersController.updateUser);

  router.delete("/:id", authenticateToken, usersController.deleteUser);
};
