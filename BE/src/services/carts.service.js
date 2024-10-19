const knex = require("../database/knex");
const Paginator = require("./paginator");

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
  const cart = readCart(payload);
  const [CartID] = await cartRepository().insert(cart);
  return { CartID, ...cart };
}

async function getManyCarts(query) {
  const { page = 1, limit = 5 } = query;
  const paginator = new Paginator(page, limit);
  let results = await cartRepository()
    .where("IsDeleted", false)
    .select(
      knex.raw("count(CartID) OVER() AS recordCount"),
      "UserID",
      "CreatedAt",
      "CreatedBy",
      "UpdatedAt",
      "UpdatedBy"
    )
    .limit(paginator.limit)
    .offset(paginator.offset);
  
  let totalRecords = 0;
  results = results.map((result) => {
    totalRecords = result.recordCount;
    delete result.recordCount;
    return result;
  });

  return {
    carts: results,
    metadata: paginator.getMetadata(totalRecords),
  };
}

async function getCartById(CartID) {
  return cartRepository()
    .where("CartID", CartID)
    .andWhere("IsDeleted", false)
    .select("*")
    .first();
}

async function updateCart(CartID, payload) {
  const updatedCart = await cartRepository()
    .where("CartID", CartID)
    .andWhere("IsDeleted", false)
    .select("*")
    .first();
    
  if (!updatedCart) {
    return null;
  }
  
  const update = readCart(payload);
  await cartRepository().where("CartID", CartID).update(update);
  
  return { ...updatedCart, ...update };
}

async function deleteCart(CartID, UserID) {
  const deletedCart = await cartRepository()
    .where("CartID", CartID)
    .first();
    
  if (!deletedCart) {
    return null;
  }
  
  await cartRepository().where("CartID", CartID).update({ IsDeleted: true, UpdatedAt: UserID });
  
  return deletedCart;
}

async function deleteCartsByIds(cartIds, UserID) {
  await cartRepository().whereIn('CartID', cartIds).update({ IsDeleted: true, UpdatedAt: UserID });
}

module.exports = {
  getManyCarts,
  deleteCartsByIds,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
};
