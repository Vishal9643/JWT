const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { authSchema } = require('../helpers/validation_schema');
const usersModel = require('../models/user.model');
const createError = require('http-errors');
const { signAccessToken, signRefreshToken, verifyRefreshToken} = require('../helpers/jwt_helper');
const redis = require('../helpers/init_redis');
const client = require('../helpers/init_redis');
const { create } = require('../models/user.model');

module.exports = {
    register: async (req, res, next) => {
        console.log(req.body);
        try {
            result = await authSchema.validateAsync(req.body);
            const doesExist = await usersModel.findOne({ email: result.email });
            if (doesExist) throw createError.Conflict(`${req.body.email} already existed`);
    
            const user = new usersModel(result);
            const savedUser = await user.save();
            const accessToken = await signAccessToken(savedUser.id);
            const refreshToken = await signRefreshToken(savedUser.id);
            res.send({ accessToken, refreshToken });
        } catch (error) {
            if (error.isJoi === true) throw createError.UnprocessableEntity();
            next(error);
        }
    
    },
    login: async (req, res, next) => {
        console.log(req.body);
        try {
            result = await authSchema.validateAsync(req.body);
            const doesExist = await usersModel.findOne({ email: result.email });
            if (!doesExist) throw next(createError.NotFound("User is not registered"));
            const isMatch = await bcrypt.compare(result.password, doesExist.password);
            if (!isMatch) throw createError.BadRequest('Email/Password is incorrect');
            const accessToken = await signAccessToken(doesExist.id);
            const refreshToken = await signRefreshToken(doesExist.id);
            res.send({accessToken: accessToken, refreshToken: refreshToken});
    
        } catch (error) {
            next(error);
        }
    },
    refresh_token:async (req, res, next) => {
        console.log(req.body);
        try {
            const {refreshToken}=req.body;
            if(!refreshToken) throw next(createError.BadRequest());
            const userId = await verifyRefreshToken(refreshToken);
            console.log(`userid: ${userId}`)
            const accessToken = await signAccessToken(userId);
            console.log(accessToken);
            const refToken = await signRefreshToken(userId);
            console.log(refToken);
            res.send({accessToken :accessToken, refreshToken : refToken});
    
        } catch (error) {
            next(error);
        }
    },
    logout:async (req, res, next) => {
        try {
            const {refreshToken} = req.body;
            if(!refreshToken) throw createError.BadRequest();
            const userId = await verifyRefreshToken(refreshToken);
            client.DEL(userId, (err, val)=>{
                if(err){
                    console.log(err);
                    return createError.InternalServerError();
                }
                console.log(val);
                res.send('logged out');
            })
        } catch (error) {
            next(error);
        }
    }
}