/**
 * user controller
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  findOneByUsername(req, res, next) {
    if(!req.params.username) return next();

    res.locals.Model
    .findOne({
      where: {
        username: req.params.username
      }
    })
    .then( (user)=> {
      if(!user) {
        next();
        return null;
      }
      return res.ok(user);
    })
    .catch(res.queryError);
  },

  goTo(req, res, next) {
    if (req.query.action && req.we.config.user.goToOptions) {
      if (req.we.config.user.goToOptions[req.query.action]) {
        req.we.config.user.goToOptions[req.query.action](req,res,next);
        return null;
      }
    }

    if (req.isAuthenticated()) {
      res.goTo('/user/'+req.user.id);
    } else {
      res.goTo('/user');
    }
  },

  find(req, res) {
    // block email filter
    if (
      req.query.email ||
      (res.locals.query.where && res.locals.query.where.email)
    ) {
      return res.badRequest('user.invalid.filter');
    }

    res.locals.Model
    .findAndCountAll(res.locals.query)
    .then(function afterFindAndCount (record) {
      res.locals.metadata.count = record.count;
      res.locals.data = record.rows;
      res.ok();
      return null;
    })
    .catch(res.queryError);
  },

  create(req, res) {
    const we = req.we;

    if (!res.locals.template) res.locals.template = res.locals.model + '/' + 'create';

    if (!res.locals.data) res.locals.data = {};

    if (req.method === 'POST') {
      delete req.body.blocked;

      // auto accept terms in register user
      req.body.acceptTerms = true;

      // set temp record for use in validation errors
      res.locals.data = req.query;
      we.utils._.merge(res.locals.data, req.body);

      return res.locals.Model
      .create(req.body)
      .then( (record)=> {
        res.locals.data = record;
        res.created();
        return record;
      })
      .catch(res.queryError);
    } else {
      res.locals.data = req.query;
      res.ok();
    }
  },

  edit(req, res, next) {
    const we = req.we;

    delete req.body.blocked;

    if (!res.locals.template)
      res.locals.template = res.locals.model + '/' + 'edit';

    if ( !we.acl || !we.acl.canStatic('manage_users', req.userRoleNames)) {
      delete req.body.email;
      delete req.body.active;
      delete req.body.roles;
    }

    let record = res.locals.data;

    if (we.config.updateMethods.indexOf(req.method) >-1) {
      if (!record) return next();

      record
      .updateAttributes(req.body)
      .then( ()=> {
        res.locals.data = record;
        return res.updated();
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  },

  findUserPrivacity(req, res, next) {
    if (!res.locals.user) return res.notFound();

    if (
      !req.isAuthenticated ||
      !req.isAuthenticated() ||
      !(
        res.locals.user.id == req.user.id ||
        req.we.acl.canStatic('update_user', req.userRoleNames)
      )
    ) {
      return res.forbidden();
    }

    res.locals.userAttributes = req.we.config.privacity.userFields.changeable;
    res.locals.publicFields = req.we.config.privacity.userFields.public;

    // breadcrumb
    res.locals.breadcrumb =
      '<ol class="breadcrumb">'+
        '<li><a href="/">'+res.locals.__('Home')+'</a></li>'+
        '<li><a href="'+
          req.we.router.urlTo('user.find', req.paramsArray)+
        '">'+res.locals.__('user.find')+'</a></li>'+
        '<li><a href="'+res.locals.user.getUrlPathAlias()+'">'+
          res.locals.user.displayName+
        '</a></li>'+
        '<li><a href="/user/'+res.locals.user.id+'/edit">'+res.locals.__('edit')+'</a></li>'+
        '<li class="active">'+res.locals.__('Privacity')+'</li>'+
      '</ol>';

    req.we.db.models.userPrivacity
    .findAll({
      where: {
        userId: res.locals.user.id
      }
    })
    .then( (r)=> {
      res.locals.data = {};

      if (r) {
        for (let i = 0; i < res.locals.userAttributes.length; i++) {
          res.locals.data[res.locals.userAttributes[i]] = {};

          for (let j = 0; j < r.length; j++) {
            if (r[j].field == res.locals.userAttributes[i]) {
              res.locals.data[res.locals.userAttributes[i]].record = r[j];
            }
          }
        }
      }

      if (req.method == 'POST') {
        return req.we.controllers.user.updateUserPrivacity(req, res, next);
      } else {
        res.ok();
      }
      return null;
    })
    .catch(res.queryError);
  },

  updateUserPrivacity(req, res) {
    if (!res.locals.redirectTo) res.locals.redirectTo = req.url;

    delete req.body.blocked;

    // for each field ...
    req.we.utils.async.eachSeries(res.locals.userAttributes,
    function (fieldName, next) {
      // if user dont changed field with fieldName
      if (!req.body[fieldName]) return next();

      if (!res.locals.data[fieldName]) res.locals.data[fieldName] = {};

      // update if already are loaded
      if (res.locals.data[fieldName].record) {
        res.locals.data[fieldName].record.set('privacity', req.body[fieldName]);
        res.locals.data[fieldName].record.save()
        .then(function (r) {
          res.locals.data[fieldName].record = r;

          next();
        }).catch(next);
      } else {
        // create if dont are loaded
        req.we.db.models.userPrivacity.findOrCreate({
          where: {
            userId: res.locals.user.id,
            field: fieldName
          },
          defaults: {
            userId: res.locals.user.id,
            field: fieldName,
            privacity: req.body[fieldName]
          }
        }).spread(function (r) {
          res.locals.data[fieldName].record = r;
          next();
        }).catch(next);
      }
    },  (err)=> {
      if (err) return res.queryError(err);
      res.updated();
    });
  },

  blockUser(req, res) {
    const Model = req.we.db.models.user;

    Model.findById(req.params.id)
    .then( (user)=> {
      if (!user) {
        return res.notFound();
      }

      if (req.body.blocked === undefined) {
        req.body.blocked = true;
      }

      if (user.blocked === req.body.blocked) {
        return user;
      } else {
        user.blocked = req.body.blocked;
        return user.save();
      }
    })
    .then( ()=> {
      return res.ok({ blocked: req.body.blocked });
    })
    .catch(res.queryError);
  }
};
