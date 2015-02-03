
module.exports = function(sails) {
  var hook =  {
    // Implicit default configuration
    // (mixed in to `sails.config`)
    defaults: {
      user: {
        SALT_WORK_FACTOR: 10
      }
    },
    initialize: function(cb) {
      return cb();
    }
  }
  return hook;
}