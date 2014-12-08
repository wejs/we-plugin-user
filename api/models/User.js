/**
 * User
 *
 * @module      :: Model
 * @description :: System User model
 *
 */
var bcrypt = require('bcrypt');

module.exports = {
  schema: true,
  attributes: {
    // wejs provider id
    idInProvider: {
      type: 'string',
      unique: true
    },

    username: {
      type: 'string',
      unique: true,
      required: true
    },

    biography: { type: 'text' },

    gender: { type: 'text' },

    email: {
      // Email type will get validated by the ORM
      type: 'email',
      required: true,
      unique: true
    },

    // a hashed password
    password: {
      type: 'text'
    },

    displayName: {
      type: 'string'
    },

    birthDate: 'date',

    avatar: {
      model: 'images'
    },

    active: {
      type: 'boolean',
      defaultsTo: false
    },

    isAdmin: {
      type: 'boolean',
      defaultsTo: false
    },

    isModerator: {
      type: 'boolean',
      defaultsTo: false
    },

    language: {
      type: 'string',
      defaultsTo: 'pt-br',
      maxLength: 6
    },

    // estado UF
    locationState: {
      type: 'string'
    },

    city: {
      type: 'string'
    },

    // instant | daily | semanal
    emailNotificationFrequency: {
      type: 'string',
      defaultsTo: 'instant'
    },

    toJSON: function() {
      var obj = this.toObject();
      if(!obj.displayName){
        obj.displayName = obj.username;
      }
      // delete and hide user email
      delete obj.email;
      // remove password hash from view
      delete obj.password;

      // ember data type
      obj.type = 'user';

      return obj;
    },

    verifyPassword: function (password, cb) {
      return User.verifyPassword(password, this.password, cb);
    },

    changePassword: function(user, oldPassword, newPassword, next){
      user.updateAttribute( 'password', newPassword , function (err) {
        if (!err) {
            next();
        } else {
            next(err);
        }
      });
    }
  },

  /**
   * async password generation
   *
   * @param  {string}   password
   * @param  {Function} next     callback
   */
  generatePassword: function(password, next) {
    var SALT_WORK_FACTOR = sails.config.user.SALT_WORK_FACTOR;

    return bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      return bcrypt.hash(password, salt, next);
    });
  },

  /**
   * Verify user password
   *
   * @param  {string}   password user password string to test
   * @param  {string}   hash     DB user hased password
   * @param  {Function} cb       Optional callback
   * @return {boolean}           return true or false if no callback is passed
   */
  verifyPassword: function (password, hash, cb) {
    // if user dont have a password
    if(!hash){
      if(!cb) return false;
      return cb(null, false);
    }

    // if dont has a callback do a sync check
    if (!cb) return bcrypt.compareSync(password, hash);
    // else compare async
    bcrypt.compare(password, hash, cb);
  },

    // Lifecycle Callbacks
  beforeCreate: function(user, next) {
    // never save consumers on create
    delete user.consumers;
    // sanitize
    user = SanitizeHtmlService.sanitizeAllAttr(user);

    // optional password
    if (user.password) {
      this.generatePassword(user.password, function(err, hash) {
        if (err) return next(err);

        user.password = hash;
        return next();
      });
    } else {
      // ensures that user password are undefined
      delete user.password;
      next();
    }
  },

  beforeUpdate: function(user, next) {
    // sanitize
    user = SanitizeHtmlService.sanitizeAllAttr(user);

    // if has user.newPassword generate the new password
    if (user.newPassword) {
      return this.generatePassword(user.newPassword, function(err, hash) {
        if (err) return next(err);
        // delete newPassword variable
        delete user.newPassword;
        // set new password
        user.password = hash;
        return next();
      });
    } else {
      return next();
    }
  },

  // custom find or create for oauth
  customFindORCreate: function(criteria, data, done) {
    User.findOne(criteria).exec(function(err, user) {
      if (err) return done(err);
      if (user) return done(null, user);
      User.create(data).exec(done);
    });
  },

  validUsername: function(username){
    var restrictedUsernames = [
      'logout',
      'login',
      'auth',
      'api',
      'admin',
      'account',
      'user'
    ];

    if (restrictedUsernames.indexOf(username) >= 0) {
      return false;
    }
    return true
  }
};