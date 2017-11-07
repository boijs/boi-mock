const Express = require('express');
const BoiUtils = require('boi-utils');
const Proxy = require('express-http-proxy');

function verifyParams(){
  return true;
}

class Router {
  constructor(server,mocklist) {
    this.server = server;
    this.mocklist = mocklist;
    this.router = Express.Router();
    this.mocklist.forEach(mockitem => {
      this.resolve(mockitem);
    });
    this.server.use('/',this.router);
  }
  resolve(mock) {
    const {
      api      : Api,
      method   : Method,
      inParams : Params,
      res      : Response,
      proxyApi : ProxyApi,
      options  : Options
    } = mock;
    
    if(!ProxyApi){
      const CustomJsonpCallback = Options&&Options.jsonpCallback||'callback';
      /**
       * customize jsonpCallback of res.jsonp()
       * @see http://expressjs.com/en/4x/api.html#app.set
       */
      this.server.set('jsonp callback name', CustomJsonpCallback);
      this.router[Method](Api, (req, res) => {
        const ResType = req.query[CustomJsonpCallback]?'jsonp':'json';
        if(Params&&!verifyParams(Params)){
          res[ResType](Response.fail || {
            code: 500,
            msg: 'Invalid parammeters'
          });
        }else{
          res[ResType](Response.success);
        }
      });
    }else{
      this.server.use(Api,Proxy(ProxyApi, {
        filter: req => {
          return req.method === Method;
        }
      }));
    }
  }
}

module.exports = function (server, mocklist, port) {
  const Server = server || new Express();
  new Router(Server,mocklist);
  if(!server){
    Server.listen(port||8889, err => {
      if (err) {
        throw new Error(err);
      }
      BoiUtils.log.success(`Mock server is listening localhost:${port||8889}`);
    });
  }
};