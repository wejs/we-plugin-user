const assert = require('assert'),
  request = require('supertest'),
  helpers = require('we-test-tools').helpers,
  stubs = require('we-test-tools').stubs;

let _, we, http;
let authenticatedRequest, salvedUserPassword, salvedUser;

describe('userFeature', function () {
  before(function (done) {
    http = helpers.getHttp();
    we = helpers.getWe();
    _ = we.utils._;

    let userStub = stubs.userStub();
    helpers.createUser(userStub, (err, user)=> {
      if (err) throw err;

      salvedUser = user;
      salvedUserPassword = userStub.password;

      // login user and save the browser
      authenticatedRequest = request.agent(http);
      authenticatedRequest.post('/login')
      .set('Accept', 'application/json')
      .send({
        email: salvedUser.email,
        password: salvedUserPassword
      })
      .expect(200)
      .set('Accept', 'application/json')
      .end( (err)=> {
        if (err) {
          we.log.error('error on login>', err);
          return done(err);
        }

        done();
      });
    });
  });

  describe('find', function () {
    it('get /user route should return users list', function (done) {
      request(http)
      .get('/user')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        assert.equal(200, res.status);
        assert(res.body.user);
        assert( _.isArray(res.body.user) , 'user not is array');
        assert(res.body.meta);
        done();
      });
    });
  });

  describe('create', function () {
    it('post /user should create one user record', function (done) {
      this.slow(300);
      var userStub = stubs.userStub();

      request(http)
      .post('/user')
      .set('Accept', 'application/json')
      .send(userStub)
      .end(function (err, res) {
        if (err) console.error(err);
        assert.equal(201, res.status);
        assert(res.body.user);

        var user = res.body.user;
        // check user attrs
        assert.equal(user.username, userStub.username);
        assert.equal(user.displayName, userStub.displayName);
        //assert.equal(user.fullName, userStub.fullName);
        assert.equal(user.biography, userStub.biography);
        assert.equal(user.language, userStub.language);
        assert.equal(user.gender, userStub.gender);

        done();
      });
    });

  });

  describe('goTo', function () {
    it('get /user-goto route should redirect user to /user/:authenticatedUserId route', function (done) {
      authenticatedRequest.get('/user-goto')
      // .set('Accept', 'application/json')
      .end(function (err, res) {
        if (err) {
          console.log('res.body>', res.body);
          return done(err);
        }

        assert.equal(302, res.status, 'Should return redirect status 302');
        assert.equal(
          res.headers.location,
          '/user/'+salvedUser.id,
          'Should redirect to /user/'+salvedUser.id
        );
        done();
      });
    });

    it('get /user-goto?action=view route should redirect user to /user/:authenticatedUserId route', function (done) {
      authenticatedRequest.get('/user-goto?action=view')
      .end(function (err, res) {
        if (err) {
          console.log('res.body>', res.body);
          return done(err);
        }

        assert.equal(302, res.status, 'Should return redirect status 302');
        assert.equal(
          res.headers.location,
          '/user/'+salvedUser.id,
          'Should redirect to /user/'+salvedUser.id
        );
        done();
      });
    });

    it('get /user-goto?action=edit route should redirect user to /user/:id/edit route', function (done) {
      authenticatedRequest.get('/user-goto?action=edit')
      .end(function (err, res) {
        if (err) {
          console.log('res.body>', res.body);
          return done(err);
        }

        assert.equal(302, res.status, 'Should return redirect status 302');
        assert.equal(
          res.headers.location,
          '/user/'+salvedUser.id+'/edit',
          'Should redirect to /user/'+salvedUser.id+'/edit'
        );
        done();
      });
    });

    it('get /user-goto?action=privacity route should redirect user to /user/:id/privacity route', function (done) {
      authenticatedRequest.get('/user-goto?action=privacity')
      .end(function (err, res) {
        if (err) {
          console.log('res.body>', res.body);
          return done(err);
        }

        assert.equal(302, res.status, 'Should return redirect status 302');
        assert.equal(
          res.headers.location,
          '/user/'+salvedUser.id+'/edit/privacity',
          'Should redirect to /user/'+salvedUser.id+'/edit/privacity'
        );
        done();
      });
    });

    it('get /user-goto route should redirect unAuthenticated user to /user route', function (done) {
      request(http)
      .get('/user-goto')
      .end(function (err, res) {
        if (err) {
          console.log('res.body>', res.body);
          return done(err);
        }

        assert.equal(302, res.status, 'Should return redirect status 302');
        assert.equal(
          res.headers.location,
          '/user',
          'Should redirect to /user'
        );
        done();
      });
    });

    it('get /user-goto?action=anything route with invalid action should redirect to /user route', function (done) {
      request(http)
      .get('/user-goto?action=anything')
      .end(function (err, res) {
        if (err) {
          console.log('res.body>', res.body);
          return done(err);
        }

        assert.equal(302, res.status, 'Should return redirect status 302');
        assert.equal(
          res.headers.location,
          '/user',
          'Should redirect to /user'
        );
        done();
      });
    });
  });


});