App.UserIndexController = Ember.ObjectController.extend({	
	user: null,

  pushToStore: function() {
  	if (this.get('user')) return this.get('store').push('user', this.get('user'));
  }.observes('user'),

	actions: {
		weUserSearchSelected: function (userSelected) {
			// body...
			this.set('user', userSelected);
		}
	}
});