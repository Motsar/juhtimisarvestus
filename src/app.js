const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config({path:'./src/.env'});
const session = require('express-session');
const hbs  = require('express-handlebars');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const path = require('path');
const env = require('dotenv').config();
const {notAuth} = require('./middlewares');
require('dotenv').config({path:'../src/.env'});
var flash = require('connect-flash');

const app = express();
app.use(flash());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
const viewsDirectoryPath = path.join(__dirname, './views');

//View engine

app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname+'/views'))

//Setup static directory to serv
app.use(express.static(viewsDirectoryPath))

//Connect to db
mongoose.connect(process.env.DB_CONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    },
    () => {
        console.log('connected to db')
});

//express-sessions setup

app.use(session({
        name: "sid",
        resave: false,
        rolling: true,
        saveUninitialized:true,
        secret: process.env.SESS_SECRET,
        store: new MongoStore({mongooseConnection: mongoose.connection}),
        cookie:{
            maxAge: 1000 * 60 * 15,
            secure: false,
        }
    })
)

passport.serializeUser(function(user, cb) { cb(null, user); });
passport.deserializeUser(function(obj, cb) { cb(null, obj); })

// Passport setup

app.use(passport.initialize());
app.use(passport.session());

//views

app.get('/', notAuth, function(req, res) {
    res.render('auth', {layout: false});
});

//Import routes

const Users = require('./routes/users');
const Sessions = require('./routes/sessions');
const Companies =require('./routes/companies');
const Balances =require('./routes/balances');

//Route middlewares

app.use('/balances', Balances);
app.use('/companies', Companies);
app.use('/users', Users);
app.use('/', Sessions);

//Setup serer

app.listen(3000, ()=>{
    console.log('Server is up and running');
})
