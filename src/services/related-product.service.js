const natural = require("natural");
const cosineSimilarity = require("cosine-similarity");
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
const Product = require("../models/product.model");
const { Types } = require("mongoose");

// Hàm tìm sản phẩm liên quan
const getRelatedProductsService = async ({ productId }) => {
  const products = await Product.find({}).lean();
  products.forEach((product, index) =>
    tfidf.addDocument(
      `${product.product_category} ${product.product_brand} ${product.product_description}`
    )
  );
  const productIndex = products.findIndex(
    (p) => p._id.toString() === productId
  );
  if (productIndex === -1) return [];

  const productVector = tfidf.documents[productIndex]; // Vector sản phẩm gốc
  const scores = products.map((_, i) => ({
    _id: products[i]._id,
    product_name: products[i].product_name,
    product_slug: products[i].product_slug,
    product_thumb: products[i].product_thumb,
    similarity: cosineSimilarity(tfidf.documents[i], productVector) || 0,
  }));

  // Sắp xếp theo mức độ tương đồng, bỏ sản phẩm gốc
  return scores
    .filter((p) => p.id !== productId)
    .sort((a, b) => b.similarity - a.similarity);
};
module.exports = {
  getRelatedProductsService,
};
