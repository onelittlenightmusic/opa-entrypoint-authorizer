process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);

const url = `http://localhost:8008/`;
const request = require('supertest')(url);

let response

const describeQuery = (tag, comment, query, user, mytest) => {
  describe(tag, () => {
    it(comment, (done) => {
      request.post('/')
      .set('Authorization', user)
      .send({query})
      .expect(200)
      .end((err,res) => {
        if (err) return done(err);
        response = res;
        mytest(res);
        done();
      })
    });
  });
} 

const describeData = (tag, comment, mytest) => {
  describe(tag, () => {
    it(comment, (done) => {
      mytest(response);
      done();
    })
  })
}
let query
query = `
query a {
  offices {
    name
    floor
  }
  users {
    name
    age
  }
  alice: user(name: "alice") {
    name
    age
  }
  bob: user(name: "bob") {
    name
    age
  }
  chris: user(name: "chris") {
    name
    age
  }
}
`
describe('Admin', () => {

  describeQuery('user', 'Request', query, 'alice', (res) => {
  })

  describeData('users', 'ALLOW user', (res) => {
    res.body.data.users.should.exist;
  });

  describeData('user', 'ALLOW admin', (res) => {
    res.body.data.alice.name.should.exist;
  });

  describeData('user.age', 'ALLOW admin', (res) => {
    res.body.data.alice.age.should.exist;
  });

  describeData('user.age', 'ALLOW admin', (res) => {
    res.body.data.chris.age.should.exist;
  });

  describeData('office', 'ALLOW public', (res) => {
    res.body.data.offices.should.exist;
  });
});

describe('Namecheck', () => {

  describeQuery('user', 'Request', query, 'bob', (res) => {
  })

  describeData('users', 'ALLOW user', (res) => {
    res.body.data.users.should.exist;
  });

  describeData('user.name', 'ALLOW namecheck', (res) => {
    res.body.data.alice.name.should.exist;
  });

  describeData('user.age', 'DENY namecheck', (res) => {
    should.not.exist(res.body.data.alice.age);
  });

  describeData('office', 'ALLOW public', (res) => {
    res.body.data.offices.should.exist;
  });
});

describe('No role', () => {
  describeQuery('user', 'Request', query, 'chris', (res) => {
  })

  describeData('users', 'DENY user', (res) => {
    should.not.exist(res.body.data.users);
  });

  describeData('user', 'DENY user', (res) => {
    should.not.exist(res.body.data.alice);
  });

  describeData('user.name', 'ALLOW owner', (res) => {
    res.body.data.chris.name.should.exist;
  });

  describeData('user.age', 'ALLOW owner', (res) => {
    res.body.data.chris.age.should.exist;
  });

  describeData('office', 'ALLOW public', (res) => {
    res.body.data.offices.should.exist;
  });
});
