const express = require('express');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPosts} = require('./models');
const app = express();

BlogPosts.create('Testing Post', "Lorem ipsum", "Tracy", "6-22-2017");
BlogPosts.create('Testing Post 2', "Lorem ipsum is the greatest", "Bob", "6-23-2017");

app.get('/blog-posts', (req, res) => {
	res.json(BlogPosts.get());
});

module.exports = app;