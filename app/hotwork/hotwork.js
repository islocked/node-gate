"use strict";
/**
 * Created by Thinkpad on 2017/9/6.
 */
let fs = require("fs");      //文件系统模块

let fileMap = {};
let filePath = {};

function cleanCache( modulePath ) 
{
    let module = require.cache[ modulePath ];
    if ( !module ) return;

    if ( module.parent ) 
    {
        module.parent.children.splice( module.parent.children.indexOf( module ), 1 );
    }
    require.cache[ modulePath ] = null;
}

let watchFile = function ( mode_name, filepath ) {

    let fullpath = require.resolve( filepath );
    fileMap[ mode_name ] = require( fullpath );
    filePath[ mode_name ] = filepath;
    fs.watch( fullpath, function( event, filename ){
        if (event === "change") 
        {
            cleanCache( fullpath );
            delete fileMap[ filepath ];
            try 
            {
                //let routes = require( filepath );
                fileMap[ mode_name ] = require( filepath );
                console.log("reload module", fullpath );
            } catch (ex) {
                console.error( 'module update failed', fullpath );
            }
        }
    });
};

//新增监控文件数组 [ [ 'GAME', './game.js' ], [ 'TOOL', './tool.js' ] ]

exports.addWatch = function( mode_name, file_path )
{
    watchFile( mode_name, file_path );
};

exports.addWatchFiles = function( filesArr )
{
    if( typeof filesArr != 'object' || filesArr.constructor != Array ) return;

    for( let i = 0; i < filesArr.length; i ++ )
    {
        watchFile( filesArr[ i ][ 0 ], filesArr[ i ][ 1 ] );
    }
};

exports.getMode = function( mode_name, file_path )
{
    //if( !fileMap[ filename ] ) return  {};

    if( !fileMap[ mode_name ] && file_path )
    {
        //如果文件不存在，并且文件路径存在，创建一个监听文件
        this.addWatch( mode_name, file_path );
    }
    return fileMap[ mode_name ];
};

//通过名字获取模块
exports.getModeByName = function( mode_name )
{
    //if( !fileMap[ filename ] ) return  {};

    if( !filePath[ mode_name ] ) return {};

    return this.getMode( mode_name, filePath[ mode_name ] );
};
// var g_WatchFiles = ["./patch"];
// for (var i=0;i<g_WatchFiles.length;i++) {
//     watchFile(g_WatchFiles[i]);
// }

// setInterval(function() {
//     var hotPatchTest = require("./patch");
// }, 1000);