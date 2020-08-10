const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const Task=require('../models/task.js')
const sharp=require('sharp')
const jwtSecret=process.env.JWT_SECRET

//Define basic version of user model


const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        password:{
            type:String,
            required:true,
            trim:true,
            minlength:7,
            validate(value)
            {
            if(value.toLowerCase().includes("password"))   
    throw new Error('Password cannot contain the word password in it')
        }
    },
        email:
        {
    type:String,
    unique:true,//This will create an index in the mongodb database
    required:true,
    trim:true,
    lowercase:true,
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error('Email is not valid')
        }
    
    }
        },
        age:{
            type:Number,
            default:0,
            validate(value){
    
                if(value<0){
                    throw new Error('Age must be a positive number')
                }
    
            }
        },
        tokens:[{
            token:{
                type:'String',
                required:true
            }

        }],
        avatar:{
type:Buffer
        }

    },{
        timestamps:true
    }
)
//The virtual column can be any name. In this case it is mytasks. The same column is to be passed as path while calling populate function in the task router
userSchema.virtual('mytasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'//localField will be the local object id field of User Schema and foreignField will be the field Name that is referencing the local field which in our case is the _id
})



userSchema.statics.findByCredentials=async(email,password)=>
{
const user=await User.findOne({email});
if(!user)
{
    throw new Error('Unable to login');

}
const isMatch=await bcrypt.compare(password,user.password);
if(!isMatch){
    throw new Error('Unable to login');

}
return user;
}

userSchema.methods.generateAuthToken=async function()
{
    const user=this;
const token=jwt.sign({_id:user._id.toString()},jwtSecret,{'expiresIn':'30 minutes'})
user.tokens=user.tokens.concat({token});//Adding token to the database
user.save();
return token;


}
/*Retrieve only public information and hide private information.
resp.send implicitly calls JSON.stringify which in return calls the toJSON function
*/
userSchema.methods.toJSON=function(){
    const user=this;
    const userObject=user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.email;
    delete userObject.avatar;
    return userObject;


}
//This middleware logic will be called just before the save event occurs to hash the plain text password.

userSchema.pre('save',async function(next){
    const user=this;

    if(user.isModified('password'))//This will be true if the user is first created and will also be true when the password is updated
    {
user.password=await bcrypt.hash(user.password,8)

    }

    next()//If this line is eliminated, it will hang the function. This line is to inform nodejs of the pre activity getting completed

})

//Delete user tasks when user is deleted
userSchema.pre('remove',async function(next){
    const user=this

await  Task.deleteMany({owner:user._id})

    next()
})
const User=mongoose.model('User',userSchema)

module.exports=User;

