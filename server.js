if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const User = require('./models/user.js')
const Rooms = require('./models/Rooms.js')
const Bookings = require('./models/Bookings.js')
const { render } = require('ejs')


mongoose.set('strictQuery', true);
const connect = async () => {
    try {
        await mongoose.connect(process.env.dbURI);
        console.log("Connected to database")
    } catch (error) {
        console.log("Error connecting to the database")
    }
};



// const users = []; //must save in a db
const hostname = "127.0.0.1";
const port = 8000;


app.set("view-engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
//app.use(express.json);
app.use(methodOverride('_method'))

const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
    passwordField: 'password'
}, function (email, password, done) {
    User.findOne({ email: email }, function (err, user) {
        if (user == null) {
            return done(null, false, { message: 'No user with that email' })
        }

        bcrypt.compare(password, user.password, function (err, res) {
            if (err) return done(err);
            if (res === false) return done(null, false, { message: 'Incorrect password.' });

            return done(null, user);
        });
    });
}));


passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    })
}


)





app.get("/", function (request, response) {
    connect();
    response.render("index.ejs", { isUserLoggedIn: request.isAuthenticated() });
    console.log(request.user)
});


app.get("/logIn", checkAuthenticated, function (request, response) {
    response.render("logIn.ejs")
});



app.get("/SignUp", checkAuthenticated, function (request, response) {
    response.render("SignUp.ejs");
});


app.get("/About", function (request, response) {
    response.render("About.ejs")
});

app.get("/Careers", isAdmin,function (request, response) {
    response.render("Careers.ejs")
});

app.get("/CustomerSupport", function (request, response) {
    response.render("CustomerSupport.ejs")
});

app.get('/profile', checkNotAuthenticated, function (request, response) {
    response.render('profile.ejs');
});
app.get("/personal_Info", checkNotAuthenticated, function (request, response) {
    User.findById(request.user.id, function (err, data) {
        if (err) console.log(err)
        if (data)
            console.log(data)
        response.render("personal_Info.ejs", { x: data.email })

    })



});
app.get("/Reservation", checkNotAuthenticated, function (request, response) {
    response.render("Reservation.ejs")
});
app.get("/payment", checkNotAuthenticated, function (request, response) { // we need to check if the customer has chosen a room before going to this page
    response.render("payment.ejs")
});
app.get('/Bookings', function (request, response) {
    response.render('Bookings.ejs');

});


app.post("/Index", checkNotAuthenticated, function (request, response) {
    console.log(request.body.guestNumber)
    console.log(request.body.dateOut)
    console.log(request.body.dateIn)
    response.redirect("/Reservation")
});


app.post("/SignUp", async function (request, response) {
    try {
        connect();
        const exists = await User.exists({ email: request.body.email })
        if (exists) {
            response.redirect("/logIn");
            return;
        }


        const hashedPassword = await bcrypt.hash(request.body.password, 10)
        const newUser = new User({
            UserID: Date.now().toString(),
            email: request.body.email,
            password: hashedPassword
        })

        newUser.save();

        // users.push({
        //     id: Date.now().toString(),
        //     email: request.body.email,
        //     password: hashedPassword

        // });
        response.redirect("/logIn")
    } catch {
        response.redirect("/SignUp")
    }
});


app.post("/logIn", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/logIn",
    failureFlash: true
}));


app.post("/payment", checkNotAuthenticated, function (request, response) {
    console.log(request.body)
});



app.delete('/logout', (request, response) => {
    request.logOut(function (error) {
        if (error) {
            return next(error)
        }
        response.redirect('/')
    })
})


app.listen(port, hostname, function () {
    console.log("Server Started on http://127.0.0.1:8000");

});


function checkAuthenticated(request, response, next) {
    if (request.isAuthenticated()) {
        return response.redirect("/");
    }
    next();

}


function checkNotAuthenticated(request, response, next) {
    if (request.isAuthenticated()) {
        return next();
    }
    return response.redirect("/logIn");


}

function isAdmin(request, response, next) {
    if (request.isAuthenticated() && request.user.email === "a1@gmail.com") {
        return next()
    } else {
        return response.redirect("/");
    }
}





function dateDiffInDays(a, b) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}