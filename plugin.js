/**
 * User plugin main file
 */

module.exports = function loadUserPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  plugin.setConfigs({
    /**
     * Field privacity settings
     * @type {Object}
     */
    privacity: {
      userFields: {
        public: ['displayName', 'avatar', 'banner'],
        changeable: [
          'fullName', 'biography', 'gender', 'language', 'organization'
        ]
      }
    },
    user: {
      disableContext: false,
      goToOptions: {
        view(req, res, next) {
          if (!req.isAuthenticated()) return next();
          res.goTo('/user/'+req.user.id);
        },
        edit(req, res, next) {
          if (!req.isAuthenticated()) return next();
          res.goTo('/user/'+req.user.id+'/edit');
        },
        privacity(req, res, next) {
          if (!req.isAuthenticated()) return next();
          res.goTo('/user/'+req.user.id+'/edit/privacity');
        }
      }
    }
  });

  plugin.setRoutes({
    'get /user-goto': {
      'controller'    : 'user',
      'action'        : 'goTo'
    },

    'get /user/:userId([0-9]+)/edit/privacity': {
      'name'          : 'user.privacity',
      'controller'    : 'user',
      'model'         : 'userPrivacity',
      'action'        : 'findUserPrivacity',
      'titleHandler'  : 'i18n',
      'titleI18n'     : 'Privacity',
      'layoutName'    : 'user-layout',
      'template'      : 'user/findUserPrivacity'
    },
    'post /user/:userId([0-9]+)/edit/privacity': {
      'name'          : 'user.privacity',
      'controller'    : 'user',
      'model'         : 'userPrivacity',
      'action'        : 'findUserPrivacity',
      'titleHandler'  : 'i18n',
      'titleI18n'     : 'Privacity',
      'layoutName'    : 'user-layout',
      'template'      : 'user/findUserPrivacity'
    },
  });

  plugin.setResource({
    'name': 'user',
    'findOne': {
      'metatagHandler': 'userFindOne'
    },
    'findAll': {
      'search': {
        'q': {
          'parser': 'userSearchQuery',
          'target': {
            'type': 'field',
            'field': 'displayName'
          }
        },
        'username': {
          'parser': 'equal',
          'target': {
            'type': 'field',
            'field': 'username'
          }
        }
      }
    }
  });

  plugin.events.on('we:express:set:params', function(data) {
    const we = plugin.we;
    // user pre-loader
    data.express.param('userId', function (req, res, next, id) {
      if (!/^\d+$/.exec(String(id))) return res.notFound();
      data.we.db.models.user
      .findById(id)
      .then( (user)=> {
        if (user) {
          res.locals.user = user;
          // set user context if userId is the first param
          if (we.config.user.disableContext && Object.keys(req.params)[0] == 'userId'){
            res.locals.widgetContext = 'user-' + id;
          }
        }

        next();

        return null;
      })
      .catch(next);
    });
  });

  return plugin;
};