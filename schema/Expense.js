const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    categoryId: {
        type: String,
        ref: "Category",
    },
    paymentType: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true

    },
    receipt: {
        type: String,
        required: false
    },
    categoryName: String
});

module.exports = mongoose.model('Expense', expenseSchema);