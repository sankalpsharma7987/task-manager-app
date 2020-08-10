const express=require('express');
const Task=require('../models/task.js')
const auth=require('../middleware/auth.js');
const { request } = require('express');

//Create router
const router=new express.Router();

//Filter to be applied on this route as there are many tasks that will be created over the period of time
//Get /tasks?completed=true
//Get /tasks?limit=2&skip=2
//Get /tasks?sortBy=createdAt:asc or createdAt:desc
router.get('/tasks',auth,async(req,resp)=>{
    const match={};
    const sort={};

    if(req.query.completed)
    {
      
        match.completed=(req.query.completed==='true')
     
    }

    if(req.query.sortBy)
    {
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=(parts[1]==='desc'?-1:1)
        
    }

    try{
// const tasks=await Task.find({owner:req.user._id})

await req.user.populate({
    path:'mytasks',//This is the name of the virtual column in user model
    match,
    options:{
        limit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort
    }

}).execPopulate();



resp.send(req.user.mytasks);
    }
    catch(error)
    {
        console.log(error)
        resp.status(500).send();
    }
})

router.get('/tasks/:id',auth,async (req,resp)=>{
    //Make sure to enter 12 digit number in the postman app while testing. Else it will run catch block
        const _id=req.params.id
    
    
        try{
// const task=await Task.findById(req.user._id);
const task=await Task.findOne({_id,owner:req.user._id})
if(!task)
{
    return resp.status(404).send();  
}
resp.send(task);
        }
        catch(error)
        {
            resp.status(500).send(error);
        }

        
    
    
    
    })
 

  
router.post('/tasks',auth,async(req,resp)=>{
    // const task=new Task(req.body);    
    const task=new Task(
        {
            ...req.body,//ES6 Spread operator
            owner:req.user._id
        }
    )
    try{
await task.save();
resp.status(201).send(task);

    }
    catch(error){
        resp.status(400).send(error);
    }

   
})

router.delete('/tasks/:id',auth,async(req,resp)=>{
    try{
    
        const task=await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});
    
        if(!task)
        {
            return resp.status(404).send();
        }
    resp.send(task);
    
    }catch(error)
    {
        resp.status(400).send(error);
    }
        
        
        })
    


router.patch('/tasks/:id',auth,async(req,resp)=>{
    const updates=Object.keys(req.body); //Returns key of the objects
const allowedUpdates=['description','completed'];
//Below code will return true if every update in the updates array is part of the allowedUpdates array.
const isValidOperation=updates.every((update)=>allowedUpdates.includes(update));

if(!isValidOperation)
{
    return resp.status(400).send({error:'Invalid Operation'})


}
    try{
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id})
        
        
// const task=await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});


if(!task)
{
    return resp.status(404).send();
}
updates.forEach((update)=>task[update]=req.body[update])
        await task.save();
resp.send(task);
    }
    catch(error)
    {
        resp.status(400).send(error);
    }
})

module.exports=router;