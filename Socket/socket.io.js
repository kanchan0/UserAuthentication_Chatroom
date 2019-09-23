const mongo         =       require("mongodb").MongoClient;
const client        =       require('socket.io').listen(4000).sockets;


const Driver =function(){
       
    //connect to mongo
        mongo.connect('mongodb://127.0.0.1/mongochat',{ useNewUrlParser: true,useUnifiedTopology: true },function(err,cl){
            if(err){
            
                throw err;
            }
            console.log("MongoDB connected for chatroom...");
            const db = cl.db("mongochat");


            //connect to socket.io
            client.on('connection',function(socket){
                     console.log("socket ID>>>>>>>>",socket.id)
                    let chat = db.collection('chats');
                    
                    //function to send status
                    sendStatus = function(s){
                        socket.emit("status",s)
                    }

                    sendTyping = function(s){
                        socket.broadcast.emit("status",s)
                    }

                    //get chats from mongo collection
                    chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
                        if(err){
                            throw err;
                        }
                        //emit the messages
                        socket.emit("output",res)
                        //console.log(res)
                    });


                    //handle input events
                    socket.on('input',function(data){
                        let name = data.name;
                        let message = data.message;
                    
                    //check for name and message
                    if(name==""||message==""){
                        //send error status
                        sendStatus("please ,enter the name and message");
                    }else{
                        //insert message
                        chat.insertOne({name:name,message:message},function(){
                            //console.log([data])
                            client.emit("output",[data])

                        //send status object
                        sendStatus({
                            message:"message sent",
                                clear:true
                            })
                        })
                    }
                });
                socket.on('clear',function(){
                    //remove all chats from collection
                    chat.deleteMany({},function(){
                        socket.emit('cleared')
                    })
                })

                // for showing which client is typing
                socket.on("typing",function(data){
                    sendTyping({message:`${data.user_name} is typing ... `})
                })
                //socket.to(socket.id).emit
            })
        })
}
module.exports = Driver;