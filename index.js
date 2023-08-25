import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import mongoose from "mongoose"

import { registerValidation } from "./validations/auth.js"
import { validationResult } from "express-validator"
import UserModel from "./models/User.js"

mongoose.connect(
    "mongodb+srv://arthurshelbaev:arthur123@cluster0.nkb13ye.mongodb.net/blog?retryWrites=true&w=majority")
    .then(() => console.log("Database connected"))
.catch((err) => console.log(err))

const app = express()

app.use(express.json())

app.post("/login", async (req, res) => {
    try {
        const user = await UserModel.findOne({ email: req.body.email })

        if (!user) {
            return res.status(404).json({
                message: "Неправильный логин или пароль"
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)

        if (!isValidPass) {
            return res.status(404).json({
                message: "Неверный пароль или логин"
            })
        }

        const token = jwt.sign(
            {
                _id: user._id
            },
            "secret123",
            {
                expiresIn: "30d"
            }
        )

        const { passwordHash, ...userData } = user._doc
    
        res.json({
            ...userData,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Не удалось авторизоваться."
        })
    }
})

app.post("/register", registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) res.status(400).json(errors.array())
    
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
    
        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash,
            avatarUrl: req.body.avatarUrl,
        })
    
        const user = await doc.save()

        const token = jwt.sign(
            {
                _id: user._id
            },
            "secret123",
            {
                expiresIn: "30d"
            }
        )

        const { passwordHash, ...userData } = user._doc
    
        res.json({
            ...userData,
            token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Не удалось зарегистрироваться."
        })
    }
})

app.listen(4444, (err) => {
    err ? console.log(err) : console.log("Server activated");;
})