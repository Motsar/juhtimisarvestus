const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({path:'./src/.env'});

const app = express();

//Import routes
const Users = require('./routes/users');

//Connect to database
mongoose.connect(process.env.DB_CONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    },
    () => {
        console.log('connected to db')
    });

//Route middlewares
app.use('/', Users);


app.use(express.json());

//Setup serer
app.listen(3000, ()=>{
    console.log('Server is up and running');
})