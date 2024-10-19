const express = require("express");
const categoriesController = require("../controllers/categories.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/categories", router);
  
  router.get("/", categoriesController.getCategoriesByFilter);
  
  router.post("/", authenticateToken, categoriesController.createCategory);

  router.delete("/", authenticateToken, categoriesController.deleteMultiCategories);

  router.get("/:id", categoriesController.getCategory);

  router.put("/:id", authenticateToken, categoriesController.updateCategory);

  router.delete("/:id", authenticateToken, categoriesController.deleteCategory);
};
