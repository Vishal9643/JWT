const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const morgan = require('morgan');
const Authroute = require("./routes/auth.route");
const createError = require('http-errors');
require('./helpers/init_redis');
require('./helpers/init_mongodb');
const userModel = require('./models/user.model');
const {verifyAccessToken}=require('./helpers/jwt_helper');

const PORT = process.env.PORT || 4000

const app = express();


app.use(express.json());

app.use(morgan('dev'));
app.use('/Auth',Authroute);

app.get('/',verifyAccessToken,(req,res,next)=>{
    res.send('hello from express');
});

app.use(async (req,res,next)=>{
    // const error = "Not Found";
    // error.status =404;
    // next(error); 
    next(createError.NotFound())
});

app.use((err,req,res,next)=>{
    res.status(err.status || 500);
    res.send({
        error: {
            status: err.status,
            message: err.message
        }
    })
})

app.listen(PORT, ()=>{
    console.log(`listening on port ==>>> ${PORT}`);
});