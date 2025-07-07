require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const PRODUCTS_PATH = path.join(__dirname, "../products.json");
const GOLD_API_URL = "https://www.goldapi.io/api/XAU/USD";
const GOLD_API_KEY = process.env.GOLD_API_KEY;

async function getGoldPrice() {
  try {
    const res = await axios.get(GOLD_API_URL, {
      headers: { "x-access-token": GOLD_API_KEY },
    });
    const pricePerOunce = res.data.price;
    return pricePerOunce / 31.1035;
  } catch (err) {
    console.error("Error fetching gold price:", err.message);
    return 75;
  }
}

function calculatePrice(product, goldPrice) {
  return ((product.popularityScore + 1) * product.weight * goldPrice).toFixed(
    2
  );
}

app.get("/products", async (req, res) => {
  let products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf-8"));
  const goldPrice = await getGoldPrice();

  products = products.map((p) => ({
    ...p,
    price: parseFloat(calculatePrice(p, goldPrice)),
    popularity: (p.popularityScore * 5).toFixed(1),
  }));

  const { minPrice, maxPrice, minPopularity, maxPopularity } = req.query;
  if (minPrice)
    products = products.filter((p) => p.price >= parseFloat(minPrice));
  if (maxPrice)
    products = products.filter((p) => p.price <= parseFloat(maxPrice));
  if (minPopularity)
    products = products.filter(
      (p) => p.popularity >= parseFloat(minPopularity)
    );
  if (maxPopularity)
    products = products.filter(
      (p) => p.popularity <= parseFloat(maxPopularity)
    );

  res.json(products);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
