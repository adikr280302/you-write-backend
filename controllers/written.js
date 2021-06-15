const Written = require('../models/written'); 
const {validationResult} = require('express-validator');
const User = require('../models/User');

exports.saveWritten = (req,res,next) =>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed!Something is missing in what you have written!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    
    const title = req.body.title;
    const subject = req.body.subject;
    const date = req.body.date;
    const mainText = req.body.mainText;
    const owner = req.userId;
    const written = new Written({title:title,subject:subject,date:date,mainText:mainText,owner:owner});
    
    written.save()
    .then(result=>{
        return User.findById(owner);
    })
    .then(user=>{
        user.writtens.push(written);
        return user.save();
    })
    .then(result=>{
        res.status(201).json({message:"Written!",id:written._id});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });

}


exports.editWritten = (req,res,next) =>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation Failed!Something is missing in what you have written!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    
    const title = req.body.title;
    const subject = req.body.subject;
    const date = req.body.date;
    const mainText = req.body.mainText;
    const requestBy = req.userId.toString();
    const _id = req.body._id;

    Written.findById(_id)
    .then(written=>{
        if(!written){
            const err = new Error("No such written is found");
            err.statusCode = 404;
            throw err;
        }
        if(written.owner.toString()!==requestBy){
            const err = new Error("Unauthorized!");
            err.statusCode = 401;
            throw err; 
        }
        written.title = title;
        written.date = date;
        written.mainText = mainText;
        written.subject = subject;
        return written.save();
    })
    .then(result=>{
        res.status(201).json({message:"Edited!",id:_id});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });

}




exports.getWrittens = (req,res,next)=>{
    const userId = req.userId;
    const searchTitle = req.query.subject.trim();
    const LIMIT_PER_PAGE = 5;
    const page = parseInt(req.query.page.trim());
    const startIndex = (page-1)*LIMIT_PER_PAGE;
    let userWrittens;
    let totalItem;
    User.findById(userId)
    .then(user=>{
        userWrittens = user.writtens;
        return Written.find({$and:[{_id:{$in:userWrittens}},{title:{$regex:searchTitle,$options:'$i'}}]}).countDocuments();

    })
    .then(numberOfResults=>{
        totalItem = numberOfResults;
        return Written.find({$and:[{_id:{$in:userWrittens}},{title:{$regex:searchTitle,$options:'$i'}}]}).skip(startIndex).limit(LIMIT_PER_PAGE);
    })
    .then(userWrittens=>{
        const combinedWrittens = [];
        userWrittens.forEach(written=>{
            const currWritten = {
                title:written.title,
                date: written.date,
                subject: written.subject,
                _id:written._id,
            };
            combinedWrittens.push(currWritten);
        });
        res.status(201).json({message:"fetched!",writtens:combinedWrittens,hasMore:totalItem-page*LIMIT_PER_PAGE > 0});
    })
    .catch(err=>{
        err.statusCode = err.statusCode || 500;
        next(err);
    })
}




exports.getWritten = (req,res,next)=>{
    const writtenId = req.params.writtenId;

    Written.findById(writtenId)
    .then(written=>{
        if(!written){
            const err = new Error("Written Not Found");
            err.statusCode = 404;
            throw err;
        }

        const writtenOwner = written.owner.toString();
        const requestedBy = req.userId.toString();
        if(writtenOwner===requestedBy){
            res.status(200).json({message:"Fetched!",written:{
                title: written.title,
                date: written.date,
                subject: written.subject,
                mainText: written.mainText
                }
            });
        }
        else{
            const err = new Error("Unauthorized!");
            err.statusCode = 401;
            throw err;
        }
    })
    .catch(err=>{
        err.statusCode = err.statusCode||500;
        next(err);
    })
};




exports.deleteWritten = (req,res,next)=>{

    const writtenId = req.params.writtenId.trim();
    console.log(writtenId);
    let requestedBy;
    Written.findById(writtenId)
    .then(written=>{
        if(!written){
            const error = new Error("No Such Written found!");
            error.statusCode = 404;
            throw error;
        }
        requestedBy = req.userId.toString();
        const writtenOwner = written.owner.toString();
        if(requestedBy!==writtenOwner){
            const error = new Error("Unauthorized!");
            error.statusCode=401;
            throw error;
        }
        return Written.findByIdAndRemove(writtenId);
    })
    .then(result=>{
        return User.findById(requestedBy);
    })
    .then(user=>{
         user.writtens.pull(writtenId);
         return user.save();
    })
    .then(result=>{
        res.status(200).json({message:"DELETED!"});
    })
    .catch((err)=>{
        err.statusCode = err.statusCode || 500;
        next(err);
    })

}