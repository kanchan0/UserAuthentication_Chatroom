const mail_sender = (receiver_email)=>{

const nodemailer        =       require('nodemailer')
const smtpTransport     =       require('nodemailer-smtp-transport');

const transporter = nodemailer.createTransport( smtpTransport ({
    
    host               :        "smtp.gmail.com",
    secureConnection   :         false,
    port               :         587,
    requiresAuth       :         true,        
    domains            :        ["gmail.com", "googlemail.com"],
    auth               :       {
                                user : "testertiwary@gmail.com",            //give your email id and password make
                                                            // sure it does not have active two way authentication
                                pass : "12345Kanchan"
                                },
    tls                :       {
                               rejectUnauthorized:false   
                               }
}))

const mailOptions = {
    to      :   receiver_email,            
    from    :   "testertiwary@gmail.com",       
    subject :    "Successfull SignUp with Chat-Room",
    html    :   `<p>Hello User,<p>you are succesfully signed up with us,enjoy chatting</p> <p>Regards,chatroom</p></p>`,
    text    :   "message"
}

transporter.sendMail( mailOptions, (err,info) =>{
   
    if(err) {
            console.log(err)
    }   else   {
        console.log(info)
    }
})
}

module.exports={
    mail_sender
}