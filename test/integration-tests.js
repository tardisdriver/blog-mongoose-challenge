const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');


const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);


function seedBlogData() {
  console.info('seeding blog data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateBlogData());
  }

  return BlogPost.insertMany(seedData);
}


function generateTitle() {
  const titles = [
    'Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'];
  return titles[Math.floor(Math.random() * titles.length)];
}


function generateBlogData() {
  return {
    title: generateTitle(),
    content: faker.lorem.sentence(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    }
  }
}



function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Blog Posts API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
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
          pos = _pos;
          pos.should.have.status(200);
          pos.body.blogposts.should.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          pos.body.blogposts.should.have.length.of(count);
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
              'id', 'title', 'content', 'author', 'created');
          });
          posPost = pos.body.blogposts[0];
          return BlogPost.findById(posPost.id);
        })
        .then(function(blogposts) {
          posPost.id.should.equal(blogposts.id);
          posPost.title.should.equal(blogposts.title);
          posPost.content.should.equal(blogposts.content);
          posPost.author.should.equal(blogposts.author.firstName + ' ' +blogposts.author.lastName);

        });
    }); 
  }); 

  describe('POST endpoint', function () {
  	it('should add a new post', function() {
  		const newPost = generateBlogData();
  		let mostRecentPost;

  		return chai.request(app)
  			.post('/blogposts')
  			.send(newPost)
  			.then(function(res) {
  				res.should.have.status(201);
  				res.should.be.json;
  				res.body.should.be.a('object');
  				res.body.should.include.keys(
  					'id','title', 'content', 'author', 'created');
  				res.body.id.should.not.be.null;
  				res.body.title.should.equal(newPost.title)
  				res.body.content.should.equal(newPost.content);
  				res.body.author.should.equal(newPost.author.firstName + ' ' +newPost.author.lastName);
  			});
  		});
 	 });

  describe('PUT endpoint', function () {
  	it('should update fields you send over', function() {
  		const updateData = {
  			title: 'huhuhuhuhuhuh',
  			content: 'heheheheheheheheheheheheheheheheh'
  		};

  		return BlogPost
  			.findOne()
  			.exec()
  			.then(function(blogpost) {
  				updateData.id = blogpost.id;
  				return chai.request(app)
  					.put(`/blogposts/${blogpost.id}`)
  					.send(updateData);
  			})
  			.then(function(res) {
  				res.should.have.status(201);
  				return BlogPost.findById(updateData.id).exec();
  			})
  			.then(function(blogpost){
  				blogpost.title.should.equal(updateData.title);
  				blogpost.content.should.equal(updateData.content);
  			});
  		});
  	});

  describe('DELETE endpoint', function() {
  	it('should delete a blog post by ID', function() {
  		let blogpost;

  		return BlogPost
  			.findOne()
  			.exec()
  			.then(function(_blogpost) {
  				blogpost = _blogpost;
  				return chai.request(app).delete(`/blogposts/${blogpost.id}`);
  			})
  			.then(function(res) {
  				res.should.have.status(204);
  				return BlogPost.findById(blogpost.id).exec();
  			})
  			.then(function(_blogpost) {
  				should.not.exist(_blogpost);
  			});
  	});
  });
 });