const connectionServer=process.env.MONGODB_URL
const mongoose=require('mongoose');
const connectionURL=connectionServer
mongoose.connect(connectionURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
})





   



