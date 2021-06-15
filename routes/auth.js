const express = require('express');
const authControllers = require('../controllers/auth');
const {body} = require('express-validator');
const User = require('../models/User');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

router.post("/signup",[
    body('email')
        .trim()
            .isEmail()
                .withMessage("Enter Valid Email")
                   .normalizeEmail()
                        .custom((value,{req})=>{
                            return User.findOne({email:value})
                                            .then(userDoc=>{
                                                if(userDoc){
                                                    return Promise.reject("E-mail address Already Exists!");
                                                }
                                            })

                        }),
    body('password').trim().isLength({min:5}),
    body('name').trim().isLength({min:1})
],authControllers.signUp);


router.post("/login",
                [body('email').trim().isEmail().withMessage("This email is not possible").normalizeEmail(),
                body('password').trim().isLength({min:5}).withMessage("This password is not possible")],
                authControllers.login);

router.get("/user",isAuth,authControllers.getUser);

router.post("/edit",isAuth,[
    body('email')
        .trim()
            .isEmail()
                .withMessage("Enter Valid Email")
                   .normalizeEmail()
                        .custom((value,{req})=>{
                            return User.findOne({email:value})
                                            .then(userDoc=>{
                                                if(userDoc){
                                                    if(userDoc._id.toString() !== req.userId ){
                                                        return Promise.reject("E-mail address Already Exists!");
                                                    }
                                                }
                                            })

                        }),
    body('password').trim().isLength({min:5}),
    body('name').trim().isLength({min:1})
],authControllers.editUser);

module.exports = router;