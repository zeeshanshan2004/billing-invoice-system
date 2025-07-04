const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cell: { type: String, required: true, unique: true },
    invoiceDate: { type: String, required: true },
    items: [
        {
            description: String,
            quantity: Number,
            unitPrice: Number,
            total: Number,
        }
    ],
    totalAmount: { type: Number, required: true },
    prescription: {
        rightEyePower: String,
        leftEyePower: String,
        lensType: String,
        additionalNotes: String,
    },
});

module.exports = mongoose.model("Customer", customerSchema);
