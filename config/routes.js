module.exports.routes = {

  'get /user/:username': {
    controller    : 'UserController',
    action        : 'findOneByUsername',
    model         : 'user'
  },

  'get /avatar/change': {
    controller    : 'AvatarController',
    action        : 'changeAvatarPage'
  },

  'post /avatar/change': {
    controller    : 'AvatarController',
    action        : 'uploadAvatar'
  },

  'get /avatar/crop': {
    controller    : 'AvatarController',
    action        : 'cropAvatarPage'
  },

  'post /avatar/crop': {
    controller    : 'AvatarController',
    action        : 'cropAvatar'
  },

  // get logged in user avatar
  'get /avatar/:id': {
    controller    : 'AvatarController',
    action        : 'getAvatar'
  },

  // page with  user avatars
  'get /avatar': {
    controller    : 'AvatarController',
    action        : 'userAvatarsPage'
  },

  'post /api/v1/user/:id/avatar': {
    controller    : 'AvatarController',
    action        : 'changeAvatar'
  },

  'get /user/role': {
    controller    : 'UserController',
    action        : 'findUserByRole',
    model         : 'user'
  }  
}