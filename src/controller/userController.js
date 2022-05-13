const usermodel = require("../models/usermodel")
const jwt = require("jsonwebtoken")

const createUser = async (req, res) => {
    try {

        let nameRegex = /[a-zA-Z]/
        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        let mobileRegex = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/
        let passwordRegex = /^[a-zA-Z0-9!@#$%^&*]{6,16}$/

        let data = req.body
        const {title, name,email, phone, password,address} = data

        if (!Object.keys(data).length)
            return res.status(400).send({ status: false, msg: "You Must Enter Data" })

        if(!title)
         return res.status(400).send({status:false, mag:"title is mandetary"})
         
         

        if (!name)
            return res.status(400).send({ status: false, msg: "name must be present" })
        if (!data.name.match(nameRegex)) return res.status(400).send({ status: false, msg: "name should be unique" })
        //==========================================================//Phone Validation=========================================================================================

        if (!phone)
            return res.status(400).send({ status: false, msg: "mobile number must be present" })
        if (!data.phone.match(mobileRegex)) return res.status(400).send({ status: false, msg: "phone number should be valid" })
        const uniquePhone = await usermodel.findOne({phone:phone})
        if(uniquePhone){
            return res.status(400).send({status:false, msg:"this phone number is already exist "})
        }
        //====================================================email validation============================================================================
        if (!email)
            return res.status(400).send({ status: false, msg: "email must be present" })
           if (!data.email.match(emailRegex)) return res.status(400).send({ status: false, msg: "email should be valid" })
        const uniqueEmail = await usermodel.findOne({email:email})
        if(uniqueEmail){
            return res.status(400).send({status:false, msg:"this email is already exist "})
        }

        //=======================================================password validation=========================================================================

        if (!password)
            return res.status(400).send({ status: false, msg: "password must be present" })
        if (!data.password.match(passwordRegex)) return res.status(400).send({ status: false, msg: "password should be valid" })

       if(!address) {
            return res.status(400).send({ status: false, msg: "please provide address " })
        }
     if (!address.street) {
            return res.status(400).send({ status: false, msg: "please provide street field." })
        }
     if (!address.city) {
            return res.status(400).send({ status: false, msg: "please provide city field." })
        }
    if (!address.pincode) {
            return res.status(400).send({ status: false, msg: "please provide pincode field." })
        }
   if (!/^[1-9][0-9]{5}$/.test(address.pincode)) {
            return res.status(400).send({ status: false, msg: "please provide a 6 digit pincode" })
        }

       
    
       
        //========================================================User Create=======================================================================

        let created = await usermodel.create(data)
        res.status(201).send({ status: true, data: created })



    } catch (err) {
        console.log(err.msg)
        res.status(500).send({ status: false, msg: err.msg })

    }
}

//=================================================UserLogin======================================================================================

const generateAuthToken = function(userData) {

    const User = userData
    const token = jwt.sign(
        {
            userId: User._id.toString(),
            email: User.email,
            // iat: Math.floor(Date.now() / 1000), //issue date
            // exp: Math.floor(Date.now() / 1000) + 60*60 //expiry date
        },
        "Book-Managment", { expiresIn: '30m' }
       
    );
    return token
}
    
const userLogin = async (req, res) =>{
    try{
        if (Object.keys(req.body).length <=1)
             return res.status(400).send({status:false, msg:"Must enter email  and password."})
     const email = req.body.email;
     const password = req.body.password;
     const userData = await usermodel.findOne({email:email, password:password});
     if(!userData)
     return res.status(401).send({status:false, msg:"Either username or the password is incorrect"})
     if(userData){
         const token = generateAuthToken(userData);
         res.setHeader('X-api-key', token)
         res.status(201).send({status:true, msg:"token generated successfully", data:{token:token}});
     } else{
         res.status(400).send({status:false, msg:"Invalid  credentials"})
     }
     
    }catch(error){
       console.log(error);
       res.status(400).send("invalid login Detailes")
    }
}






module.exports.createUser = createUser
module.exports.userLogin = userLogin