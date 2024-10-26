const cartsService = require("../services/carts.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function createCart(req, res, next) {
  try {
    const cart = await cartsService.createCart({
      ...req.body,
      UserID: req.user.UserID,
      CreatedBy: req.user.UserID,
    });

    return res.status(201).json(JSend.success({ cart }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred while creating the cart"));
  }
}

async function addCartItem(req, res, next) {
  try {
    const cartItem = await cartsService.addCartItem(
      req.user.UserID,
      req.body.data.item
    );

    return res.status(201).json(JSend.success({ cartItem }));
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while creating the cart item")
    );
  }
}

async function deleteCart(req, res, next) {
  try {
    await cartsService.deleteCart(req.user.UserID);
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error`));
  }
}

async function updateCartItem(req, res, next) {
  try {
    const updated = await cartsService.updateCartItem(req.body.data);
    return res.json(
      JSend.success({
        cart: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error`));
  }
}

async function deleteCartItem(req, res, next) {
  const { CartItemID } = req.params;
  try {
    await cartsService.deleteCartItem(CartItemID);
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error`));
  }
}

async function getCartItems(req, res, next) {
  try {
    const cartitems = await cartsService.getCartItems(req.user.UserID);
    return res.json(JSend.success({ cartitems }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Error"));
  }
}

module.exports = {
  addCartItem,
  updateCartItem,
  deleteCartItem,
  createCart,
  getCartItems,
  deleteCart,
};
