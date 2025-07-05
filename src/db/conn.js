const mongoose = require('mongoose');

console.log("🔌 Connecting to MongoDB...");

mongoose.connect("mongodb://127.0.0.1:27017/registeration") // Change 'mydatabase' to your DB name
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
