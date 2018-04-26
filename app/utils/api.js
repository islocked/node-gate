"use strict";

const request = require( 'request' );
const qs = require( 'querystring' );
let logger = require( "./log4.js" ).getLogger( 'operate' );

/**
 * 发送get请求
 * @param	callback 	function( err, resp, data ){}
 */
exports.get = function( options, callback )
{
	request.get( options, callback );
};

/**
 * 发送post请求
 * @param	callback 	function( err, resp, data ){}
 */
exports.post = function( options, callback )
{
	request.post( options, callback );
};

/**
 * 发送带有参数的get请求
 */
exports.doSendByGet = function( url, data, callback )
{
	let _options = {
		url : url + '?' + qs.stringify( data ),
		//timeout : 10000
	};
	console.log( '==options==', _options );
	this.get( _options, function( err, resp, data ){

		if( err || resp.statusCode !== 200 ) 
		{
            callback( false, { errcode: 500 } );
            return;
        }        
        callback( true, JSON.parse( data.trim() ) );
	});
};

/**
 * 将消息发送出去(发送给前端)
 * @param   res         发送接口
 * @param   errcode     错误码
 * @param   errmsg      发生错误时的错误信息
 * @param   data        发送参数
 */
exports.send = function( res, errcode, errmsg, data )
{
	if( !data ) data = {};

    errcode = errcode || 0;
	data.errcode = errcode;
    if( errcode !== 0 )
    {
        data.errmsg = errmsg;
    }
	res.send( JSON.stringify( data ) );
};

/**
 * 将消息发送出去(发送给管理平台)
 * @param   res         发送接口
 * @param   code     	返回码
 * @param   data        发送参数
 */
exports.sendPlat = function( res, code, data )
{
	if( !data ) data = {};

	data.code = code;
	res.send( JSON.stringify( data ) );
};