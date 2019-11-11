const express         =     require("express");
const app             =     express();
const expressLayouts  =     require("express-ejs-layouts")
const mongoose        =     require("mongoose")
const flash           =     require("connect-flash")
const session         =     require("express-session")
const passport        =     require("passport")
const Driver          =     require("./Socket/socket.io")


//passport config
require("./config/passport")

//EJS
app.use(expressLayouts)
app.set('view engine','ejs');

//bodyparser
app.use(express.urlencoded({extended:true}))

//express Session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));


//passport middleware
app.use(passport.initialize());
app.use(passport.session());


 //connect flash
 app.use(flash()) 

 //Global Vars
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg") 
    res.locals.error = req.flash("error") 
    next();
})
//socket
Driver();

//routes
app.use('/',require("./Routes/index"))
app.use('/users',require("./Routes/users"))

const PORT = process.env.PORT||7000;
//connect to Mongo
mongoose.connect("mongodb://127.0.0.1/passport_auth",{useNewUrlParser:true,useUnifiedTopology:true})
  .then(()=>{
    console.log("MONGODb connected");
    app.listen(PORT,console.log(`server started at ${7000}`))
  })
  .catch((err)=>console.log(err));
