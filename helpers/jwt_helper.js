const JWT = require('jsonwebtoken');
const createError=require('http-errors');
const client = require('./init_redis');
const { create } = require('../models/user.model');

module.exports={
    signAccessToken: (userid) =>{
        return new Promise((resolve,reject)=>{
            const payload = {
                
            };
            const secret = process.env.ACCESS_TOKEN_SECRET;
            const option = {
                expiresIn: '30s',
                issuer: 'test.test',
                audience: userid
            };
            JWT.sign(payload,secret,option,(err,token)=>{
                if(err){
                    console.log(err)
                    reject(createError.InternalServerError());
                }
                resolve(token);
            })
        })
    },
    verifyAccessToken : (req,res,next) =>{
        if(!req.headers['authorization']) return next(createError.Unauthorized());
        const authHeader = req.headers['authorization'];
        const bearerToken =authHeader.split(' ');
        const token = bearerToken[1];
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,payload)=>{
            if(err){
                // next(createError.Unauthorized());
                const message = err.name==='JsonWebTokenError' ? 'unautorized' : err.message;
                return next(createError.Unauthorized(message));
            }
            req.payload = payload;
            next()
        })
    },
    signRefreshToken : (userid)=>{
        return new Promise((resolve,reject)=>{
            const payload ={};
            const secret = process.env.REFRESH_TOKEN_SECRET;
            const option = {
                expiresIn: '1y',
                audience: userid,
                issuer: 'test@test.com'
            };
            
            JWT.sign(payload,secret,option,(err,token)=>{
                if(err){
                    console.log(err);
                    return reject(createError.InternalServerError());
                }
                client.SET(userid,token,'EX',365*24*60*60,(err,reply)=>{
                    if(err){
                        console.log(err);
                        return reject(createError.InternalServerError());
                        
                    }
                    resolve(token);
                   
                })
            })
        })
    },
    verifyRefreshToken : (refreshToken) =>{
        return new Promise((resolve, reject)=>{
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err,payload)=>{
                if(err) return reject(createError.Unauthorized());
                const userId = payload.aud;
                console.log('inside verify')
                client.GET(userId,(err,result)=>{ 
                    if(err){
                        console.log(err);
                        return createError.InternalServerError();
                    }
                    if(refreshToken===result) return resolve(userId);
                    return reject(createError.Unauthorized());

                })

                 
            });

        })
    }
}