const express = require('express')
const router = express.Router();

const userController = require("../controller/userController")
const bookController = require("../controller/bookController")
const reviewController=require("../controller/reviewController")
const middleware = require("../middleware/auth")


//==============User Apis route handler=================//
router.post("/register",userController.createUser)
router.post("/login", userController.userLogin)

//=================Books Apis route handler=======================//
router.post("/books",middleware.loginCheck,bookController.createBooks)
router.get("/books",bookController.getbooks)
router.get("/books/:bookId", bookController.getreview)
router.put("/books/:bookId",middleware.loginCheck, bookController.updateBook)
router.delete("/books/:bookId",middleware.loginCheck, bookController.deleteBook)

//================review API route handler====================//===================================//=================================//
router.post("/books/:bookId/review",reviewController.addReviews)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReviewById)
router.delete("/books/:bookId/review/:reviewId",reviewController.deletereview)
module.exports = router;