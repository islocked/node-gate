"use strict";

/**
 * 热更新文件管理
 */
let HotWork = require( './hotwork.js' );
let fs = require( 'fs' );

let HotManager = module.exports;

//因为加载监听时异步，因此先初始化，保证后面时同步调用
HotManager.init = function()
{
    for( let k in HotManager )
    {
        if( k == 'init' || typeof HotManager[ k ] != 'function' ) continue;

        HotManager[ k ]();
    }
};

HotManager.getApi = function()
{
    return HotWork.getMode( 'Api', __dirname + '/../utils/api.js' );
};

HotManager.getCommon = function()
{
    return HotWork.getMode( 'Common', __dirname + '/../utils/common.js' );
};

HotManager.getIndexServer = function()
{
    return HotWork.getMode( 'IndexServer', __dirname + '/../server/indexServer.js' );
};

HotManager.getRouteServer = function()
{
    return HotWork.getMode( 'RouteServer', __dirname + '/../server/routeServer.js' );
};

HotManager.getRouteCfgServer = function()
{
    return HotWork.getMode( 'RouteCfgServer', __dirname + '/../server/routeConfigServer.js' );
};

HotManager.getUserDao = function()
{
    return HotWork.getMode( 'AccountDao', __dirname + '/../dao/userDao.js' );
};

function scanFiles( path )
{
	if( path.charAt( path.length - 1 ) !== '/' ) path + '/';
	let files = fs.readdirSync( path );

	if( files.length < 1 ) return;

	files.forEach(function(file){

        let stat = fs.statSync( path + file );
        if( stat.isDirectory() )
        {
            // 如果是文件夹遍历
            //scanFiles( path + '/' + file );
        }
        else
        {
            if( file.indexOf( '.js' ) == -1 ) return;

            console.log( 'filename-->' + file.substring( 0, file.length - 3 ) );
            HotWork.getMode( 'Scan' + file.substring( 0, file.length - 3 ), path + file );
        }			
    });
}

/**
 * 获取模块
 * @param   file_name       文件名字(不带后缀)
 */
HotManager.getMode = function( file_name ){

    return HotWork.getModeByName( 'Scan' + file_name );
};

//启动加载文件
HotManager.loadScanInit = function(){

    scanFiles( __dirname + '/../dao/' );
    scanFiles( __dirname + '/../server/' );
    scanFiles( __dirname + '/../mode/' );
    scanFiles( __dirname + '/../utils/' );
};

//根据路劲加载
HotManager.loadScan = function( path ){

    if( !path ) return;

    scanFiles( path );
};

//初始化文件
HotManager.init();