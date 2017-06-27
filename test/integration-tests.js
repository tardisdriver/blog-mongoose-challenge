const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {BlogPosts} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedRandomData() {
	console.info('seeding blog posts');
	const seedData = [];

	for (let i=1; i<=10; i++) {
		seedData.push(generateBlog());
	}
	return BlogPosts.insertMany(seedData);
}

function generateTitle() {
	const titles = [
	'Hello World', 'Bonjour le Monde', 'Hallo Welt', 'Ciao mondo', 'Hola Mundo'];
	return titles[Math.floor(Math.random() * titles.length)];
}


function generateBlogPost() {
	return {
		title: generateTitle(),
		author.firstName: faker.name.firstName(),
		author.lastName: faker.name.lastname(), 
		},
		content: faker.text()
	}
}

function tearDownDB() {
	console.warn('Deleting database');
	return mongoose.connestion.dropDatabase();
}

describe('Blog Post API resource', function() {
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});
	beforeEach(function() {
		return tearDownDB();
	});
	after(function() {
		return closeServer();
	})

	describe('GET endpoint', function() {
		it('should return all existing posts', function() {
			let pos;
			return chai.request(app)
				.get('/blogposts')
				.then(function(_pos) {
					pos=_pos;
					pos.should.have.status(200);
					pos.body.blogposts.should.have.length.of.at.least(1);
					return BlogPosts.count();
				})
				.then(function(count) {
					res.body.blogposts.should.have.length.of(count);
				});
		});

		it('should return posts with right fields', function() {
			let posPost;
			return chai.request(app)
				.get('/blogposts')
				.then(function(pos) {
					pos.should.have.status(200);
					pos.should.be.json;
					pos.body.blogposts.should.be.a('array');
					pos.body.blogposts.should.have.length.of.at.least(1);

					pos.body.blogposts.forEach(function(blogposts) {
						blogposts.should.be.a('object');
						blogposts.should.include.keys(
							'title', 'content', 'author');
					});
					posPost = pos.body.blogposts[0];
					return BlogPosts.findByID(posPost.id);
				})
				.then(function(blogposts) {
					posPosts.id.should.equal(blogposts.id);
					posPosts.title.should.equal(blogposts.title);
					posPosts.content.should.equal(blogposts.content);
					posPosts.author.should.equal(blogposts.author);
				});
		});
	});


});