App.Router.map(function(match) {
  // post route map
  this.resource('user', function (){
    this.route('view', {path: '/:user_id'});
    this.route('edit', {path: '/:user_id/edit'});
  });

  this.route('user.create',{path: '/add/user'});

});

App.UserIndexRoute = Ember.Route.extend({
  setupController: function (controller, model) {
    controller.set('user', null);
  }
});

App.UserViewRoute = Ember.Route.extend({
  model: function (params) {
    return {
      attributes: Ember.get('App.User.attributes').keys.list,
      record: this.get('store').find('user', params.user_id)
    };
  }
});

App.UserEditRoute = Ember.Route.extend({
  model: function (params) {
    return {
      attributes: Ember.get('App.User.attributes').keys.list,
      record: this.get('store').find('user', params.user_id)
    };
  }
});

