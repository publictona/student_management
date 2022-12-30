const studentmodel = require("../models/studentModel")
const jwt = require("jsonwebtoken")

const register = async (req, res) => {
  try {
    let data = req.body
    let created = await studentmodel.create(data)
    res.status(201).send({ status: true, data: created })
  } catch (err) {
    console.log(err.msg)
    res.status(500).send({ status: false, msg: err.msg })

  }
}

//=================================================Student Login======================================================================================

const generateAuthToken = function (userData) {

  const Student = userData
  const token = jwt.sign(
    {
      studentId: Student._id.toString(),
      email: Student.email,

    },
    "Student-Managment",
  );
  return token
}

const Login = async (req, res) => {
  try {
    if (Object.keys(req.body).length <= 1)
      return res.status(400).send({ status: false, msg: "Must enter email  and password." })
    const email = req.body.email;
    const password = req.body.password;

    const studentData = await studentmodel.findOne({ email: email, password: password });
    if (!studentData)
      return res.status(401).send({ status: false, msg: "Either email or the password is incorrect" })
    if (studentData) {
      const token = generateAuthToken(studentData);
      res.setHeader('X-api-key', token)
      res.status(201).send({ status: true, msg: "token generated successfully", data: { token: token } });
    } else {
      res.status(400).send({ status: false, msg: "Invalid  credentials" })
    }

  } catch (error) {
    console.log(error);
    res.status(400).send("invalid login Detailes")
  }
}

//===============================<getAllstudent>====================================================
const getAllstudent = async function (req, res) {
  try {
    let queryParams = req.query;
    const students = await studentmodel.find(queryParams)
    if (!(students)) {
      return res.status(404).send({ status: false, message: "students not found" });
    }
    res.status(200).send({ status: true, message: "student list", data: students });
  } catch (error) {
    res.status(500).send({ status: false, Error: error.message });
  }
};


//==================================<getStudent>=====================================================
const getStudent = async (req, res) => {
  try {
    let studentId = req.params.studentId
    if (!Object.keys(studentId).length)
      return res.status(400).send({ status: false, msg: "Student Id Is Mandetaroy" })

    let getStudent = await studentmodel.findById({ _id: studentId })
    if (!getStudent)
      return res.status(404).send({ status: false, msg: "Id should be valid" })
    res.status(200).send({ status: true, msg: "Student Detail", data: getStudent })

  } catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: err.msg })
  }
}

//==================================<updateStudent by id>=================================================
const updateStudent = async (req, res) => {
  try {
    let studentId = req.params.studentId
    if (!studentId) return res.status(400).send({ status: false, message: "student Id is required" });

    let checkstudentId = await studentmodel.findById(studentId);
    if (!checkstudentId) return res.status(404).send({ status: false, message: "student not found" });

    let data = req.body;
    if (!Object.keys(data).length) return res.status(400).send({ status: false, message: "Data is required to update document" });

    ///=====================authorization =================//
    if (req.studentId != studentId) {
      return res.status(403).send({ status: false, message: "You're not Authorized" });
    }

    //----------------------------------------------------------------------------------------------------------------------------------------//
    let updates = await studentmodel.findOneAndUpdate({ _id: studentId }, data, { new: true })
    return res.status(200).send({ status: true, data: updates })

  }
  catch (error) {
    console.log(error.message)
    return res.status(400).send({ status: false, message: error.message })
  }
};
//===================================================================================
const deleteStudent = async (req, res) => {
  try {

    let studentId = req.params.studentId
    if (!studentId) return res.status(400).send({ status: false, msg: "student Id not found" })

    // ******Authoorization check *********************//
    if (req.studentId != studentId) {
      return res.status(403).send({ status: false, message: "You're not Authorized" });
    }

    let deletestudent = await studentmodel.deleteOne({ _id: studentId }, { new: true })
    return res.status(200).send({ status: true, msg: "document deleted successfully" })

  } catch (error) {
    console.log(error)
    return res.status(500).send({ status: false, msg: error })

  }
}

//================================================================================
module.exports.register = register
module.exports.Login = Login
module.exports.getAllstudent = getAllstudent
module.exports.getStudent = getStudent
module.exports.updateStudent = updateStudent
module.exports.deleteStudent = deleteStudent