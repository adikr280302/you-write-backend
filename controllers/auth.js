const {validationResult} = require('express-validator');
const bycrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.signUp = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bycrypt.hash(password,12)
    .then(hashedPassword=>{
        const user = new User({
            name:name,
            email:email,
            password:hashedPassword,

        });
        return user.save();
    })
    .then(result=>{
        res.status(201).json({message:"User Created!", userId: result._id});
    })
    
    
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}; 

exports.editUser = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const userId = req.userId;
    let hPass=null;
    bycrypt.hash(password,12)
    .then(hashedPassword=>{
        hPass = hashedPassword;
        return User.findById(userId)
    })
    .then(user=>{
        user.name = name;
        user.email = email;
        user.password = hPass;
        return user.save();
    })
    .then(result=>{
        res.status(200).json({message:"User updated", userId: result._id});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.login = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("This email or password is not possible");
        error.statusCode = 400;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    let foundUser;
    User.findOne({email:email})
    .then(user=>{
        if(!user){
            const error = new Error("A user with this email could not be found");
            error.statusCode = 402;
            throw error;
        }
         foundUser = user;
         return bycrypt.compare(password,user.password);

    })
    .then(isEqual=>{
        if(!isEqual){
            const error = new Error("Invalid Password");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({
            email: foundUser.email,
            userId: foundUser._id.toString()
        },'kjkj!#@#@!$nbsjk34njknsdhfi4',
        {expiresIn:'1h'});
        res.status(200).json({token:token,userId:foundUser._id.toString()});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};


exports.getUser = (req,res,next)=>{
    const userId = req.userId;
    User.findOne({_id:userId})
    .then(user=>{
        if(!user){
            const error = new Error("A user with this email could not be found");
            error.statusCode = 402;
            throw error;
        }
        res.status(200).json({user:{email:user.email,name:user.name}});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};