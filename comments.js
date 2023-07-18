// Create web server
// http://localhost:3000/comments
// GET /comments
// POST /comments
// GET /comments/:id
// PUT /comments/:id
// DELETE /comments/:id
// GET /comments/:id/replies
// POST /comments/:id/replies

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const db = require('../db/connection');

// Joi schema for validating the comment object
const schema = Joi.object().keys({
    body: Joi.string().required(),
    username: Joi.string().alphanum().required(),
    article_id: Joi.number().integer().required()
});

// Joi schema for validating the reply object
const replySchema = Joi.object().keys({
    body: Joi.string().required(),
    username: Joi.string().alphanum().required(),
    comment_id: Joi.number().integer().required()
});

// GET /comments
router.get('/', (req, res, next) => {
    db('comments')
        .orderBy('created', 'desc')
        .then((comments) => {
            res.json(comments);
        })
        .catch((err) => {
            next(err);
        });
});

// POST /comments
router.post('/', (req, res, next) => {
    const result = Joi.validate(req.body, schema);
    if (result.error === null) {
        const { body, username, article_id } = req.body;
        const comment = {
            body,
            username,
            article_id
        };
        db('comments')
            .insert(comment)
            .then((insertedIds) => {
                comment.id = insertedIds[0];
                res.json(comment);
            })
            .catch((err) => {
                next(err);
            });
    } else {
        res.status(422);
        next(result.error);
    }
});

// GET /comments/:id
router.get('/:id', (req, res, next) => {
    const { id } = req.params;
    db('comments')
        .where('id', id)
        .first()
        .then((comment) => {
            if (comment) {
                res.json(comment);
            } else {
                res.status(404).json({ message: `Comment with id ${id} not found.` });
            }
        })
        .catch((err) => {
            next(err);
        });
});

// PUT /comments/: