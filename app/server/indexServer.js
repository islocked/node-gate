"use strict";

let HotManager = require( '../hotwork/hotManager.js' );
let express = require('express');

let app = express();

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

exports.start = function(cfg){
	//let hallAddr = cfg.HALL_IP  + ":" + cfg.HALL_CLIENT_PORT;
	app.listen(cfg.CLIENT_PORT);
	console.log("account server is listening on " + cfg.CLIENT_PORT);
};

//get请求
app.get( '/greq/:route_code', ( req, resp ) => {

    const route_code = req.params.route_code;
    HotManager.getRouteServer().init( route_code, req, resp );
});

//post请求
app.post( '/preq/:route_code', ( req, resp ) => {

    const route_code = req.params.route_code;
    HotManager.getRouteServer().init( route_code, req, resp );
});