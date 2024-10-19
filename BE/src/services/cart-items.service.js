const knex = require("../database/knex");
const Paginator = require("./paginator");

function cartItemRepository() {
  return knex("cartItems");
}

function readCartItem(payload) {
  return {
    CartID: payload.CartID,
    ProductID: payload.ProductID,
    Quantity: payload.Quantity,
  };
}

async function createCartItem(payload) {
  const cartItem = readCartItem(payload);
  const [CartItemID] = await cartItemRepository().insert(cartItem);
  return { CartItemID, ...cartItem };
}

async function getManyCartItems(query) {
  const { page = 1, limit = 5 } = query;
  const paginator = new Paginator(page, limit);
  let results = await cartItemRepository()
    .from("cartitems as c")
    .select(
      knex.raw("count(CartItemID) OVER() AS recordCount"),
      "c.CartID",
      "c.ProductID",
      "p.ProductName",
      "c.Quantity",
      "c.CreatedAt",
      "c.CreatedBy",
      "c.UpdatedAt",
      "c.UpdatedBy"
    )
    .leftJoin("products as p", "c.ProductID", "p.ProductID")
    .limit(paginator.limit)
    .offset(paginator.offset);

  let totalRecords = 0;
  results = results.map((result) => {
    totalRecords = result.recordCount;
    delete result.recordCount;
    return result;
  });

  return {
    cartItems: results,
    metadata: paginator.getMetadata(totalRecords),
  };
}

async function getCartItemById(CartItemID) {
  return cartItemRepository()
    .where("CartItemID", CartItemID)
    .select("*")
    .first();
}

async function updateCartItem(CartItemID, payload) {
  const updatedCartItem = await cartItemRepository()
    .where("CartItemID", CartItemID)
    .select("*")
    .first();

  if (!updatedCartItem) {
    return null;
  }

  const update = readCartItem(payload);
  await cartItemRepository().where("CartItemID", CartItemID).update(update);

  return { ...updatedCartItem, ...update };
}

async function deleteCartItem(CartItemID) {
  const deletedCartItem = await cartItemRepository()
    .where("CartItemID", CartItemID)
    .first();

  if (!deletedCartItem) {
    return null;
  }

  await cartItemRepository().where("CartItemID", CartItemID).del();

  return deletedCartItem;
}

async function deleteCartItemsByIds(cartItemIds) {
  await cartItemRepository().whereIn("CartItemID", cartItemIds).del();
}

module.exports = {
  getManyCartItems,
  deleteCartItemsByIds,
  getCartItemById,
  createCartItem,
  updateCartItem,
  deleteCartItem,
};
