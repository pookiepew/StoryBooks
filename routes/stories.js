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
        .sort({ date: 'desc' })
        .then(stories => {
            res.render('stories/index', {
                stories: stories
            })
        })
})

// Show single story route
router.get('/show/:id', (req, res) => {
    Story
        .findOne({ _id: req.params.id })
        .populate('user')
        .populate('comments.commentUser')
        .then(story => {
            if (story.status == 'public') {
                res.render('stories/show', { story: story })
            } else {
                if (req.user) {
                    if (req.user.id == story.user._id) {
                        res.render('stories/show', { story: story })
                    } else {
                        res.redirect('/stories')
                    }
                } else {
                    res.redirect('/stories')
                }
            }
        })
})

// List stories from a user
router.get('/user/:userId', (req, res) => {
    Story
        .find({ user: req.params.userId, status: 'public' })
        .populate('user')
        .then(stories => {
            res.render('stories/index', { stories: stories })
        })
})

// Logged in users story
router.get('/my', ensureAuthenticated, (req, res) => {
    Story
        .find({ user: req.user.id })
        .populate('user')
        .then(stories => {
            res.render('stories/index', { stories: stories })
        })
})

// Add story GET route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add')
})

// Edit story GET route
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Story
        .findOne({ _id: req.params.id })
        .then(story => {
            if (story.user != req.user.id) {
                res.redirect('/stories')
            } else {
                res.render('stories/edit', { story: story })
            }
            
        })
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

// Edit form route
router.put('/:id', (req, res) => {
    Story
        .findOne({ _id: req.params.id })
        .then(story => {
            story.title = req.body.title,
            story.body = req.body.body,
            story.status = req.body.status,
            story.allowComments = !!req.body.allowComments,

            story
                .save()
                .then(story => {
                    res.redirect('/dashboard')
                })
        })
})

// Delete story route
router.delete('/:id', (req, res) => {
    Story
        .findOneAndDelete({ _id: req.params.id })
        .then(() => res.redirect('/dashboard'))
})

// Add comment form route
router.post('/comment/:id', (req, res) => {
    Story
        .findOne({ _id: req.params.id })
        .then(story => {
            const newComment = {
                commentBody: req.body.commentBody,
                commentUser: req.user.id
            }

            story.comments.unshift(newComment)

            story
                .save()
                .then(story => {
                    res.redirect(`/stories/show/${story.id}`)
                })
        })
})

module.exports = router