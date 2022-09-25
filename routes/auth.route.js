const express = require('express');
const { token } = require('morgan');
const router = express.Router();
const {
    register,
    login,
    refresh_token,
    logout} = require('../controller/auth.controller');



router.post('/register',register );

router.post('/login', login);

router.post('/refresh-token', refresh_token);

router.delete('/logout', logout);

module.exports = router;