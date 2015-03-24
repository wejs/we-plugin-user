
  App.UserMenuController = Ember.Controller.extend({
    isVisible: false,

    accountsLinks: function (){
      var host = this.get('accountsHost');

      this.setProperties({
        accounts: host + '/accounts'
      });

    }.observes('accountsHost').on('init'),

    drupalLinks: function () {
      var host = this.get('drupalHost');

      this.setProperties({
        messages: host + '/user_messages',
        friends: host + '/user_friends',
        notification: host + '/user_mail_notify',
        notes: host + '/user_myresults'
      });

    }.observes('drupalHost').on('init'),

    currentUser: function () {
      return App.get('currentUser');
    }.property('App.currentUser'),

    adminMenu: function (){
      var links = Ember.get(App, 'configs.client.publicVars.menus.admin.links' );
      links = links.reduce(function (prev, curr){
        return prev.concat(curr.roles);
      }, []);
      var linksUnique = _.uniq(links);
      var currentUserRoles = Permissions.currentUserRolesWithProp('name');
      var intersection = _.intersection(currentUserRoles, linksUnique);
      return intersection.length;
    }.property('currentUser'),

    init: function() {
      var self = this;
      if(App.currentUser.id){
        self.set('isVisible', true);
      }
      // Set drupal host for menu
      self.set('drupalHost', we.configs.client.publicVars.drupal);
      self.set('accountsHost', we.configs.server.providers.accounts);

      we.hooks.on("user-authenticated",function(user, done){
        self.set('isVisible', true);
        done();
      });
      we.hooks.on("user-unauthenticated",function(user, done){
        self.set('isVisible', false);
        done();
      });
    },
    actions: {
      showAvatarChangeModal: function(){
        we.events.trigger('showAvatarChangeModal', {
          user: this.get('model')
        });
      }
    }
  });

