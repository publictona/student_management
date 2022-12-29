const express = require('express')
const router = express.Router();

const controller = require("../controller/studentController")
const middleware = require("../middleware/auth")


//==============student Apis route handler=================//
router.post("/register",controller.register)
router.post("/login", controller.Login)
router.get("/getall",controller.getAllstudent)
router.get("/student/:studentId",controller.getStudent)
router.put("/student/:studentId",middleware.loginCheck,controller.updateStudent)
router.delete("/student/:studentId",middleware.loginCheck,controller.deleteStudent)



module.exports = router;