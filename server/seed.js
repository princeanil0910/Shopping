const mongoose = require("mongoose");
const Product = require("./models/product");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected, seeding data...");

    // Clear old products
    await Product.deleteMany({});

    // Add sample products with real images
    await Product.insertMany([
      {
        name: "Wireless Headphones",
        price: 2999,
        image: "https://images.unsplash.com/photo-1612858249937-1cc0852093dd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2lyZWxlc3MlMjBoZWFkcGhvbmVzfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=200"
      },
      {
        name: "Smart Watch",
        price: 4999,
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=200"
      },
      {
        name: "Bluetooth Speaker",
        price: 1999,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ymx1ZXRvb3RoJTIwc3BlYWtlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=200"
      },
      {
        name: "Laptop",
        price: 59999,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80"
      },
      {
        name: "Smartphone",
        price: 29999,
        image: "https://images.unsplash.com/photo-1603184017968-953f59cd2e37?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHNtYXJ0cGhvbmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=200"
      },
      {
        name: "DSLR Camera",
        price: 45999,
        image: "https://images.unsplash.com/photo-1606986628470-26a67fa4730c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZHNsciUyMGNhbWVyYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=200"
      },
      {
        name: "Running Shoes",
        price: 3499,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cnVubmluZyUyMHNob2VzfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=200"
      },
      {
        name: "Backpack",
        price: 2499,
        image: "https://images.unsplash.com/photo-1622260614153-03223fb72052?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YmFja3BhY2t8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=200"
      }
    ]);

    console.log("✅ Dummy products inserted successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Error seeding data:", err));
