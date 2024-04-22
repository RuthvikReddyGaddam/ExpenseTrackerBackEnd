const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyToken = require('../verifyToken');

const User = require('../schema/User');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {uploadToS3, getImageFromS3} = require('../s3');

router.get('/', verifyToken, async (req, res) => {
    try {
        if (req.user) {
            const DoB = new Date(req.user.DoB).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) 
            req.user.DoB = DoB;
            res.send(JSON.stringify(req.user));
        } else {
            res.status(404).json({ message: 'User not found!' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Authorization failed!' });
    }
});

router.post("/register", async (req, res) => {
    try {
        let userItem = await User.findOne({ email: req.body.email });
        if (userItem) {
            res.status(401).send({ message: "User already exists!" });
        } else {
            userItem = req.body;
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            userItem.password = hashedPassword;
            await User.create(userItem);
            const url = await getImageFromS3(userItem.profile);
            userItem.profile = url
            let token = jwt.sign(userItem, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.json({ token: token });
        }
    } catch (err) {
        res.status(500).send({ message: "An unknown error occurred. Please try again later." });
    }

});

router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        let userItem = await User.findOne({ email: email });
        if (userItem) {
            if (await bcrypt.compare(password, userItem.password)) {
                const url = await getImageFromS3(userItem.profile);
                userItem.profile = url
                let token = jwt.sign(userItem.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
                res.json({ token: token });
            }
            else res.status(401).send({ message: "Wrong Username or password. Please try again!" });
        }
        else res.status(404).send({ message: "No user found! Please create Fan account." });
    } catch (err) {
        res.status(500).send({ message: "An unknown error occurred. Please try again later." });
    }

});

router.post("/uploadProfile", upload.single("profile"), async (req, res) => {
    try {
        if (req.file && req.file.mimetype.startsWith("image/")) {
            const receiptImage = await uploadToS3(req.file.buffer, req.file.mimetype);
            res.send({ imageUrl: receiptImage });
        } else {
            res.status(404).send({ message: "File type invalid!" })
        }
    } catch (err) {
        res.send(err);
    }

});

module.exports = router;
