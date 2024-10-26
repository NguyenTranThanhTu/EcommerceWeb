const knex = require("../database/knex");

function cartRepository() {
  return knex("carts");
}

function readCart(payload) {
  return {
    UserID: payload.UserID,
    CreatedBy: payload.CreatedBy,
    UpdatedAt: new Date(),
    UpdatedBy: payload.UpdatedBy,
    IsDeleted: payload.IsDeleted,
  };
}

async function createCart(payload) {
  const existingCart = await cartRepository()
    .where("UserID", payload.UserID)
    .first();

  if (existingCart) {
    if (existingCart.IsDeleted) {
      await cartRepository()
        .where("UserID", existingCart.UserID)
        .update({ IsDeleted: false });
    }
    return await getCartItems(payload.UserID);
  }

  const cart = readCart(payload);
  const [UserID] = await cartRepository().insert(cart);
  return await getCartItems(UserID);
}

async function deleteCart(UserID) {
  const deletedCart = await cartRepository().where("UserID", UserID).first();

  if (!deletedCart) {
    return null;
  }

  // Xóa tất cả các mục trong giỏ hàng
  await deleteCartItemsByUserId(deletedCart.CartID);

  return deletedCart;
}

async function deleteCartItemsByUserId(CartID) {
  await knex("cartitems").where("CartID", CartID).delete();
}

async function addCartItem(UserID, item) {
  const cart = await knex("carts").where("UserID", UserID).first();

  if (!cart) {
    throw new Error("Cart not found for this user.");
  }

  const existingItem = await knex("cartitems")
    .where("CartID", cart.CartID)
    .andWhere("ProductID", item.ProductID)
    .first();

  if (existingItem) {
    const updatedQuantity = existingItem.Quantity + item.Quantity;
    await knex("cartitems")
      .where("CartItemID", existingItem.CartItemID)
      .update({ Quantity: updatedQuantity });

    return {
      CartItemID: existingItem.CartItemID,
      ...item,
      Quantity: updatedQuantity,
    };
  } else {
    const [CartItemID] = await knex("cartitems").insert({
      CartID: cart.CartID,
      ProductID: item.ProductID,
      Quantity: item.Quantity,
    });
    return { CartItemID, ...item };
  }
}

async function updateCartItem(payload) {
  const item = await knex("cartitems")
    .where("CartItemID", payload.CartItemID)
    .first();

  if (!item) {
    return null;
  }

  await knex("cartitems")
    .where("CartItemID", payload.CartItemID)
    .update({ Quantity: payload.Quantity });
  return { ...item, Quantity: payload.Quantity };
}

async function deleteCartItem(CartItemID) {
  const item = await knex("cartitems")
    .where("CartItemID", CartItemID)
    .first();

  if (!item) {
    return null;
  }

  await knex("cartitems").where("CartItemID", CartItemID).delete();
  return item;
}

async function getCartItems(UserID) {
  return await knex("cartitems as ci")
    .leftJoin("carts as c", "ci.CartID", "c.CartID")
    .leftJoin("products as p", "ci.ProductID", "p.ProductID")
    .leftJoin(
      knex("productimages as pi")
        .select("pi.ProductID", "pi.ImageUrl")
        .where("pi.IsDeleted", false)
        .orderBy("pi.created_at", "asc")
        .limit(1)
        .as("pi"),
      "p.ProductID",
      "pi.ProductID"
    )
    .where("c.UserID", UserID)
    .andWhere("ci.IsDeleted", false)
    .select(
      "ci.CartID",
      "ci.CartItemID",
      "ci.created_at",
      "ci.CreatedBy",
      "ci.IsDeleted",
      "ci.ProductID",
      "p.product_name",
      "p.Price",
      "pi.ImageUrl as ImageUrl",
      "ci.Quantity",
      "ci.UpdatedAt",
      "ci.UpdatedBy",
      "c.UserID"
    );
}

module.exports = {
  createCart,
  deleteCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  getCartItems,
};
