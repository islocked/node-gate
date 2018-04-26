"use strict";

//环境
const ENV = 'DEBUG';            //内部测试
//const ENV = 'PRODUCT';        //正式环境
exports.ENV = ENV;

//游戏id
const game_id = 10030;

const HALL_IP = "10.10.6.26";            //大厅ip

// const HALL_CLIENT_PORT = 19001;         //大厅端口(前端链接)
// const ACCOUNT_CLIENT_PORT = 19000;      //账号服端口(前端可链接)
// const GAME_CLIENT_PORT = 20000;         //大厅服暴露给前端的socket接口(前端可链接)

// const HALL_ROOM_PORT = 19002;           //大厅房间端口(服务器内部接口)
// const GAME_HTTP_PORT = 19003;           //暴露给大厅服的端口(不对外)

const ACCOUNT_CLIENT_PORT = game_id + 1;      //账号服端口(前端可链接)
const HALL_CLIENT_PORT = game_id + 1000;            //大厅端口(前端链接)
const HALL_ROOM_PORT = game_id + 2000;           //大厅房间端口(服务器内部接口)
const GAME_HTTP_PORT = game_id + 3000;           //暴露给大厅服的端口(不对外)
const GAME_CLIENT_PORT = game_id + 4000 + ( game_id % 10000 ) * 500;         //游戏服暴露给前端的socket接口(前端可链接),乘以500是因为游戏服多开，留下扩展端口

const ACCOUNT_PRI_KEY = "^&*#$%()@";    //账号加密key
const ROOM_PRI_KEY = "~!@#$(*&^%$&";    //房间加密key

const LOCAL_IP = 'localhost';// '10.10.6.26';           //本地地址

const APP_WEB = 'https://a.mlinks.cc/AcUa'; //分享地址

//平台请求地址(默认为内部使用)
let PLAT = { HOST : '10.10.4.33', PORT : 41000 };
//mysql地址
let MYSQL = {
    HOST:'127.0.0.1',
    USER:'root',
    PSWD:'',
    DB:'fdmj',
    PORT:3306
};

//账号服务器mysql地址
let CENTER_MYSQL = {

    HOST:'127.0.0.1',
    USER:'root',
    PSWD:'',
    DB:'game-center',
    PORT:3306
};

if( ENV == 'PRODUCT' )
{
    //生产环境
    PLAT = { HOST : '116.62.70.201', PORT : 41000 };

    MYSQL = {
        HOST:'127.0.0.1',
        USER:'root',
        PSWD:'123',
        DB:'cxmj',
        PORT:3306
    };
}

//游戏id
exports.game_id = game_id;

//返还账号服务器mysql配置
exports.center_mysql = CENTER_MYSQL;

//mysql配置
exports.mysql = function()
{
    return MYSQL;
}

//平台配置
exports.plat = function()
{
    return PLAT;
};

//账号服配置
exports.account_server = function()
{
    return {
		CLIENT_PORT:ACCOUNT_CLIENT_PORT,
		HALL_IP:HALL_IP,
		HALL_CLIENT_PORT:HALL_CLIENT_PORT,
		ACCOUNT_PRI_KEY:ACCOUNT_PRI_KEY,
		
		//
		DEALDER_API_IP:LOCAL_IP,
		DEALDER_API_PORT:12581,
		VERSION:'20161227',
		APP_WEB:APP_WEB,
	};
};

//大厅服配置
exports.hall_server = function(){
	return {
		HALL_IP:HALL_IP,
		CLEINT_PORT:HALL_CLIENT_PORT,
		FOR_ROOM_IP:LOCAL_IP,
		ROOM_PORT:HALL_ROOM_PORT,
		ACCOUNT_PRI_KEY:ACCOUNT_PRI_KEY,
		ROOM_PRI_KEY:ROOM_PRI_KEY
	};	
};

//游戏服配置
exports.game_server = function(){
	return {
		SERVER_ID:"001",
		
		//暴露给大厅服的HTTP端口号
		HTTP_PORT:GAME_HTTP_PORT,
		//HTTP TICK的间隔时间，用于向大厅服汇报情况
		HTTP_TICK_TIME:5000,
		//大厅服IP
		HALL_IP:LOCAL_IP,
		FOR_HALL_IP:LOCAL_IP,
		//大厅服端口
		HALL_PORT:HALL_ROOM_PORT,
		//与大厅服协商好的通信加密KEY
		ROOM_PRI_KEY:ROOM_PRI_KEY,
		
		//暴露给客户端的接口
		CLIENT_IP:HALL_IP,
		CLIENT_PORT:GAME_CLIENT_PORT
	};
};