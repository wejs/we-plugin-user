/**
 * UsersController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

// sails controller utils
var actionUtil = require('we-helpers').actionUtil;
var util = require('util');
var _ = require('lodash');
var async = require('async');

module.exports = {

  findOneByUsername: function findOneByUsername (req, res, next) {
    var username = req.param('username');

    if(!username) return next();

    if(User.validUsername(username)){
      return next();
    }

    var query = User.findOne({username: username});
    //query = actionUtil.populateEach(query, req.options);
    query.exec(function found(err, user) {
      if (err) return res.serverError(err);
      if(!user) return res.notFound('No record found with the specified `username`.');

      if(req.wantsJSON){
        return res.send({user: user});
      }

      if(!user){
        return res.redirect('/login')
      }

      res.locals.messages = [];
      res.locals.user = user;
      res.locals.formAction = '/account';
      res.locals.service = req.param('service');
      res.locals.consumerId = req.param('consumerId');

      res.locals.interests = [{
        'id': 'APS',
        'text': 'Atenção Primária à Saúde'
      },
      {
        'id': 'enfermagem',
        'text': 'Enfermagem'
      },
      {
        'id': 'amamentação',
        'text': 'Amamentação'
      },
      {
        'id': 'PNH',
        'text': 'Humanização'
      }];

      return res.view('user/user');

    });
  },

  findOne: function findOneRecord (req, res) {
    if (!req.context.record) return res.notFound('No record found with the specified `id`.');

    var sails = req._sails;
    var pk = req.context.pk;

    var query = req.context.Model.findOne(pk);
    query = actionUtil.populateEach(query, req.options);
    return query.exec(function found(err, user) {
      if (err) {
        sails.log.error('UserController: Error on find user', err);
        return res.serverError(err);
      }

      return res.ok(user);
    });
  },

  find: function findRecords (req, res) {

    // Look up the model
    var Model = req.context.Model;

    // Lookup for records that match the specified criteria
    var query = Model.find()
    .where( actionUtil.parseCriteria(req) )
    .limit( actionUtil.parseLimit(req) )
    .skip( actionUtil.parseSkip(req) )
    .sort( actionUtil.parseSort(req) );
    // TODO: .populateEach(req.options);
    //query = actionUtil.populateEach(query, req.options);
    query.exec(function found(err, matchingRecords) {
      if (err) return res.serverError(err);

      // Only `.watch()` for new instances of the model if
      // `autoWatch` is enabled.
      if (req._sails.hooks.pubsub && req.isSocket) {
        Model.subscribe(req, matchingRecords);
        if (req.options.autoWatch) {
          Model.watch(req);
        }
        // Also subscribe to instances of all associated models
        _.each(matchingRecords, function (record) {
          actionUtil.subscribeDeep(req, record);
        });
      }

      return res.ok(matchingRecords);
    });
  },

  update: function(req, res) {
    var sails = req._sails;
    // Look up the model
    var Model = req.context.Model;
    // Locate and validate the required `id` parameter.
    var pk = req.context.pk;

    // Create `values` object (monolithic combination of all parameters)
    // But omit the blacklisted params (like JSONP callback param, etc.)
    var values = actionUtil.parseValues(req);

    // Omit the path parameter `id` from values, unless it was explicitly defined
    // elsewhere (body/query):
    var idParamExplicitlyIncluded = ((req.body && req.body.id) || req.query.id);
    if (!idParamExplicitlyIncluded) delete values.id;

    // remove createdAt and updatedAt to let sails.js set it automaticaly
    delete values.createdAt;
    delete values.updatedAt;

    res.locals.user = values;
    res.locals.formAction = '/account';
    res.locals.service = req.param('service');
    res.locals.consumerId = req.param('consumerId');

    res.locals.interests = [{
      'id': 'APS',
      'text': 'Atenção Primária à Saúde'
    },
    {
      'id': 'enfermagem',
      'text': 'Enfermagem'
    },
    {
      'id': 'amamentação',
      'text': 'Amamentação'
    },
    {
      'id': 'PNH',
      'text': 'Humanização'
    }];

    return User.findOneByUsername(values.username).exec(function(err, usr){
      if (err) {
        sails.log.error('Error on find user by username.',err);
        res.locals.messages = [{
          status: 'danger',
          message: res.i18n('auth.register.error.unknow', { username: values.username })
        }];
        return res.serverError({}, 'auth/register');
      }
      // user already registered
      if ( usr && (usr.id !== pk) ) {
        res.locals.messages = [{
          status: 'danger',
          message: res.i18n('auth.register.error.username.registered', { username: values.username })
        }];
        return res.badRequest({}, 'auth/register');
      }

      // Find and update the targeted record.
      //
      // (Note: this could be achieved in a single query, but a separate `findOne`
      //  is used first to provide a better experience for front-end developers
      //  integrating with the blueprint API.)
      return Model.findOne(pk).populateAll().exec(function found(err, matchingRecord) {

        if (err) return res.serverError(err);
        if (!matchingRecord) return res.notFound();

        // dont change user password in user edit
        values.password = matchingRecord.password;

        return Model.update(pk, values).exec(function updated(err, records) {

          // Differentiate between waterline-originated validation errors
          // and serious underlying issues. Respond with badRequest if a
          // validation error is encountered, w/ validation info.
          if (err) return res.negotiate(err);


          // Because this should only update a single record and update
          // returns an array, just use the first item.  If more than one
          // record was returned, something is amiss.
          if (!records || !records.length || records.length > 1) {
            req._sails.log.warn(
            util.format('Unexpected output from `%s.update`.', Model.globalId)
            );
          }

          var updatedRecord = records[0];

          if(req.wantsJSON){
            return res.ok(updatedRecord);
          }

          res.locals.messages = [{
            status: 'success',
            message: res.i18n('user.account.update.success',{
              displayName: updatedRecord.displayName
            })
          }];
          res.locals.user = updatedRecord;

          return res.view('user/account');

        });// </updated>
      }); // </found>
    });
  },

  forgotPasswordForm: function (req, res) {
    res.view();
  }
};
