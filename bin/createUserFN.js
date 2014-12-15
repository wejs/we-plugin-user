var sget = require('sget');

var userStub = {
  username: 'afrosamuray',
  biography: 'Afro Samuray is a hero how helps people!',
  email: 'contato@albertosouza.net',
  password: '123',
  displayName: 'Afro Samuray',
  language: 'pt-br',
  active: true
}

module.exports = function createUser(done) {
  sails.log.info('-');
  sails.log.info('--');
  sails.log.info('--- User creation: ----');
  sails.log.info('--');
  sails.log.info('-');

  // alows user set new user data
  var whantsSendUserData = sget('Do you want to choose the user data to be created?. \n y or n?');
  // remove \n
  whantsSendUserData = whantsSendUserData.replace('\n','');

  if ( whantsSendUserData === 'y') {
    userStub.displayName = sget('What is the displayName?');
    userStub.displayName = userStub.displayName.replace('\n','');
    userStub.username = sget('What is the username?');
    userStub.username = userStub.username.replace('\n','');
    userStub.email = sget('What is the email?');
    userStub.email = userStub.email.replace('\n','');
    userStub.password = sget('What is the password?');
    userStub.password = userStub.password.replace('\n','');
  } else {
    sails.log.info('I will create the user: ', userStub);
  }

  User.create(userStub)
  .exec(done);
}