const mongo         =       require("mongodb").MongoClient;
const ios           =       require('socket.io').listen(4000)
const client        =       ios.sockets;
const User          =       require('../modals/User')

const Driver =function(){  
    //connect to mongo
        mongo.connect('mongodb://127.0.0.1/passport_auth',{ 
            useNewUrlParser: true,
            useUnifiedTopology: true 
            },function(err,cl){  

                    if(err){ throw err; }
                    console.log("MongoDB connected for chatroom collection...");
                    const db = cl.db("passport_auth");
                    let online=[];

                    //  function sendAllUser(){
                    //      User.find({})
                    //         .then(result=>{
                    //             if(result){
                    //                 let output=[]
                    //                 result.forEach(res=>{
                    //                     output.push(res.name)
                    //                 })
                    //                 console.log(output);
                    //                 return output;
                                    
                                   
                    //             }

                    //         })
                    //         .catch(err=>err)    
                    //   }
                    
                    //connect to socket.io
                    client.on('connection',function(socket){
                        console.log("socket ID>>>>>>>>",socket.id)
                        //let soc_id=socket.id;
                            socket.on("user_Connected",function(data){
                                online.push(data)
                                let unique = [...new Set(online)]
                                socket.emit('users_online',unique);
                                socket.broadcast.emit('users_online',unique);
                                socket.on('disconnect',function(){
                                    // console.log("disconnected socket_id",soc_id,data);
                                        let a = unique.indexOf(data);
                                        unique.splice(a,1)
                                        online=unique;
                                        socket.broadcast.emit('users_online',online);
                                    //socket.broadcast.emit("Disconnected_user",data);
                                    //console.log(ios.sockets.adapter.sids)
                                });
                        });
                    
                        let chat = db.collection('chats');
                        //function to send status
                        sendStatus = function(s){
                            socket.emit("status",s)
                        };

                        // for showing which client is typing
                        socket.on("typing",function(data){
                            socket.broadcast.emit("typing_status",`${data.user_name} is typing ... `);
                        });

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
                                    });
                                });
                            }

                            socket.on('clear',function(x){
                                if(x){
                                //remove all chats from collection
                                chat.deleteMany({},function(){
                                    socket.emit('cleared')
                                });
                              }
                            })
                    });
                });
      })
}

module.exports = Driver;