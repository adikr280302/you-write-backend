const express = require('express');
const writtenControllers = require('../controllers/written');
const {body} = require('express-validator');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/save',isAuth,
[body('title').trim().isLength({min:1}).withMessage('Enter TITLE'),
body('date').trim().isLength({min:1}).withMessage('Enter DATE'),
body('subject').trim().isLength({min:1}).withMessage('Enter SUBJECT'),
body('mainText').trim().isLength({min:1}).withMessage('Enter main Text')],writtenControllers.saveWritten);


router.post('/edit',isAuth,
[body('title').trim().isLength({min:1}).withMessage('Enter TITLE'),
body('date').trim().isLength({min:1}).withMessage('Enter DATE'),
body('subject').trim().isLength({min:1}).withMessage('Enter SUBJECT'),
body('mainText').trim().isLength({min:1}).withMessage('Enter main Text'),
body('_id').trim().isLength({min:1})],writtenControllers.editWritten);



router.get('/fetch',isAuth,writtenControllers.getWrittens);

router.get('/fetch/:writtenId',isAuth,writtenControllers.getWritten);

router.post('/delete/:writtenId',isAuth,writtenControllers.deleteWritten);

module.exports = router;