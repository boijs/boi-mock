# boi-mock
[![license](https://img.shields.io/github/license/boijs/boi.svg?style=plastic)](https://github.com/boijs/boi/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/boi-mock.svg?style=plastic)](https://www.npmjs.com/package/boi-mock)

mock server/module of boi

## Installation
```bash
npm install boi-mock --save-dev
```

## Usage
### Node.js integration

Put config file `boi.mock.config.js`(**nonrestrictive naming**) under any directory with content as shown below:

```javascript
module.exports = [{
  // request method
  method: 'post',
  // path
  api: '/signup',
  // url queries
  inParams: [{
    name: 'username',
    // if required is set as true,then request without the parameter would be failed
    required: true
  },{
    name: 'passport',
    required: false
  }],
  // response data
  res: { 
    success: {
      code: 200,
      msg: '操作成功',
      data: {
        username: 'John'
      }
    }, 
    fail: {
      code: 500,
      msg: '操作失败',
    }
  },
  options: { 
    // customize jsonpCallback
    jsonpCallback: 'callback'
  } 
},{
  method: 'get',
  api: '/userinfo',
  // the request would be forwarded to the proxyApi on proxy mode
  proxyApi: 'http://passport.boi.com/userinfo',
}]
```

Then run code as follows:
```javascript
const BoiMock = require('boi-mock');
const Config = require('./boi.mock.config.js);

BoiMock(null,Config,9999);
```

The mock api `http://localhost:9999/signup` and `http://localhost:9999/userinfo` are available.

### [Boi](https://github.com/boijs/boi) integration
Insert configuration into `boi-conf.js` as follows:

```javascript
boi.mock('Post /signup').params({
  name: {
    required: true
  },
  passport: {
    required: false
  }
}).custom({
  jsonpCallback: 'callback'
}).response({
  success: {
    code: 200,
    msg: '请求成功',
    data: {
      a: 1
    }
  },
  fail: {
    code: 500,
    msg: '请求失败',
    data: {
      b: 1
    }
  }
});
boi.mock('Get /userinfo').proxy('http://passport.boi.com/userinfo');
```

Execute command on your command line terminal:
```bash
boi mock -p 9999
```

The mock api `http://localhost:9999/signup` and `http://localhost:9999/userinfo` are available.

> port would be 8889 if not be specified

If you want run boi-serve with mock integration,you can just run:
```bash
boi serve
```

boi-serve would use port 8888 by default,then  the mock api `http://localhost:8888/signup` and `http://localhost:8888/userinfo` are available.