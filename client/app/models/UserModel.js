App.User = DS.Model.extend({
  username: DS.attr('string'),
  biography: DS.attr('string'),

  email: DS.attr(),
  displayName: DS.attr('string'),
  birthDate: DS.attr('date'),

  language: DS.attr('string',  {
    defaultValue: 'pt-br'
  }),

  // flags
  isAdmin: DS.attr('boolean', {
    defaultValue: false
  }),
  isModerator: DS.attr('boolean', {
    defaultValue: false
  }),
  active: DS.attr('boolean', {
    defaultValue: false
  }),

  // relationship s
  avatar:  DS.belongsTo( 'image', {
    async: true,
    inverser: 'avatarOf'
  }),

  images:  DS.belongsTo( 'image', {
    async: true,
    inverse: 'creator'
  }),

  locationState: DS.attr('string'),
  city: DS.attr('string'),

  contactFrom: DS.belongsTo( 'contact', {
    async: true,
    inverse: 'from'
  }),

  contactTo: DS.belongsTo( 'contact', {
    async: true,
    inverse: 'to'
  }),

  autor: DS.hasMany('relato', {inverse: 'autores'}),
  ator: DS.hasMany('relato', {inverse: 'atores'}),

  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),

  biographyClean: function() {
    var text = this.get('biography')
    if(!text) return '';
    return text.replace(/(<([^>]+)>)/ig,'')
  }.property('biography'),

  canEdit: function() {
    if (this.get('id') == App.get('currentUser.id')) {
      return true;
    }
    return false;
  }.property('id', 'App.currentUser.id')

});

App.UserAdapter = App.ApplicationRESTAdapter.extend();

// App.UserSerializer = DS.RESTSerializer.extend({
//   primaryKey: 'idInProvider'
// });

// we.hooks.on('we-bootstrap-configure-after-success',function(data,next){
//   // set host after we.js get server and cliend configs
//   App.UserAdapter.reopen({
//     'host': we.configs.server.providers.accounts
//   });

//   next();
// });
