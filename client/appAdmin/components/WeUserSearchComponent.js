// App.inject( 'component:we-category-field', 'store', 'store:main' );

App.WeUserSearchComponent = Ember.Component.extend({
    tagName: 'input',
    // classNames: ['form-control'],
    classNameBindings: ['weUserSearchClass'],
    attributeStyling: ['style'],
    style: 'display:hidden',

    inputSize: 'input-md',
    placeholder: 'Digite um username...',
    minimumInputLength: 0,

    didInsertElement: function() {
        var self = this;
        var options = {};
        self._select = self.$();


        options.placeholder = self.get('placeholder');
        options.tokenSeparators = [','];
        options.minimumInputLength = self.get('minimumInputLength');

        options.escapeMarkup = function (m) { return m; }

        options.formatSelection = function(item) {
            return self.formatUserSelection(item);
        };

        options.formatResult = function(item) {
            return self.formatUserResult(item);
        };

        options.ajax = {
            url: '/user',
            dataType: 'json',
            quietMillis: 250,
            data: function (term, page) {
              var query = {
                where: JSON.stringify({
                  username: {
                    contains: term
                  },
                }),
                limit: 50
              };
              return query;
            },
            results: function (data, page) { // parse the results into the format expected by Select2.
              // since we are using custom formatting functions we do not need to alter remote JSON data
              return {
                results: data.user
              };
            }
        }

        Ember.assert("select2 has to exist", Ember.$.fn.select2);
        // Ember.assert("select2 needs a content array", self.get('content'));
        // Ember.assert("select2 needs a selected array", self.get('selected'));

        self._select.select2(options);
        self._select.on('select2-selecting', function(selection){
            self.sendAction('weUserSearchSelected', selection.object);
        });
    },

    formatUserResult: function(user) {

      var markup = '<div class="container-fluid">' +
           '<div class="row">' +
           '<div class="col-sm-3 text-center"><img style="width: 60px; height: 60px" src="/avatar/' + user.avatar + '" /></div>' +           
           '<div class="col-sm-9">' + 
              '<div>@' + user.username + '</div>' +
              '<div>' + user.displayName + '</div>' +
              '<div>' + user.email + '</div>' +
           '</div>'

      markup += '</div></div>';

      return markup;
    },

    formatUserSelection: function(user) {
        return '@' + user.username;
    }

});

