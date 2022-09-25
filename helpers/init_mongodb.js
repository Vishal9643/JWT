const mongoose = require('mongoose');
const dbConnection = mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useunifiedTopology: true
}).then(()=>{
    console.log('Connection Established');
}).catch((err)=>{
    console.log(`error: ${err}`);
})


mongoose.connection.on('connected',()=>{
    console.log(`mongoose is connected to the database`);
});

mongoose.connection.on('error',(err)=>{
    console.log(`error occured : ${err}`);
});

mongoose.connection.on('disconnected',()=>{
    console.log(`mongoose is disconnected to the database`);
});

process.on('SIGINT',async ()=>{
    await mongoose.connection.close();
    process.on(0);
})


module.exports = dbConnection;