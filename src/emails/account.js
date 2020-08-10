const sgMail=require('@sendgrid/mail')
const sendGridAPIKey=process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendGridAPIKey);
const sendWelcomeEmail=async(email,name)=>{
 
   await sgMail.send({
        to:email,
        from:'sanky87@gmail.com',
        subject:'Welcome to our Task App',
        text:`Thank you ${name} for joining our Task App. Let us know if you have any concerns`


    })

 

     




}

const sendCancelationEmail=async(email,name)=>{
 
    await sgMail.send({
         to:email,
         from:'sanky87@gmail.com',
         subject:'Account Deleted for your Task App',
         text:`We will miss you ${name}. Sorry to see you go.Please let us know if there is anything we can do to improve your experience in future.`
 
 
     })
 
  
 
      
 
 
 
 
 }

module.exports={sendWelcomeEmail,sendCancelationEmail}