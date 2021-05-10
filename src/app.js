const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config({path:'./src/.env'});
const session = require('express-session');
const hbs  = require('express-handlebars');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const path = require('path');
const {auth} = require('./middlewares');
require('dotenv').config({path:'../src/.env'});
var flash = require('connect-flash');

const port = process.env.DEVELOPEMENT?3000:process.env.PORT;
const app = express();

app.use(flash());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
const viewsDirectoryPath = path.join(__dirname, './views');

//View engine

app.engine('hbs', hbs({ extname: 'hbs',helpers: require('./config/handlebars-helpers'), defaultLayout: 'dashboard', layoutsDir: __dirname + '/views/layouts/',}));
app.set('view engine', 'hbs');
app.set('views', viewsDirectoryPath)


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

app.get('/',  function(req, res) {
    res.render('login', {layout: false});
});

app.get('/home',auth, (req, res)=>{
    res.render('home', {email: req.user.email});
});


//Import routes

const Users = require('./routes/users');
const Sessions = require('./routes/sessions');
const Companies =require('./routes/companies');
const Balances =require('./routes/balances');
const ProfitReports = require('./routes/profitReports');
const AnalysisResults = require('./routes/analysisResults')
const BreakEvenAnalysis = require('./routes/breakEvenAnalysis')


//Import view routes
const Raportid = require('./view-routes/raportid')
const newReport = require('./view-routes/newReport')
const reportResult = require('./view-routes/reportResult')
const settings = require('./view-routes/settings')

//Route middlewares

app.use('/breakEvenAnalysis', BreakEvenAnalysis);
app.use('/analysisResults', AnalysisResults);
app.use('/profitReports', ProfitReports);
app.use('/balances', Balances);
app.use('/companies', Companies);
app.use('/users', Users);
app.use('/', Sessions);
app.use('/raportid',Raportid)
app.use('/uusRaport', newReport)
app.use('/raport',reportResult)
app.use('/seaded', settings)

//Setup serer

app.listen(port, ()=>{
    console.log('Server is up and running');
});