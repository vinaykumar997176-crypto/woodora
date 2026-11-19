const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    console.error("Store data could not be read:", error.message);
    return { products: [], cart: [], newsletter: [], messages: [] };
  }
}
function writeStore(store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "Woodora API" }));

app.get("/api/products", (req, res) => {
  const store = readStore();
  const category = String(req.query.category || "all").toLowerCase();
  const search = String(req.query.search || "").toLowerCase().trim();
  const sort = String(req.query.sort || "featured");
  let items = store.products.slice();

  if (category !== "all") items = items.filter(p => p.category.toLowerCase() === category);
  if (search) items = items.filter(p => `${p.name} ${p.category} ${p.color} ${p.description}`.toLowerCase().includes(search));
  if (sort === "price-low") items.sort((a, b) => a.price - b.price);
  if (sort === "price-high") items.sort((a, b) => b.price - a.price);
  if (sort === "rating") items.sort((a, b) => b.rating - a.rating);
  if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "offers") items = items.filter(p => p.oldPrice && p.oldPrice > p.price);
  res.json(items);
});

app.get("/api/cart", (_req, res) => {
  const store = readStore();
  const items = store.cart.map(entry => {
    const product = store.products.find(p => p.id === entry.productId);
    return product ? { ...product, quantity: entry.quantity, lineTotal: product.price * entry.quantity } : null;
  }).filter(Boolean);
  res.json({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.lineTotal, 0)
  });
});

app.post("/api/cart", (req, res) => {
  const productId = String(req.body.productId || "");
  const store = readStore();
  if (!store.products.some(p => p.id === productId)) return res.status(404).json({ error: "Product not found." });
  const existing = store.cart.find(item => item.productId === productId);
  if (existing) existing.quantity += 1;
  else store.cart.push({ productId, quantity: 1 });
  writeStore(store);
  res.status(201).json({ message: "Added to your bag.", cartCount: store.cart.reduce((sum, item) => sum + item.quantity, 0) });
});

app.patch("/api/cart/:productId", (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) return res.status(400).json({ error: "Quantity must be between 0 and 99." });
  const store = readStore();
  const item = store.cart.find(entry => entry.productId === req.params.productId);
  if (!item) return res.status(404).json({ error: "Cart item not found." });
  if (quantity === 0) store.cart = store.cart.filter(entry => entry.productId !== req.params.productId);
  else item.quantity = quantity;
  writeStore(store);
  res.json({ message: "Cart updated." });
});

app.delete("/api/cart/:productId", (req, res) => {
  const store = readStore();
  store.cart = store.cart.filter(item => item.productId !== req.params.productId);
  writeStore(store);
  res.json({ message: "Item removed." });
});

app.post("/api/newsletter", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  const store = readStore();
  if (!store.newsletter.some(entry => entry.email === email)) {
    store.newsletter.push({ email, createdAt: new Date().toISOString() });
    writeStore(store);
  }
  res.status(201).json({ message: "You're on the list. Welcome to Woodora." });
});

app.post("/api/contact", (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim();
  const message = String(req.body.message || "").trim();
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
    return res.status(400).json({ error: "Please enter your name, a valid email and a message of at least 10 characters." });
  }
  const store = readStore();
  store.messages.push({ name, email, message, createdAt: new Date().toISOString() });
  writeStore(store);
  res.status(201).json({ message: "Thanks. Your message has been received." });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Woodora is running at http://localhost:${PORT}`));
