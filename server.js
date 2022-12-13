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
const booking = require('./models/bookings.js')
const { render } = require('ejs')

//mongodb+srv://admin:admin@cluster0.3yhleww.mongodb.net/?retryWrites=true&w=majority

mongoose.set('strictQuery', false);
const connect = async () => {
    try {
        await mongoose.connect(process.env.dbURI);
        console.log("Connected to database")
    } catch (error) {
        console.log("Error connecting to the database")
    }
};



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




let alert = require('alert');

app.get("/Add_Room", isAdmin, function (request, response) {
    connect();
    response.render("Add_Room.ejs");

});

app.post("/Add_Room", async function (request, response) {
    const exists = await Rooms.exists({ roomNum: request.body.roomNumber })
    if (exists) {
        response.redirect("/Add_Room");
        alert("Room already exists")
        return;
    }
    const newRoom = new Rooms(
        {
            roomNum: request.body.roomNumber,
            discribtion: request.body.desc,
            type: request.body.room_type,
        })
    newRoom.save();
    alert("Room added")
    response.redirect("/Add_Room")


});


app.get("/delete_Room", isAdmin, function (request, response) {
    connect();
    response.render("delete_Room.ejs");

});

app.post("/delete_Room", async function (request, response) {

    const exists = await Rooms.exists({ roomNum: request.body.roomNumber })

    if (exists) {
        roomNumberx = await Rooms.find({ roomNum: request.body.roomNumber })

        if (!roomNumberx[0].Reserved) {
            await Rooms.deleteOne({ roomNum: request.body.roomNumber });
            alert("Room deleted")
        } else {
            alert("Room cannot be deleted (it is reserved)")

        }
    }
    else {
        alert("No rooms with that number")

    }
    response.redirect("/delete_Room")


});






app.get("/", function (request, response) {
    connect();
    response.render("index.ejs", { isUserLoggedIn: request.isAuthenticated() });
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

app.get("/Careers", function (request, response) {
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

        if (data) {
            return response.render("personal_Info.ejs",
                {
                    userEmail: data.email,
                    userPhone: data.Phone_Number,
                    userFname: data.FName,
                    userLname: data.LName,
                    userCountry: data.Country,
                    userAddress: data.Address,
                    userPostal: data.Postal_Code
                })
        }
    })


});
app.get("/Reservation", checkNotAuthenticated, function (request, response) {

    response.render("Reservation.ejs")
});
app.get("/payment", checkNotAuthenticated, function (request, response) { // we need to check if the customer has chosen a room before going to this page
    response.render("payment.ejs")
});
app.get('/Bookings', function (request, response) {
    // HERE SALEH!!!
    // console.log(request.user.userID)
    // booking.find(UserID: )
    response.render('Bookings.ejs');

});


app.post("/Index", checkNotAuthenticated, function (request, response) {
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
            password: hashedPassword,
            Phone_Number: request.body.Phone_Number,
            FName: request.body.FName,
            LName: request.body.LName,
            Country: request.body.Country,
            Address: request.body.Address,
            Postal_Code: request.body.Postal_Code


        })
        newUser.save();

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


app.post("/payment", checkNotAuthenticated, async function (request, response) {
    const RoomType = request.body.Room_type;

    try {
        let RoomData = await Rooms.findOne({ type: RoomType, Reserved: false })
        await Rooms.findByIdAndUpdate(RoomData.id, { Reserved: true })
        const newBooking = new booking(
            {
                UserID: request.user.UserID,
                Room_Number: RoomData.roomNum,
                Check_in: request.body.Check_in,
                Check_out: request.body.Check_out
            })

        const saveBooking = await newBooking.save();
    } catch (error) {
        console.log("Rooms full") // fix this later
    }
    response.redirect("/")

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
    if (request.isAuthenticated() && request.user.Admin === true) {
        return next()
    } else {
        return response.redirect("/");
    }
}