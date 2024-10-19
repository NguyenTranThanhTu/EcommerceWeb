const express = require("express");
const productsController = require("../controllers/products.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const productImagesUpload = require("../middlewares/product-image-upload.middleware");
const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/products", router);
  
  router.get("/", productsController.getProductsByFilter);

  router.post("/", productImagesUpload, authenticateToken, productsController.createProduct);

  router.delete("/", authenticateToken, productsController.deleteMultiProducts);

  router.get("/:id", productsController.getProduct);

  router.put("/:id", productImagesUpload, authenticateToken, productsController.updateProduct);

  router.delete("/:id", authenticateToken, productsController.deleteProduct);
};
