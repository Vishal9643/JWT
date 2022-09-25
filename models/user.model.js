const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const usersSchema = Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
});

usersSchema.pre('save', async  function (next){
    try {
        console.log(`hashing.......`);
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password=hashedPassword;
        console.log(hashedPassword);
        next();
    } catch (error) {
        next(error);
    }
});





// usersSchema.methods.isValidPassword = async function (password) {
//     try {
//       return await bcrypt.compare(password, this.password)
//     } catch (error) {
//       throw error
//     }
//   }


const usersModel = mongoose.model('users', usersSchema);

module.exports = usersModel;
