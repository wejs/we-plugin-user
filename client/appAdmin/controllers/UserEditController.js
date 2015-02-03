App.UserEditController = Ember.ObjectController.extend({
	actions: {
		save: function () {
			var self = this;
			var user = self.get('record.content');
			self.updateProvider(user)
			.then(function (updatedUser){
				user.save().then(function (user){
					self.transitionToRoute('user.view', user.id);
				}, function (error){
					user.rollback();
					console.log(error);
				});				
			})
			.fail(function (error){
					user.rollback();
					console.log(error);
			});
		}
	},

	updateProvider: function (user) {
		var url = we.configs.server.providers.accounts + '/user/' + user.get('idInProvider');

		if (!user._attributes.username) user._attributes.username = user.get('username');

		return Ember.$.ajax({
		  url: url,
		  dataType: 'json',
		  type: 'PUT',
		  crossDomain: true,
		  xhrFields: {
     		withCredentials: true
   		},
		  data: user._attributes
		});
	},
});
