const express = require("express");
const productImagesController = require("../controllers/product-images.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/productImages", router);
  
  router.get("/", productImagesController.getProductImagesByFilter);

  router.post("/", authenticateToken, productImagesController.createProductImage);

  router.delete("/", authenticateToken, productImagesController.deleteMultiProductImages);

  router.get("/:id", productImagesController.getProductImagesByProductId);

  router.put("/:id", authenticateToken, productImagesController.updateProductImage);

  router.delete("/:id", authenticateToken, productImagesController.deleteProductImage);
};
