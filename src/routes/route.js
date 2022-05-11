const express = require('express')
const router = express.Router();

const userController = require("../controller/userController")
const bookController = require("../controller/bookController")
const middleware = require("../middleware/auth")


//User Apis
router.post("/register",userController.createUser)
router.post("/login", userController.userLogin)
//Books Apis
router.post("/books",middleware.loginCheck,bookController.createBooks)
router.get("/books",bookController.getbooks)
router.get("/books/:bookId", bookController.getreview)
router.put("/books/:bookId",middleware.loginCheck, bookController.updateBook)
router.delete("/books/:bookId",middleware.loginCheck, bookController.deleteBook)



module.exports = router;