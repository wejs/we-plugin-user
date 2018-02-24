/**
 * User model
 *
 * @module      :: Model
 */

const userNameRegex = /^[A-Za-z0-9_-]{2,30}$/;

module.exports = function UserModel(we) {
  const model = {
    definition: {
      username: {
        type: we.db.Sequelize.STRING,
        unique: true,
        validate: {
          userNameIsValid(val) {
            if (!userNameRegex.test(val)) {
              throw new Error('user.username.invalid');
            }
          },
          uniqueUsername(val, cb) {
            if(!val) return cb();
            return we.db.models.user.findOne({
              where: { username: val }, attributes: ['id']
            })
            .then( (u)=> {
              if (u) {
                cb('auth.register.error.username.registered');
              } else {
                cb();
              }

              return null;
            })
            .catch(cb);
          }
        }
      },

      displayName: { type: we.db.Sequelize.STRING },
      fullName: { type: we.db.Sequelize.TEXT, formFieldType: 'text' },

      biography: {
        type: we.db.Sequelize.TEXT,
        formFieldType: 'html',
        formFieldHeight: 200
      },

      gender: {
        type: we.db.Sequelize.STRING,
        formFieldType: 'select' ,
        fieldOptions: { M: 'Male', F: 'Female' }
      },

      email: {
        // Email type will get validated by the ORM
        type: we.db.Sequelize.STRING,
        allowNull: false,
        unique: true,
        formFieldType: 'user-email',
        validate: {
          isEmail: true,
          notEmptyOnCreate(val) {
            if (this.isNewRecord) {
              if (!val) {
                throw new Error('auth.register.email.required');
              }
            }
          },
          equalEmailFields(val) {
            if (this.isNewRecord) {
              if (this.getDataValue('email') != val) {
                throw new Error('auth.email.and.confirmEmail.diferent');
              }
            }
          },
          uniqueEmail(val, cb) {
            return we.db.models.user
            .findOne({
              where: { email: val }, attributes: ['id']
            })
            .then( (u)=> {
              if (u) return cb('auth.register.email.exists');
              cb();
              return null;
            })
            .catch(cb);
          }
        }
      },

      active: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false,
        formFieldType: null
      },

      language: {
        type: we.db.Sequelize.STRING,
        defaultValue: 'pt-br',
        validations: {
          max: 6
        },
        formFieldType: null // TODO
      },
      confirmEmail: {
        type: we.db.Sequelize.VIRTUAL,
        formFieldType: null,
        set(val) {
          this.setDataValue('confirmEmail', val);
        },
        validate: {
          isEmail: true,
          notEmptyOnCreate(val) {
            if (this.isNewRecord) {
              if (!val) {
                throw new Error('auth.register.confirmEmail.required');
              }
            }
          },
          equalEmailFields(val) {
            if (this.isNewRecord) {
              if (this.getDataValue('email') != val) {
                throw new Error('auth.email.and.confirmEmail.diferent');
              }
            }
          }
        }
      },
      acceptTerms: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: true,
        equals: true,
        allowNull: false,
        formFieldType: null
      }
    },
    associations: {},
    options: {
      titleField: 'displayName',
      termFields: {
        organization: {
          vocabularyName: 'Organization',
          canCreate: true,
          formFieldMultiple: false,
          onlyLowercase: false
        },
      },
      imageFields: {
        avatar: { formFieldMultiple: false },
        banner: { formFieldMultiple: false }
      },

      // table comment
      comment: 'We.js users table',

      classMethods: {
        validUsername(username){
          const restrictedUsernames = [
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
          return true;
        },
        /**
         * Context loader, preload current request record and related data
         *
         * @param  {Object}   req  express.js request
         * @param  {Object}   res  express.js response
         * @param  {Function} done callback
         */
        contextLoader(req, res, done) {
          if (!res.locals.id || !res.locals.loadCurrentRecord) return done();

          if (res.locals.user) {
            res.locals.data = res.locals.user;

            if (
              res.locals.data.id &&
              req.isAuthenticated &&
              req.isAuthenticated()
            ) {
              // ser role owner
              if (req.user.id == res.locals.data.id) {
                if(req.userRoleNames.indexOf('owner') == -1 ) req.userRoleNames.push('owner');
              }
            }

            done();
          } else {
            this.findById(res.locals.id)
            .then(function findUser(record) {
              res.locals.data = record;

              if (record && record.id && req.isAuthenticated && req.isAuthenticated()) {
                // ser role owner
                if (req.user.id == record.id) {
                  if(req.userRoleNames.indexOf('owner') == -1 ) req.userRoleNames.push('owner');
                }
              }
              done();

              return null;
            })
            .catch(done);
          }
        },

        // returns an url alias
        urlAlias(record) {
          return {
            alias: '/'+ we.i18n.__('user') +'/' + record.id + '-'+  we.utils
              .string( record.username || record.displayName ).slugify().s,
            target: '/user/' + record.id,
          };
        },

        loadPrivacity(record, done) {
          we.db.models.userPrivacity
          .findAll({
            where: { userId: record.id },
            raw: true
          })
          .then( (p)=> {
            record.privacity = p;
            done();
            return null;
          })
          .catch(done);
        }
      },
      instanceMethods: {
        toJSON() {
          const obj = this.get();

          // delete and hide user email
          delete obj.email;
          // remove password hash from view
          delete obj.password;

          if (!obj.displayName) obj.displayName = obj.username;

          return obj;
        }
      },
      hooks: {
        beforeValidate(user) {
          if (user.isNewRecord) {
            // dont set password on create
            user.dataValues.password = null;
            user.dataValues.passwordId = null;
          }
        },
        // Lifecycle Callbacks
        beforeCreate(user) {
          // set default displayName as username
          if (!user.displayName) {
            if (user.fullName && user.fullName.trim()) {
              user.displayName = user.fullName.split(' ')[0];
            } else if (user.username) {
              user.displayName = user.username;
            }
          }

          // never save consumers on create
          delete user.consumers;
          // dont allow to set admin and moderator flags
          delete user.isAdmin;
          delete user.isModerator;
        },
        beforeUpdate(user) {
          // set default displayName as username
          if (!user.displayName) {
            if (user.fullName && user.fullName.trim()) {
              user.displayName = user.fullName.split(' ')[0];
            } else if (user.username) {
              user.displayName = user.username;
            }
          }

          // dont change user acceptTerms in update
          user.acceptTerms = true;
        },
        afterFind(record) {
          return new Promise( (resolve, reject)=> {
            if (!record) return resolve();

            // load privacity to hide user fields in toJSON
            if (we.utils._.isArray(record)) {
              we.utils.async.eachSeries(record, (r, next)=> {
                we.db.models.user.loadPrivacity(r, next);
              }, (err)=> {
                if (err) return reject(err);
                resolve();
              });
            } else {
              we.db.models.user.loadPrivacity(record, (err)=> {
                if (err) return reject(err);
                resolve();
              });
            }
          });

        }
      }
    }
  };

  return model;
};