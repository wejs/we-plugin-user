/**
 * User
 *
 * @module      :: Model
 * @description :: System User model
 *
 */
var bcrypt = require('bcryptjs'),
  SALT_WORK_FACTOR = 10;

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
      required: true,
      regex: /^[a-z0-9_-]{4,30}$/
    },

    biography: {
      type: 'text'
    },

    email: {
      // Email type will get validated by the ORM
      type: 'email',
      required: true,
      unique: true
    },

    password: {
      type: 'text'
    },

    displayName: {
      type: 'string'
    },

    birthDate: 'date',

    image: {
      type: 'string'
    },

    avatarId: {
      type: 'string'
    },

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
      defaultsTo: 'en-us',
      maxLength: 6
    },

    // consumers: {
    //   collection: 'consumer',
    //   via: 'owners'
    // },

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

    verifyPassword: function (password) {
      // if user dont have a password
      if(!this.password){
        return false;
      }

      var isMatch = bcrypt.compareSync(password, this.password);
      return isMatch;
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

    // Lifecycle Callbacks
  beforeCreate: function(user, next) {
    // never save consumers on create
    delete user.consumers;
    // sanitize
    user = SanitizeHtmlService.sanitizeAllAttr(user);

    bcrypt.hash(user.password, SALT_WORK_FACTOR, function (err, hash) {
      user.password = hash;
      next(err);
    });
  },

  beforeUpdate: function(user, next) {
    // sanitize
    user = SanitizeHtmlService.sanitizeAllAttr(user);

    // if has user.newPassword generate the new password
    if (user.newPassword) {
      bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) { return next(err); }

        // hash the password along with our new salt
        bcrypt.hash(user.newPassword, salt, function (err, crypted) {
          if(err) { return next(err); }

          // delete newPassword variable
          delete user.newPassword;
          // set new password
          user.password = crypted;

          next();
        });
      });
    } else {
      next();
    }
  },

  // custom find or create for oauth
  customFindORCreate: function(criteria, data, done) {
    User.findOne(criteria).exec(function(err, user) {
      if (err) return done(err);
      if (user) return done(null, user);
      User.create(data).exec(done);
    });
  }
};