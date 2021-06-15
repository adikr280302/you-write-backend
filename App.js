const express = require('express');
const bodyPareser = require('body-parser');
const mongoose = require('mongoose');
const writtenRoutes = require('./routes/written');
const authRoutes = require('./routes/auth');
const helmet = require("helmet");
const compression = require('compression')
const app = express();


app.use(helmet());
app.use(compression());
app.use(bodyPareser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  }
);
app.use("/written",writtenRoutes);
app.use("/auth",authRoutes);

app.use((error,req,res,next)=>{
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message:message, data:data});
});
const MONGO_DB_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.cdhg9.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`;
mongoose.connect(MONGO_DB_URL,
{ useUnifiedTopology: true , useNewUrlParser: true,useCreateIndex : true})
    .then(
        result=>{
            console.log("Database connected!");
            app.listen(process.env.PORT || 8080);
        })
    .catch(err=>console.log(err));

