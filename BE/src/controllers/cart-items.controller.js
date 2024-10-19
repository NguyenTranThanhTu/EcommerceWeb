const cartItemsService = require("../services/cart-items.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function createCartItem(req, res, next) {
  if (!req.body?.cartItem_name || typeof req.body.cartItem_name !== "string") {
    return next(new ApiError(400, "Name should be a non-empty string"));
  }

  try {
    const cartItem = await cartItemsService.createCartItem({
      ...req.body,
    });

    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${cartItem.id}`,
      })
      .json(JSend.success({ cartItem }));
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while creating the cartItem")
    );
  }
}

async function getCartItemsByFilter(req, res, next) {
  let result = {
    cartItems: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await cartItemsService.getManyCartItems(req.query);
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while retrieving cartItems")
    );
  }
  return res.json(
    JSend.success({
      cartItems: result.cartItems,
      metadata: result.metadata,
    })
  );
}

async function getCartItem(req, res, next) {
  const { id } = req.params;

  try {
    const cartItem = await cartItemsService.getCartItemById(id);
    if (!cartItem) {
      return next(new ApiError(404, "CartItem not found"));
    }
    return res.json(JSend.success({ cartItem }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving cartItem with id=${id}`));
  }
}

async function updateCartItem(req, res, next) {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  const { id } = req.params;

  try {
    const updated = await cartItemsService.updateCartItem(id, {
      ...req.body,
    });
    if (!updated) {
      return next(new ApiError(404, "CartItem not found"));
    }
    return res.json(
      JSend.success({
        cartItem: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error updating cartItem with id=${id}`));
  }
}

async function deleteCartItem(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await cartItemsService.deleteCartItem(id);
    if (!deleted) {
      return next(new ApiError(404, "CartItem not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Could not delete cartItem with id=${id}`));
  }
}

async function deleteMultiCartItems(req, res, next) {
  const { cartItemIds } = req.body;

  if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
    return next(new ApiError(400, "Invalid cartItem IDs"));
  }

  try {
    await cartItemsService.deleteCartItemsByIds(cartItemIds);
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while removing cartItems")
    );
  }
}

module.exports = {
  getCartItemsByFilter,
  deleteMultiCartItems,
  getCartItem,
  createCartItem,
  updateCartItem,
  deleteCartItem,
};
