/**
 * User
 *
 * @module      :: Model
 * @description :: System User model
 *
 */

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
      // ember data type
      obj.type = 'user';

      return obj;
    }
  },

    // Lifecycle Callbacks
  beforeCreate: function(user, next) {
    // never save consumers on create
    delete user.consumers;
    // sanitize
    user = SanitizeHtmlService.sanitizeAllAttr(user);

    next();
  },

  beforeUpdate: function(user, next) {
    // sanitize
    user = SanitizeHtmlService.sanitizeAllAttr(user);
    next();
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