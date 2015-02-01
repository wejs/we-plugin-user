$(function() {
  // overrides default contact model if exists
  if (!App.contact) return;

  App.Contact = DS.Model.extend({
    status: DS.attr('string', {
      defaultValue: 'requested',
      async: true
    }),

    name: DS.attr('string', {
      async: true
    }),

    user_id: DS.attr('number', {
      async: true
    }),

    // relationship
    // from: DS.attr('string'),
    // to: DS.attr('string'),

    from: DS.belongsTo('user',{
      inverse: 'contactFrom',
      async: true
    }),

    to: DS.belongsTo('user',{
      inverse: 'contactTo',
      async: true
    }),

    isTalking: DS.attr('boolean' ,{
      defaultValue: false
    }),

    // online | offline | away nilzer
    onlineStatus: DS.attr('string', {
      defaultValue: 'offline'
    }),

    hasNews: DS.attr('boolean' ,{
      defaultValue: false
    }),

    createdAt: DS.attr('date'),
    updatedAt: DS.attr('date'),

    // COMPUTED PROPERTYES

    // requested | requestsToYou | accepted | ignored
    currentUserStatus: function(){
      if(
        this.get('from.id') != App.get('currentUser.id') &&
        this.get('status') == 'requested'
      ) {
        return 'requestsToYou';
      } else {
        return this.get('status');
      }
    }.property('status', 'App.currentUser.id'),

    /**
     * Set contact user get from "to" or "from" fields
     *
     * @return {object} model user object
     */
    contactUser: function() {
      // only return a user object if user is authenticated
      if(!App.get('auth.isAuthenticated') ) return null;

      if( this.get('from.id') != App.get('currentUser.id') ) {
        return this.get('from');
      } else {
        return this.get('to');
      }

    }.property('App.auth.isAuthenticated', 'from', 'to')
  });

  App.User.reopen({
    contactFrom: DS.belongsTo( 'contact', {
      async: true,
      inverse: 'from'
    }),

    contactTo: DS.belongsTo( 'contact', {
      async: true,
      inverse: 'to'
    })
  });


  we.events.on('sails:created:contact', function(message) {
    var userId = App.get('currentUser.id');

    if (userId == message.data.to) {
      message.data.status = 'requestsToYou';
      message.data.contactId = message.data.from;
    } else {
      message.data.contactId = message.data.to;
    }

    we.events.trigger('contact:requested', message);
  });

  we.events.on('sails:updated:contact', function(message) {
    var userId = App.get('currentUser.id');

    if (userId == message.data.to) {
      message.data.contactId = message.data.from;
    } else {
      message.data.contactId = message.data.to;
    }

    we.events.trigger('contact:accepted' , message);
    we.events.trigger('contact:accepted:' + message.data.id , message);
  });

  App.ContactAdapter = App.ApplicationRESTAdapter.extend();

});