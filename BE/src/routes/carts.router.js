const express = require("express");
const cartsController = require("../controllers/carts.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/carts", router);
  
  router.get("/", cartsController.getCartsByFilter);

  router.post("/", authenticateToken, cartsController.createCart);

  router.delete("/", authenticateToken, cartsController.deleteMultiCarts);

  router.get("/:id", cartsController.getCart);

  router.put("/:id", authenticateToken, cartsController.updateCart);

  router.delete("/:id", authenticateToken, cartsController.deleteCart);
};
