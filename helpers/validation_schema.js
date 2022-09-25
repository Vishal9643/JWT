const joi = require('@hapi/joi');

const authSchema = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().required()
});

module.exports = {
    authSchema : authSchema
}