const express = require('express');
const Product = require('../models/product');
const Purchase = require('../models/purchase');

const router = express.Router();

// 상품 목록 조회
router.get('/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// 상품 추가
router.post('/products', async (req, res) => {
  const { name, price, stock } = req.body;
  const product = await Product.create({ name, price, stock });
  res.status(201).json(product);
});

// 상품 수정
router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, stock } = req.body;
  const product = await Product.findByPk(id);

  if (!product) {
    return res.status(404).send('상품을 찾을 수 없습니다.');
  }

  await product.update({ name, price, stock });
  res.json(product);
});

// 상품 삭제
router.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByPk(id);

  if (!product) {
    return res.status(404).send('상품을 찾을 수 없습니다.');
  }

  await product.destroy();
  res.json({ message: '삭제 완료' });
});

// 구매 처리
router.post('/purchase', async (req, res) => {
  const { productId, quantity, buyer } = req.body;
  const product = await Product.findByPk(productId);

  if (!product) {
    return res.status(404).send('상품을 찾을 수 없습니다.');
  }

  if (product.stock < quantity) {
    return res.status(400).send('재고가 부족합니다.');
  }

  const purchase = await Purchase.create({ productId, quantity, buyer });
  await product.update({ stock: product.stock - quantity });

  res.json({ message: '구매 완료', purchase });
});

module.exports = router;
