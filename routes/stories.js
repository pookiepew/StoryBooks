const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Story = mongoose.model('stories')
const User = mongoose.model('users')
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth')

// Story index route (all stories, public and own)
router.get('/', (req, res) => {
    Story
        .find({ status: 'public' })
        .populate('user')
        .then(stories => {
            res.render('stories/index', {
                stories: stories
            })
        })
})

// Add story GET route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add')
})

// Add story POST route
router.post('/', (req, res) => {
    const newStory = {
        title: req.body.title,
        body: req.body.body,
        status: req.body.status,
        allowComments: !!req.body.allowComments,
        user: req.user.id
    }
    
    new Story(newStory)
        .save()
        .then(story => {
            res.redirect(`/stories/show/${story.id}`)
        })
})

module.exports = router