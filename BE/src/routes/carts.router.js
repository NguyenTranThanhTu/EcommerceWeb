const express = require("express");
const cartsController = require("../controllers/carts.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const router = express.Router();

module.exports.setup = (app) => {
  app.use("/api/v1/carts", router);
  
  router.get("/", authenticateToken, cartsController.getCartItems);

  router.put("/", authenticateToken, cartsController.updateCartItem);

  router.post("/create-cart", authenticateToken, cartsController.createCart);

  router.post("/create-cart-item", authenticateToken, cartsController.addCartItem);

  router.delete("/delete-cart-item/:CartItemID", authenticateToken, cartsController.deleteCartItem);

  router.delete("/delete-cart", authenticateToken, cartsController.deleteCart);
};
