module.exports.routes = {
  'get /user/:username': {
    controller    : 'UserController',
    action        : 'findOneByUsername',
    model         : 'user'
  },

  'get /avatar/change': {
    controller    : 'AvatarController',
    action        : 'changeAvatarPage',
    cors: {
      origin: '*'
    }
  },

  'post /avatar/change': {
    controller    : 'AvatarController',
    action        : 'uploadAvatar',
    cors: {
      origin: '*'
    }
  },

  'get /avatar/crop': {
    controller    : 'AvatarController',
    action        : 'cropAvatarPage',
    cors: {
      origin: '*'
    }
  },

  'post /avatar/crop': {
    controller    : 'AvatarController',
    action        : 'cropAvatar'
  },

  // get logged in user avatar
  'get /avatar/:id': {
    controller    : 'AvatarController',
    action        : 'getAvatar',
    cors: {
      origin: '*'
    }
  },

  // page with  user avatars
  'get /avatar': {
    controller    : 'AvatarController',
    action        : 'userAvatarsPage'
  },

  'post /api/v1/user/:id/avatar': {
    controller    : 'AvatarController',
    action        : 'changeAvatar',
    cors: {
      origin: '*'
    }
  }
}