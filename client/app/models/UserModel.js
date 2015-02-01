// App.User = DS.Model.extend({

//   autor: DS.hasMany('relato', {inverse: 'autores'}),
//   ator: DS.hasMany('relato', {inverse: 'atores'}),

// });

App.UserAdapter = App.ApplicationRESTAdapter.extend();

// App.UserSerializer = DS.RESTSerializer.extend({
//   primaryKey: 'idInProvider'
// });

we.hooks.on('we-bootstrap-configure-after-success',function(data,next){
  // set host after we.js get server and cliend configs
  App.UserAdapter.reopen({
    'host': we.configs.server.providers.accounts
  });

  next();
});

$(function() {
  App.User.reopen({
    avatar:  DS.belongsTo( 'images', {
      async: true,
      inverse: 'avatarOf'
    }),

    images:  DS.belongsTo( 'images', {
      async: true,
      inverse: 'creator'
    }),

    biographyClean: function() {
      var text = this.get('biography')
      if(!text) return '';
      return text.replace(/(<([^>]+)>)/ig,'')
    }.property('biography'),

  });

  App.Images.reopen({
    avatarOf:  DS.hasMany( 'user', {
      async: true,
      inverse: 'avatar'
    }),
  })
});