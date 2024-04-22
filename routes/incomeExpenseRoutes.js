const express = require('express');
const router = express.Router();

const verifyToken = require('../verifyToken');

const Expense = require('../schema/Expense');
const Income = require('../schema/Income');
const User = require('../schema/User');
const Category = require('../schema/Category');

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {sendEmail} = require("../sendEmail");
const {uploadToS3, getImageFromS3, deleteFromS3} = require('../s3');

router.get("/categories/:incomeExpense", verifyToken, async (req, res)=>{
    try{
        if(req.params.incomeExpense === "expenses"){
           const expenseCategories = await Category.find({_id: /^e/});
           res.send(expenseCategories);
        
        }else{
            const incomeCategories = await Category.find({_id: /^i/});
            res.send(incomeCategories);
        }
        
    }
    catch(err){
     res.status(500).send({message: "An unknown error occurred. Please try again later."});       
    }
});

router.get('/:incomeExpense', verifyToken, async (req, res) => {
try{
    if (req.params.incomeExpense === 'expenses') {
        let expenseItems = await Expense.find({ user: req.user._id}).populate({ path: "categoryId", model: "Category", select: "categoryName" });
        for (let expenseItem of expenseItems){
            const url = await getImageFromS3(expenseItem.receipt)
            expenseItem.receipt = url;
        }
        res.send(expenseItems);
    } else {
        const incomeItems = await Income.find({ user: req.user._id }).populate({ path: "categoryId", model: "Category", select: "categoryName" });
        res.send(incomeItems);
    }
}catch(err){
    res.status(500).send({message: "An unknown error occurred. Please try again later."});
}

});

router.post("/uploadImage", verifyToken, upload.single("receipt"), async(req,res)=> {
    if(req.file && req.file.mimetype.startsWith("image/")){
        const receiptImage = await uploadToS3(req.file.buffer, req.file.mimetype);
        res.send({imageUrl: receiptImage});
    }
});

router.post('/:newIncomeExpense', verifyToken, async (req, res) => {
    try {
        const category = await Category.findOne({ categoryName: req.body.categoryName });
        let incomeExpense = req.body;
        delete incomeExpense.categoryName;
        incomeExpense.categoryId = category._id;
        incomeExpense.user = req.user._id;
        let result = {}
        if (req.params.newIncomeExpense === 'newExpense') {
            req.user.balance = req.user.balance - incomeExpense.amount;
            await User.findOneAndUpdate({_id: req.user._id, }, {balance: req.user.balance});
            if(incomeExpense.receipt === ""){incomeExpense.receipt = process.env.DEFAULT_RECEIPT}
            result = await Expense.create(incomeExpense);
            const url = await getImageFromS3(incomeExpense.receipt);
            result.receipt = url;
        } else {
            req.user.balance = req.user.balance + incomeExpense.amount;
            await User.findOneAndUpdate({_id: req.user._id }, {balance: req.user.balance})
            result = await Income.create(incomeExpense);
        }
        if(req.user.balance < 0 && !req.alreadySent){
            req.alreadySent = true;
            sendEmail(req.user.fullname, req.user.balance, req.user.email);
        }else{
            req.alreadySent = false;
        }
        res.send(result);

    } catch (error) {
        res.status(500).send({message: "An unknown error occurred. Please try again later."});
    }

});

router.patch("/updateBudgetGoals", verifyToken, async (req, res) => {
    try {
        const result = await User.findByIdAndUpdate({ _id: req.user._id }, req.body, { new: true });
        res.send(result);
    } catch (err) {
        res.status(500).send({message: "An unknown error occurred. Please try again later."});
    }

});

router.delete('/:incomeExpense', verifyToken, async (req, res) => {
    try{
        if (req.params.incomeExpense === 'deleteExpense') {
        req.user.balance = req.user.balance + req.body.amount;
        await User.findOneAndUpdate({_id: req.user._id, }, {balance: req.user.balance});
        const expenseItem = await Expense.findOne({ _id: req.body._id})
        if(expenseItem.receipt !== process.env.DEFAULT_RECEIPT){
            await deleteFromS3(expenseItem.receipt);
        }
        await Expense.findOneAndDelete({ _id: req.body._id });
    } else {
        req.user.balance = req.user.balance - req.body.amount;
        await User.findOneAndUpdate({_id: req.user._id, }, {balance: req.user.balance});
        await Income.findOneAndDelete({ _id: req.body._id });
    }
    if(req.user.balance < 0 && !req.alreadySent){
        req.alreadySent = true;
        sendEmail(req.user.fullname, req.user.balance, req.user.email);
    }else{
        req.alreadySent = false;
    }
    res.status(200).send({message: "Successfully Deleted!"});
}catch(err){
    res.status(500).send({message: "An unknown error occurred. Please try again later."});
}
});

module.exports = router;