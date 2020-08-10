const express=require('express');
const app=express();
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task');
require('../src/db/mongoose.js')
//Below line will automatically parse the incoming JSON to an object
app.use(express.json())

//Register the routers defined
app.use(userRouter);
app.use(taskRouter);

module.exports={app}





