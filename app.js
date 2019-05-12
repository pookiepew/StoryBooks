const express = require('express')
const path = require('path')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')

// Load MongoDB models
require('./models/User')
require('./models/Story')

// Passport config
require('./config/passport')(passport)

// Load routes
const auth = require('./routes/auth')
const index = require('./routes/index')
const stories = require('./routes/stories')

// Load keys
const keys = require('./config/keys')

// Handlebars helpers
const {
    truncate,
    stripTags
} = require('./helpers/hbs')

// Mongoose connect
mongoose
    .connect(keys.mongoURI, { useNewUrlParser: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err))

const app = express();

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Handlebars middleware
app.engine('handlebars', exphbs({
    helpers: {
        truncate: truncate,
        stripTags: stripTags
    },
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')

app.use(cookieParser())
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Global variables
app.use((req, res, next) => {
    res.locals.user = req.user || null
    next()
})

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Use Routes
app.use('/auth', auth)
app.use('/', index)
app.use('/stories', stories)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))