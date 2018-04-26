"use strict";

//const cluster = require('cluster');
//const cpuNums = require('os').cpus().length;
let fs = require( 'fs' );
let plat_web = JSON.parse( fs.readFileSync( __dirname + '/config/plat_url.json', 'utf-8' ) );     //获取后台地址，用来获得配置信息，已启动服务器
let mysql = JSON.parse( fs.readFileSync( __dirname +  '/config/mysql.json', 'utf-8' ) );           //获取mysql地址，链接服务器使用
let Mysql = require( './app/lib/mysql.js' );
let Redis = require( './app/lib/redis.js' );
let Common = require( './app/utils/common.js' );
let Api = require( './app/utils/api.js' );
let logger = require( "./app/utils/log4.js" ).getLogger( 'account' );                   //获得logger文件信息
let HortWork = require( './app/hotwork/hotwork.js' );
//热更新初始化
//let hotManager = require( './app/hotwork/hotManager.js' );
//hotManager.init();
require( './app/hotwork/hotManager.js' );

global.CENTER_DB = new Mysql( mysql.center, 100 );    //链接mysql
global.REDIS = new Redis( { db: 1 } );    //链接redis
global.SUB_REDIS = new Redis( { db:  1 } );    //订阅链接redis(执行SUBSCRIBE命令后客户端会进入订阅状态，处于此状态的客户端不能使用SUBSCRIBE、UNSUBSCRIBE、PSUBSCRIBE、PUNSUBSCRIBE 这4个属于"发布/订阅"模式的命令之外的命令)
global.GAME_CONF = {};
global.AUTH = {};       //显示权限(大厅显示游戏)

//global.GAME_ID = configs.game_id;                   //游戏id
/*if( cluster.isMaster )
{
    for( let i = 0; i < cpuNums; i++ )
    {
        cluster.fork();
    }
}
else
{
    let as = require('./account_server');
    as.start(config);

    //let dapi = require('./dealer_api');
    //dapi.start(config);
}*/

//获得后台配置信息后，启动服务器
//Api.doSendByGet( plat_web.url, {}, function( err, retInfo ){

    //let asver = require('./app/server/account_server.js' );
    //asver.start( { HALL_IP : "10.10.6.26", CLIENT_PORT : 9005 } );
    //asver.start( { HALL_IP : retInfo.ip, HALL_CLIENT_PORT : retInfo.port } );
//});

//let account_server = require( './app/server/account_server.js' );
let IndexServer = require( './app/server/indexServer.js' );
//延迟执行，因为require的加载并不是实时的(可能被延迟)
setTimeout( () => {

    //account_server.start( { HALL_IP : data.self_addr, CLIENT_PORT : data.port_http } );
    IndexServer.start( { HALL_IP : '127.0.0.1', CLIENT_PORT : 3335 } );

}, 100 );

//let dapi = require('./dealer_api');
//dapi.start(config);

//监听异常错误
process.on('uncaughtException', function ( err ) 
{
	console.error( ' Caught exception: '+ err.stack );
    logger.error( ' Caught exception: '+ err.stack );
});