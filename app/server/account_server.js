"use strict";

let express = require('express');
//let db = require('../utils/db');
//let http = require("../utils/http");
const fs = require( 'fs' );
//let Api = require( '../utils/api.js' );
//const Common = require( '../utils/common.js' );
let HotManager = require( '../hotwork/hotManager.js' ); 

let app = express();
let hallAddr = "";

function send(res,ret){
	let str = JSON.stringify(ret);
	res.send(str);
}

let secretKey = "sdfewfopjsdf2w35i3~`!)(405i4";
let config = null;

//获取当前游戏微信信息
const appInfo = {
	Android:{
		appid:"wxbb8d93af6870f442",
		secret:"92b219f63502cf0e281e9829b852c35d"
	},
	iOS:{
		appid:"wxbb8d93af6870f442",
		secret:"92b219f63502cf0e281e9829b852c35d",
	}
};

exports.start = function(cfg){
	config = cfg;
	hallAddr = config.HALL_IP  + ":" + config.HALL_CLIENT_PORT;
	app.listen(config.CLIENT_PORT);
	console.log("account server is listening on " + config.CLIENT_PORT);
};

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//获取服务器信息
app.get('/get_serverinfo',function( req, resp ){

	HotManager.getAccServer().getServerInfo( req, resp );
});

app.get('/guest',function(req,res){
	
	HotManager.getAccServer().guest( req, resp );
});

//用户登陆
app.get( '/login', function( req, resp ){

	HotManager.getAccServer().login( req, resp );
});