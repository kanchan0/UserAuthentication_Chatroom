const express = require("express")
const router = express.Router();
const bcrypt = require("bcryptjs")
const passport = require("passport")
const mail_sender=require("../mail-sender/node-mailer")

//passport config
require("../config/passport")(passport)

//user modal
const User = require("../modals/User")

router.get('/login',(req,res)=>{
    res.render("login");
})

router.get('/register',(req,res)=>{
    res.render("register")
})

//register handle
router.post('/register',(req,res)=>{
   // console.log(req.body)
    const {name,email,password,password2}=req.body
    let errors = [];

    //check required field
    if(!name || !email || !password || !password2){
        errors.push({msg:"please fill in all fields"})
    }

    //check password match
    if(password!==password2){
        errors.push({msg:"Password do not match"})
    }

    //check password length
    if(password.length<6){
        errors.push({msg:"password should be atleast 6 characters"})
    }

    if(errors.length>0){
        res.render("register",{
            errors,
            name,email,
            password,
            password2
        }
            )
    }else{
        
        //validation passes
        User.findOne({email:email})
        .then((user)=>{
            if(user){

                //user exists
                errors.push({msg:"email is already registered"})
                res.render("register",{
                    errors,
                    name,email,
                    password,
                    password2
                })
            }else{
                const newUser  = new User({
                    name,
                    email,
                    password
                });

                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(newUser.password,salt,(err,hash)=>{
                            if(err)throw err

                            //set passowrd to hashed
                            newUser.password=hash
                            //save user to the database
                            newUser.save()
                            .then(user=>{
                                mail_sender.mail_sender(email);
                                req.flash("success_msg","You are now Registered,please log in")
                                res.redirect("/users/login")
                            })
                            .catch(err=>{console.log(err)})
                    })
                })
            }
        })

    }

})


//Login handle

router.post("/login",(req,res,next)=>{
    passport.authenticate('local',{
      successRedirect:"/dashboard",
      failureRedirect:"/users/login",
      failureFlash:true
    })(req,res,next);
})


//logout handle

router.get("/logout",(req,res)=>{
    req._destroy
    req.flash("success_msg","you are logged out")
    res.redirect("/users/login")
})

module.exports = router;