const mongo         =       require("mongodb").MongoClient;
const client        =       require('socket.io').listen(4000).sockets;
const schedule      =       require("node-schedule");

const Driver =function(){
       
    //connect to mongo
        mongo.connect('mongodb://127.0.0.1/passport_auth',{ useNewUrlParser: true,useUnifiedTopology: true },function(err,cl){
            if(err){
            
                throw err;
            }
            console.log("MongoDB connected for chatroom collection...");
            const db = cl.db("passport_auth");
            

            //connect to socket.io
            client.on('connection',function(socket){
                console.log("socket ID>>>>>>>>",socket.id)
                let soc_id=socket.id;
                    socket.on("online_users",function(data){
                        
                        socket.broadcast.emit('users_online',[data])
                        socket.on('disconnect',function(){
                            console.log("disconnected socket_id",soc_id,data);
                            socket.broadcast.emit("Disconnected_user",data)

                        })
                    })
                        // schedule.scheduleJob('/1 * * * * *',function(){
                        //     socket.emit('users_online',online_user);  
                        // })

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
                })
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
               
            })
        })
}
module.exports = Driver;