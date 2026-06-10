import mongoose from "mongoose";


const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, "name is required!"]
    },

    email: {
        type: String,
        required: [true, "email is required!"]
    },

    age: {

        type: Number,
        required: [true, "age is required!"]
    }

})

export const userModel = mongoose.model('users', userSchema)
