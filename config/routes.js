module.exports.routes = {
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
  },

  'get /user/:id?/contacts-name': {
    controller    : 'user',
    action        : 'getContactsName',
    cors: {
      origin: '*'
    }
  }
}