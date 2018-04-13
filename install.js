module.exports = {
  updates() {
    return [{
      version: '2.0.1',
      update(we, done) {
        we.log.info('Start project update v2.0.1');

        const sql = `ALTER TABLE \`users\` ADD COLUMN \`blocked\` TINYINT(1) NULL DEFAULT 0`;
        we.db.defaultConnection
        .query(sql)
        .then( ()=> {
          we.log.info('Done project update v2.0.1');
          done();
          return null;
        })
        .catch( (err)=> {
          if (err.name == 'SequelizeDatabaseError') {
            if (err.message == `Duplicate column name 'blocked'`) {
              // fields already exists, nothing to do:
              done();
              return null;
            }
          }

          done(err); // unknow error
          return null;
        });
      }
    }];
  }
};