const mongoose=require('mongoose');

const taskSchema=new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,//This means the data being stored will be an ObjectID of type from Mongoose Schema
        required:true,
        ref:'User'//The model name to refer.This has to be exactly the same as the the model created for user.

    }
},{
    timestamps:true
})
const Task=mongoose.model('Task',taskSchema)

module.exports=Task;
