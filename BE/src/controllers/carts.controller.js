const cartsService = require("../services/carts.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function createCart(req, res, next) {
  if (!req.body?.cart_name || typeof req.body.cart_name !== "string") {
    return next(new ApiError(400, "Name should be a non-empty string"));
  }

  try {
    const cart = await cartsService.createCart({
      ...req.body,
      CreatedBy: req.user.UserID
    });

    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${cart.id}`,
      })
      .json(JSend.success({ cart }));
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while creating the cart")
    );
  }
}

async function getCartsByFilter(req, res, next) {
  let result = {
    carts: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await cartsService.getManyCarts(req.query);
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while retrieving carts")
    );
  }
  return res.json(
    JSend.success({
      carts: result.carts,
      metadata: result.metadata,
    })
  );
}

async function getCart(req, res, next) {
  const { id } = req.params;

  try {
    const cart = await cartsService.getCartById(id);
    if (!cart) {
      return next(new ApiError(404, "Cart not found"));
    }
    return res.json(JSend.success({ cart }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving cart with id=${id}`));
  }
}

async function updateCart(req, res, next) {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  const { id } = req.params;

  try {
    const updated = await cartsService.updateCart(id, {
      ...req.body,
      UpdatedBy: req.user.UserID
    });
    if (!updated) {
      return next(new ApiError(404, "Cart not found"));
    }
    return res.json(
      JSend.success({
        cart: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error updating cart with id=${id}`));
  }
}

async function deleteCart(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await cartsService.deleteCart(id, req.user.UserID);
    if (!deleted) {
      return next(new ApiError(404, "Cart not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Could not delete cart with id=${id}`));
  }
}

async function deleteMultiCarts(req, res, next) {
  const { cartIds } = req.body;

  if (!Array.isArray(cartIds) || cartIds.length === 0) {
    return next(new ApiError(400, "Invalid cart IDs"));
  }

  try {
    await cartsService.deleteCartsByIds(cartIds, req.user.UserID);
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while removing carts")
    );
  }
}

module.exports = {
  getCartsByFilter,
  deleteMultiCarts,
  getCart,
  createCart,
  updateCart,
  deleteCart,
};
