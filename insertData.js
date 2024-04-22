const dotenv = require('dotenv');
dotenv.config();
const Category = require("./schema/Category");
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL); //create a .env file and add the database url as DB_URL
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => { console.log('connected') });

async function main() {
    // add other categories for expenses and income if needed and run this file using node insertData.js
    await Category.deleteMany();
    incomeCategories = {
        i1: "Business",
        i2: "Salary",
        i3: "Freelance",
        i4: "Passive Income",
        i5: "Stocks",
        i6: "Investment",
        i7: "Other"
    };
    expenseCategories = {
        e1: "Food",
        e2: "Grocery",
        e3: "Subscriptions",
        e4: "Insurance",
        e5: "Gas",
        e6: "Utilities",
        e7: "Rent",
        e8: "Other"
    };
    for (let expense in expenseCategories) {
       await Category.create({ _id: expense, categoryName: expenseCategories[expense] });
    }
    for (let income in incomeCategories) {
        await Category.create({ _id: income, categoryName: incomeCategories[income] });
    }

}

main();
console.log("inserted successfully!");