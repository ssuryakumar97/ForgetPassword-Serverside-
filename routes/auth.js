const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

//REGISTER
router.post("/register", async(req,res) => {
    try{
        const oldUser =await User.findOne({email: req.body.email})
        if(oldUser){
            res.send({message:"User already exists"})
        } else {
            const genSalt = await bcrypt.genSalt(10);
            const hashedPassword =await bcrypt.hash(req.body.password, genSalt)
        const newUser = new User({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).send({status: "ok"});}
        
    }catch(err){
        res.status(500).send(err);
    }
})

//LOGIN
router.post("/login", async(req,res) => {
    
        const user =await User.findOne({email: req.body.email})
        if(!user){
          return  res.send({message:"User not found"})
        } 
        if(await bcrypt.compare(req.body.password, user.password)){
            const token = jwt.sign({email: user.email},process.env.JWT_SECRET, {expiresIn: 20})
            if(res.status(201)){
                return res.json({status: "ok", data: token})
            }else {
                return res.json({error: "error"})
            }
        }
        res.json({status: "error", error: "Invalid password"})
})

//USER DATA

router.post("/userdata", async(req,res) => {
    const {token} = req.body;
    try{
        const user = jwt.verify(token,process.env.JWT_SECRET, (err, resp) => {
            if(err){
                return "token expired"
            }
            return resp;
        } )
        if(user == "token expired"){
            return res.send({status: "error" , data: "token expired"})
        }
        const useremail = user.email;
        const userData = await User.findOne({email: useremail})
        res.send({status: "ok", data: userData});
    
    } catch(err) {
        res.send({status: "error", data: err});
    }
})

//FORGET-PASSWORD
router.post("/forget-password", async (req, res) => {
    const {email} =req.body;
    try{
        const oldUser = await User.findOne({email});
        if(!oldUser){
            return res.json({status:"User not exists!"});
        }
        const secret =  process.env.JWT_SECRET + oldUser.password
        const token = jwt.sign({email: oldUser.email, id: oldUser._id},secret, {
            expiresIn:"5m"
        });
        const link = `https://loginpage-reset.onrender.com/api/reset-password/${oldUser._id}/${token}`;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.USERNAME_EMAIL,
              pass: process.env.PASSWORD_EMAIL
            }
          });
          
          var mailOptions = {
            from: process.env.USERNAME_EMAIL,
            to: oldUser.email,
            subject: 'Reset Password',
            text: link
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          }); 
    } catch(err){

    }
})

//RESET-PASSWORD
router.get("/reset-password/:id/:token", async(req,res) => {
    const { id, token} = req.params;
    const oldUser = await User.findOne({_id:id});
        if(!oldUser){
            return res.json({status:"User not exists!"});
        }
        const secret =  process.env.JWT_SECRET + oldUser.password
        try{
            const verify = jwt.verify(token,secret);
            res.render("index", {email: verify.email, status: "Not verified"});
        } catch(err) {
            res.send("Not verified");
        }
})

router.post("/reset-password/:id/:token", async(req,res) => {
    const { id, token} = req.params;
    const { password, confirmPassword } = req.body
    const oldUser = await User.findOne({_id:id});
        if(!oldUser){
            return res.json({status:"User not exists!"});
        }
        const secret =  process.env.JWT_SECRET + oldUser.password
        
        try{
            const verify = jwt.verify(token,secret);  
            const genSalt = await bcrypt.genSalt(10);
            const hashedPassword =await bcrypt.hash(password, genSalt)
            await User.updateOne({
                    _id: id
                },
                {
                    $set: {
                        password: hashedPassword,
                    }
                }
                )
            res.render("index", {email: verify.email, status:"verified"});
        } catch(err) {
            // res.json({status : "Something went wrong"});
            
        }
})

module.exports = router;