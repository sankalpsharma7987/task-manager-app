const express=require('express');
const User=require('../models/user.js')
const auth=require('../middleware/auth.js')
const multer=require('multer');
const sharp = require('sharp');
const {sendWelcomeEmail,sendCancelationEmail}=require('../emails/account.js')


//Create router
const router=new express.Router();

router.get('/users/me',auth,async (req,resp)=>{
//This code will be called after the user has been authenticated by auth.js file
    resp.send(req.user);
    
    })
    
        
    router.post('/users/login',async(req,resp)=>{
        try{

            const user=await User.findByCredentials(req.body.email,req.body.password);//This line of code is more preferred if operation to do is from the collection of the user
            const token=await user.generateAuthToken()//This line of code is preferred as the operation will be done for a specific user.In this case we will generate token for this user
            
            if(!user)
        {
            return resp.status(400).send();
        }
        
            resp.send({user,token});



        }
        catch(error)
        {
       
resp.status(400).send();
        }

    })

    router.post('/users/logout',auth,async(req,resp)=>{
        try{
            //Token in the filter function is an object. Hence token.token
           req.user.tokens=req.user.tokens.filter((token)=>{
               return token.token!=req.token;
           })
           
           await req.user.save();

         resp.send('User logout successfully')  
        }
        
        catch(error){
resp.status(500).send()
        }
       

    })


    router.post('/users/logoutAll',auth,async(req,resp)=>{
        try{
            //Token in the filter function is an object. Hence token.token
           req.user.tokens=[];
           
           await req.user.save();
           

         resp.send('User logout from all active sessions')  
        }
        
        catch(error){
resp.status(500).send()
        }
       

    })


        router.post('/users',async (req,resp)=>{
        
            const user=new User(req.body);
            
            
        try{
            await user.save();//This line of code will always call the pre middleware logic to save the password in hash values
            sendWelcomeEmail(user.email,user.name)
            const token=await user.generateAuthToken()
            resp.status(201).send({user,token});
        }catch(error)
        {
    
            resp.status(400).send(error);
        }
           
        
        })


        
    
        router.delete('/users/me',auth,async(req,resp)=>{
            try{
            
                // const user=await User.findByIdAndDelete(req.user._id);
            
                // if(!user)
                // {
                //     return resp.status(404).send();
                // }
                
                await req.user.remove(); //Remove is a mongoose function to remove object from the database. The object to be deleted will call the remove function
                sendCancelationEmail(req.user.email,req.user.name)
            resp.send(req.user);
            
            }catch(error)
            {
                resp.status(400).send(error);
            }
                
                
                })
            
    router.patch('/users/me',auth,async(req,resp)=>{
        const updates=Object.keys(req.body); //Returns key of the objects
        
    const allowedUpdates=['name','email','password','age'];
    //Below code will return true if every update in the updates array is part of the allowedUpdates array.
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update));
    
    if(!isValidOperation)
    {
        return resp.status(400).send({error:'Invalid Operation'})
    
    
    }
        try{
            //Using auth and JSON Web token to update user
            updates.forEach((update)=>req.user[update]=req.body[update]);
            await req.user.save();
            
            // //The below three lines are changed in order to hash the password and call the mongoose pre middleware logic, everytime when the password is updated.
            // const user=await User.findById(req.params.id);//First find the user by Id
            // const user=req.user
            // updates.forEach((update)=>user[update]=req.body[update])//Change the values using forEach
            // await user.save();//Call the save function, in order to execute the pre middleware logic that is present in the userSchema in user model
    // const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
    
    
    resp.send(req.user);
        }
        catch(error)
        {
            resp.status(400).send(error);
        }
    })
    

    const upload=multer({
        // dest:'avatars',This line of code is useful if the uploaded file is to be saved in a file-system.If not used, the uploaded data will be returned
        limits:{
            fileSize:1000000
            },
        fileFilter(req,file,cb){
            if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
                return cb(new Error('Please upload an image of jpg,jpeg or png format'))
            }
            cb(undefined,true)
            
        }
    })
    router.post('/user/me/avatar',auth,upload.single('avatar'),async(req,resp)=>{
        const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()//Sharp npm package to resize image
        // req.user.avatar=req.file.buffer;
        req.user.avatar=buffer;
        await req.user.save();
        resp.send();
    },(error,req,resp,next)=>{
resp.status(400).send({error:error.message})
    })

router.delete('/user/me/avatar',auth,async(req,resp)=>{
    req.user.avatar=undefined;
    await req.user.save();
    resp.send()
},(error,req,resp,next)=>{
    resp.status(400).send({error:error.message})

})
//Auth is not used as the verification of image upload is done through app and not through PostMan
router.get('/user/:id/avatar',async(req,resp)=>{
    try{
        const user=await User.findById(req.params.id);

        if(!user||!user.avatar)
    {
throw new Error()
    }
    resp.set('Content-Type','image/png')
    
resp.send(user.avatar);

    }
    


    catch(error)
    {
        resp.status(404).send();
    }

})
module.exports=router;