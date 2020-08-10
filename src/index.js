const {app}=require('./app.js')
const port=process.env.PORT



//Listening port for the app
app.listen(port,()=>{
    console.log('Server is listening on port '+port);
});






