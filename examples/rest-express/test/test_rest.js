process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../appREST.js');
let should = chai.should();

chai.use(chaiHttp);

const describeGet = (comment, path, user, mytest) => {
  describe(comment, () => {
    it('it should GET all the users', (done) => {
      chai.request(server)
        .get(path)
        .set('Authorization', user)
        .end((err, res) => {
          mytest(res);
          done();
        });
    });
  });
} 

describe('/users = list user', () => {
  /*
  * Test the /users
  */
  for(user of ['alice', 'bob']) {
    describeGet('ALLOW role namecheck/admin', '/users', user, (res) => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      res.body.length.should.be.eql(3);
    });
  }

  describeGet('DENY others', '/users', 'chris', (res) => {
    res.should.have.status(403);
  });
});

describe('/users/:user/age = getage user', () => {
  describeGet('ALOW admin', '/users/chris/age', 'alice', (res) => {
    res.should.have.status(200);
    res.should.be.json;
  });

  describeGet('DENY others', '/users/chris/age', 'bob', (res) => {
    res.should.have.status(403);
  });

  describeGet('Allow owner', '/users/chris/age', 'chris', (res) => {
    res.should.have.status(200);
    res.should.be.json;
  });
});

describe('/users/:user = get user', () => {
  for(user of ['alice', 'bob', 'chris']) {
    describeGet('ALLOW owner', `/users/${user}`, user, (res) => {
      res.should.have.status(200);
      res.should.be.json;
    });
  }
});

describe('/offices = list office', () => {
  /*
  * Test the /offices
  */
  for(user of ['alice', 'bob', 'chris']) {
    describeGet('/GET users', '/offices', 'chris', (res) => {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      res.body.length.should.be.eql(1);
    });
  }
});
