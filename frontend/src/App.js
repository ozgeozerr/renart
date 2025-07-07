import React, { useEffect, useState } from "react";
import "./App.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const API_URL = "https://renart-kh22.onrender.com/products";

const COLORS = [
  { key: "yellow", label: "Yellow Gold", color: "#E6CA97" },
  { key: "white", label: "White Gold", color: "#D9D9D9" },
  { key: "rose", label: "Rose Gold", color: "#E1A4A9" },
];

const POPULARITY_OPTIONS = [
  { value: "", label: "All" },
  { value: "least", label: "Least Popular (0–2.5)" },
  { value: "mid", label: "Medium Popularity (2.5–4)" },
  { value: "most", label: "Most Popular (4–5)" },
];

function ProductCard({ product }) {
  const [color, setColor] = useState("yellow");
  return (
    <div className="product-card">
      <img
        src={product.images[color]}
        alt={product.name}
        className="product-img"
      />
      <div className="color-picker product-color-picker">
        {COLORS.map((c) => (
          <button
            key={c.key}
            style={{
              background: c.color,
              border: color === c.key ? "2px solid #333" : "1px solid #ccc",
              borderRadius: "50%",
              width: 28,
              height: 28,
              margin: 2,
            }}
            onClick={() => setColor(c.key)}
            aria-label={c.label}
          />
        ))}
      </div>
      <div className="color-label">
        {COLORS.find((c) => c.key === color).label}
      </div>
      <div className="product-info">
        <div className="product-title">{product.name}</div>
        <div className="product-price">${product.price} USD</div>
        <div className="product-popularity">
          <span className="stars">
            {"★".repeat(Math.round(product.popularity))}
            {"☆".repeat(5 - Math.round(product.popularity))}
          </span>
          <span className="score">{product.popularity}/5</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [popularity, setPopularity] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
      });
  }, []);

  // Filter products
  const filtered = products.filter((p) => {
    const price = p.price;
    const pop = Number(p.popularity);
    let priceMatch = price >= priceRange[0] && price <= priceRange[1];
    let popMatch = true;
    if (popularity === "least") popMatch = pop >= 0 && pop <= 2.5;
    if (popularity === "mid") popMatch = pop > 2.5 && pop < 4;
    if (popularity === "most") popMatch = pop >= 4 && pop <= 5;
    return priceMatch && popMatch;
  });

  // Handle slider changes
  const handleMinPrice = (e) => {
    const newMin = Number(e.target.value);
    setPriceRange([Math.min(newMin, priceRange[1]), priceRange[1]]);
  };
  const handleMaxPrice = (e) => {
    const newMax = Number(e.target.value);
    setPriceRange([priceRange[0], Math.max(newMax, priceRange[0])]);
  };

  return (
    <div className="App">
      <h1 className="title">Product List</h1>
      <div className="filters large-filters">
        <div className="price-slider-group">
          <label>Price Range: </label>
          <div className="slider-labels">
            <span>$0</span>
            <span style={{ flex: 1 }}></span>
            <span>$1000</span>
          </div>
          <div className="slider-inputs">
            <input
              type="range"
              min={0}
              max={1000}
              value={priceRange[0]}
              onChange={handleMinPrice}
              step={1}
            />
            <input
              type="range"
              min={0}
              max={1000}
              value={priceRange[1]}
              onChange={handleMaxPrice}
              step={1}
            />
          </div>
          <div className="selected-range">
            ${priceRange[0]} - ${priceRange[1]}
          </div>
        </div>
        <div>
          <label>Popularity: </label>
          <select
            value={popularity}
            onChange={(e) => setPopularity(e.target.value)}
            style={{
              fontSize: "1.1rem",
              height: 36,
              borderRadius: 8,
              padding: "0 10px",
            }}
          >
            {POPULARITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Swiper
        spaceBetween={30}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
        navigation
      >
        {filtered.map((product, idx) => (
          <SwiperSlide key={idx}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          No products found for selected filters.
        </div>
      )}
    </div>
  );
}

export default App;
