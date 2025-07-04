const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path"); // Import path module
const Customer = require("./models/Customer");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../'))); // Serve files from the parent directory

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/glasses");

        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
}
connectDB();

// Root Route to serve the HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html')); // Serve the HTML file from the parent directory
});

// Save Customer Data
app.post("/save-customer", async (req, res) => {
    try {
        const { name, cell, invoiceDate, items, totalAmount, prescription } = req.body;

        if (!name || !cell || !invoiceDate || !items || items.length === 0) {
            return res.status(400).json({ error: "❌ Missing required fields" });
        }

        const customer = new Customer({
            name,
            cell,
            invoiceDate,
            items,
            totalAmount,
            prescription: prescription || null, // Set to null if empty
        });

        await customer.save();
        res.status(201).json({ message: "✅ Invoice saved successfully" });
    } catch (error) {
        console.error("❌ Error Saving Customer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch Customer History
app.get("/search-customer", async (req, res) => {
    try {
        const query = req.query.query;

        if (!query) {
            return res.status(400).json({ error: "❌ Search query is required" });
        }

        const customers = await Customer.find({ cell: query });

        res.json(customers);
    } catch (error) {
        console.error("❌ Error Searching Customer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));