/**
 * User main file
 */
module.exports = function loadUserPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);

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
  });

  plugin.setRoutes({
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

  plugin.setResource({
    'namePrefix': 'admin.',
    'name': 'user',
    'namespace': '/admin',
    'templateFolderPrefix': 'admin/',
    'findAll': {
      'search': {
        'id':  {
          'parser': 'equal',
          'target': {
            'type': 'field',
            'field': 'id'
          }
        },
        'email':  {
          'parser': 'equal',
          'target': {
            'type': 'field',
            'model': 'user',
            'field': 'email'
          }
        },
        'fullName':  {
          'parser': 'contains',
          'target': {
            'type': 'field',
            'model': 'user',
            'field': 'fullName'
          }
        }
      }
    }
  });

  plugin.events.on('we:express:set:params', function(data) {
    // user pre-loader
    data.express.param('userId', function (req, res, next, id) {
      if (!/^\d+$/.exec(String(id))) return res.notFound();
      data.we.db.models.user.findById(id)
      .then(function (user) {
        if (!user) return res.notFound();
        res.locals.user = user;
        // set user context if userId is the first param
        if (Object.keys(req.params)[0] == 'userId'){
          res.locals.widgetContext = 'user-' + id;
        }

        next();
      });
    });
  });

  return plugin;
};