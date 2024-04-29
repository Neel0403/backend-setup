import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true      // for searching
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,  // cloudinary url
        required: true,
    },
    coverImage: {
        type: String,  // cloudinary url
    },
    watchHistory: [
        {
            type: mongoose.Schema.types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        typr: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

// callback not used bcoz it doesnt give access to "this" keyword,hence context is not defined
userSchema.pre("save", async function (next) {
    // save the hashed password only if password field is modified
    if (!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)  // 10 is no. of rounds
    next()
})


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)   // this.password is the encrypted password 
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }

    )
}

export const User = mongoose.model("User", userSchema)