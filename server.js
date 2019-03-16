const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

const userLog = require('./models/basic-auth').auth;
const initDb = require("./models/db").initDb;
const getDb = require("./models/db").getDb;
const getSystems = require("./models/db").getSystems;

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static('public'));

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

let sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/crossroad');
    } else {
        next();
    }
};

// Route

app.get('/', sessionChecker, (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/crossroad');
    } else {
        res.redirect('/login');
    }
});

app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
	})

    .post((req, res) => {
        var username = req.body.username,
			password = req.body.password;

		userLog(username,password,(user)=>{
            if (!user) {
                res.redirect('/login');
            }else{
                req.session.user = user;
                req.session.rand = Math.random()*100;
                res.redirect('/crossroad');
            }
        });
	});

// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.get('/crossroad', (req, res) => {
	if (req.session.user && req.cookies.user_sid) {
		res.sendFile(__dirname + '/public/crossroad.html');
	} else {
		res.redirect('/login');
	}
});

app.get('/chooseSystem', (req, res) => {
	if (req.session.user && req.cookies.user_sid) {
		res.sendFile(__dirname + '/public/chooseSystem.html');
	} else {
		res.redirect('/login');
	}
});

app.get('/chooseSystemData', (req, res) => {
	if (req.session.user && req.cookies.user_sid) {
        console.log(req.session.user);
        getSystems(req.session.user.id,(systems)=>{
            console.log(systems)
            res.json('hello');
        });
	} else {
		res.redirect('/login');
	}
});

initDb(function(err){
	const server = app.listen(port, function () {
		console.log('Server listening on port ' + port);
	});
});
