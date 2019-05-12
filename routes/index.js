const express = require('express')
const router = express.Router()
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth')

// Index route
router.get('/', ensureGuest, (req, res) => {
    res.render('index/welcome')
})

// Dashboard route
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('index/dashboard')
})

// About route
router.get('/about', (req, res) => {
    res.render('index/about')
})

module.exports = router