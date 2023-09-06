import express from "express"
import mongoose from "mongoose"
import multer from "multer"
import cors from "cors"

import { registerValidation, loginValidation, postCreateValidation } from "./validations.js"
import { UserController, PostController } from "./controllers/index.js"
import { checkAuth, handleValidationErrors } from "./utils/index.js"

mongoose.connect(
    "mongodb+srv://arthurshelbaev:arthur123@cluster0.nkb13ye.mongodb.net/blog?retryWrites=true&w=majority")
    .then(() => console.log("Database connected."))
.catch((err) => console.log(err))

const app = express()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads")
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

app.use(express.json())
app.use(cors())
app.use("/uploads", express.static("uploads"))

app.post("/auth/register", registerValidation, handleValidationErrors, UserController.register);
app.post("/auth/login", loginValidation, handleValidationErrors, UserController.login);
app.get("/auth/me", checkAuth, UserController.getMe);

app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})

app.listen(4444, (err) => {
    err ? console.log(err) : console.log("Server activated.");
})
app.get("/tags", PostController.getLastTags)

app.get("/posts", PostController.getAll)
app.get("/posts/tags", PostController.getLastTags)
app.get("/posts/:id", PostController.getOne)
app.post("/posts", checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.delete("/posts/:id", PostController.remove)
app.patch("/posts/:id", checkAuth, postCreateValidation, handleValidationErrors, PostController.update)
