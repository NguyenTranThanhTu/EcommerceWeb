const express = require("express");
const rolesController = require("../controllers/roles.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/roles", router);
  
  router.get("/", rolesController.getRolesByFilter);

  router.post("/", authenticateToken, rolesController.createRole);

  router.delete("/", authenticateToken, rolesController.deleteMultiRoles);

  router.get("/:id", rolesController.getRole);

  router.put("/:id", authenticateToken, rolesController.updateRole);

  router.delete("/:id", authenticateToken, rolesController.deleteRole);
};
