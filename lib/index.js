const _        = require('lodash');
const Express  = require('express');
const Request  = require('request');
const BoiUtils = require('boi-utils');

function verifyParams(rules, params) {
  if (_.isEmpty(rules)) {
    return true;
  }
  const RequiredParams = new Set();
  const LimitedParams = {};

  rules.forEach(rule => {
    if (rule.required) {
      RequiredParams.add(rule.name);
    }
    if (!_.isEmpty(rule.oneOf)) {
      RequiredParams.add(rule.name);
      LimitedParams[rule.name] = rule.oneOf;
    }
  });

  const ParamsKeys = Object.keys(params);
  for (const requiredParam of RequiredParams) {
    if (ParamsKeys.indexOf(requiredParam) === -1) {
      return false;
    }
  }

  return true;
}

/**
 * @class Router
 */
class Router {
  /**
   * @constructs Router 
   * @param {Object} server   Express instance
   * @param {Array}  mocklist set of mock apis
   */
  constructor(server, mocklist) {
    this.server = server;
    this.mocklist = mocklist;
    this.router = Express.Router();
    // resolve the mock list
    this.mocklist.forEach(mockitem => {
      this.resolve(mockitem);
    });
    // integrated to server
    this.server.use('/', this.router);
  }
  /**
   * @method resolve resolve the api's configuration
   * @param {Object} mock mock api configuration
   */
  resolve(mock) {
    const {
      api: Api,
      method: Method,
      inParams: Params,
      res: Response,
      proxyApi: ProxyApi,
      options: Options
    } = mock;

    if (!ProxyApi) {
      const CustomJsonpCallback = Options && Options.jsonpCallback || 'callback';
      /**
       * customize jsonpCallback of res.jsonp()
       * @see http://expressjs.com/en/4x/api.html#app.set
       */
      this.server.set('jsonp callback name', CustomJsonpCallback);
      this.router[Method](Api, (req, res) => {
        const ResType = req.query[CustomJsonpCallback] ? 'jsonp' : 'json';
        if (!verifyParams(Params, req.query)) {
          res[ResType](Response.fail || {
            code: 500,
            msg: 'Invalid parammeters'
          });
        } else {
          res[ResType](Response.success);
        }
      });
    } else {
      this.router[Method](Api, (req, res) => {
        req.pipe(Request({
          url: ProxyApi,
          method: Method,
          qs: req.query
        })).pipe(res);
      });
    }
  }
}

/**
 * @module boi/mock
 * @param {Object|Null} server   Express instance
 * @param {Array}       mocklist set of mock apis
 * @param {number}      port     port number that be used
 */
module.exports = function (server, mocklist, port = 8889) {
  if (!mocklist || _.isEmpty(mocklist)) {
    BoiUtils.log.error('Invalid mock configuration');
    process.exit(1);
  }
  const Server = server || new Express();
  new Router(Server, mocklist);
  if (!server) {
    Server.listen(port, err => {
      if (err) {
        throw new Error(err);
      }
      BoiUtils.log.success(`Mock server is listening localhost:${port}`);
    });
  }
};