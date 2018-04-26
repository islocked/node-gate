/**
 * 基本方法
 */
"use strict";
let Pako = require( 'pako' );
let fs = require( 'fs' );
let crypto = require('crypto');
let common = module.exports;

//打乱数组顺序
common.shuffle = function( arr )
{
    let tmp;
	let randomId = 0;
	for ( let i = 0; i < arr.length; i ++ )
	{
		randomId = parseInt( arr.length * Math.random() );
		tmp = arr[ i ];
		arr[ i ] = arr[ randomId ];
		arr[ randomId ] = tmp;
	}
	return arr;
};

//强转整数
common.intval = function( v )
{
	if ( v === undefined || v === null ) return 0;

	if ( v === true ) return 1;

	if ( v === false ) return 0;

	if ( typeof v == 'object' ) return 0;

	v = Number( v ); // parseInt( v ); //Number( v ),其实用Number转换更好
	if ( isNaN( v ) ) return 0;
	return v;
};

//数据是否为空
common.empty = function( obj ) 
{
	switch( typeof obj ) 
	{
		case 'undefined':
			return true;
			break;
		case 'string':
			return 0 === obj.trim().length;
			break;
		case 'number':
			return 0 == obj;
			break;
		case 'object':
			if( null == obj ) return true;

			if( obj.constructor == Array ) 
			{
				return 0 == obj.length;
			}
			else 
			{
				for( var t in obj ) 
				{
					return false;
				}
				return true;
			}
			break;
	}
	return false;
};

//深度克隆
common.clone = function( obj ) 
{
	if( obj === null ) return null;

	let o;
	if( typeof obj == "object" ) 
	{
		o = obj.constructor === Array ? [] : {};
		for( let i in obj ) 
		{
			if( obj.hasOwnProperty( i ) ) 
			{
				o[ i ] = typeof obj[ i ] === "object" ? this.clone( obj[ i ] ) : obj[ i ];
			}
		}
	}
	else 
	{
		o = obj;
	}		
	return o;
};

//获取零点时间
common.zeroTime = function ( t, type )
{
	type = type || 1;
	var date = t <= 0 ? new Date() : new Date( t );
	var m = date.getMonth() + 1;
	var zstr = date.getFullYear() +'/'+ m +'/'+ date.getDate();
	var zt = new Date( zstr ).getTime();
	return type == 1 ? zt : Math.floor( zt / 1000 );
};

//获取当前时间
common.getTime = function( type )
{
	//默认返回秒，1返回毫秒
	return type == 1 ? Date.now() : Math.floor( Date.now() / 1000 );
};

//方法判断
common.invokeCallback = function( cb )
{
	if( !!cb && typeof cb === 'function' ) 
	{
		cb.apply( null, Array.prototype.slice.call( arguments, 1 ) );
	}
};

//获取一个范围内的随机数(注：如果max为数组长度，需要减1)
common.rand = function( min, max )
{
	min = common.intval( min );
	max = common.intval( max );
	return ( min + Math.round( Math.random() * ( max - min ) ) );
};

/**
 * 适用于key值不重复的arr数据
 * @param 	arr  [ { 'role_id':1 }, { 'role_id':2 } ]
 * @param 	return { '1': { role_id: 1 }, '2': { role_id: 2 } }
 */
common.arrToObj = function( key, arr )
{
	if( this.empty( arr ) ) return {};

	let _obj = {};
	for( var i = 0; i < arr.length; i++ )
	{
		_obj[ arr[ i ][ key ] ] = arr[ i ];
	}
	return _obj;
};

/**
 * 权重掉落
 * @param 	arr  	[ { 'rate':1 }, { 'rate': 10 }]
 * @param 	key 	用什么字段作为筛选条件
 */
common.keyRateDrop = function ( arr, key )
{
	var num = 0;
	var tmp = [];
	for ( var i = 0; i < arr.length; i++ )
	{
		num += parseInt( arr[ i ][ key ] );
		for ( var j = 0; j < arr[ i ][ key ]; j++ )
		{
			tmp.push( arr[ i ] );
		}
	}
	var rate = this.rand( 0, num - 1 );
	return tmp[ rate ];
};

/**
 * 概率随机 返回键值
 * @param 	arr  	[ { 'rate':0.5 }, { 'rate': 0.8 }]
 * @param 	key 	用什么字段作为筛选条件
 */
common.getKeyRate = function( arr, key )
{
	const gate = 10000;
	let total = 0;
	for ( let i = 0; i < arr.length; i ++ )
	{
		total += this.intval( arr[ i ][ key ] );
	}
	if ( total <= 0 ) return -1;

	total = gate * total;
	let rand = this.rand( 0, total );
	let offset = 0;
	let value = 0;
	for ( let i = 0; i < arr.length; i ++ )
	{
		value = arr[ i ][ key ] * gate;
		if ( rand <= value + offset )
		{
			return i;
		}
		offset += value;
	}
	return -1;
};

/*
	将json对象变为数组
	obj  : json对象
*/
common.objToArr = function( obj )
{
	let arr = [];
	for( let k in obj )
	{
		arr.push( obj[ k ] );
	}
	return arr;
};

//解压数据
common.unzip = function( b64Data )
{  
	let strData = common.fromBase64( b64Data );  
	// Convert binary string to character-number array  
	let charData = strData.split('').map(function(x){return x.charCodeAt(0);});  
	// Turn number array into byte-array  
	let binData = new Uint8Array(charData);  
	// // unzip  
	let data = Pako.inflate( binData );  
	// Convert gunzipped byteArray back to ascii string:  
	strData = String.fromCharCode.apply(null, new Uint16Array(data));  
	return strData;  
};

//压缩数据
common.zip = function( str )
{
	let binaryString = Pako.gzip( str, { to: 'string' });  
	return common.toBase64( binaryString );  
};

//判断是否在数组中，在的话返回索引位置
common.inArray = function( arr, val )
{
	for( let i = 0; i < arr.length; i ++ )
	{
		if( arr[ i ] == val ) return i;
	}
	return -1;
};

//服务器状态信息
common.serverStatus = function( type )
{
	let path = __dirname + '/../serverStatus.json';
	if( type == 1 || type == 2 )
	{
		//关服
		let data = { server : type == 1 ? 0 : 1 };
		fs.writeFileSync( path, JSON.stringify( data, null, 4 ), 'utf-8' );

		return true;
	}
	if( type == 3 )
	{
		//获取游戏服务器状态，如果文件不存在，表示没有关闭过服务器，返回true
		let have = fs.existsSync( path );
		if( !have ) return true;

		have = JSON.parse( fs.readFileSync( path ) );

		return common.intval( have.server ) > 0;
	}
	return false;
};

//md5加密
common.md5 = function( str )
{
	return crypto.createHash('md5').update(str).digest('hex');	
};

//hmac加密
common.hmac = function( str, secrtKey )
{
	if( common.empty( str ) ) return '';

	return crypto.createHmac( 'sha1', secrtKey ).update( str ).digest( 'hex' );
};

//base64加密
common.toBase64 = function(content){

	if( typeof content != 'string' ) return '';

	return new Buffer( content ).toString('base64');
};

//base64解密
common.fromBase64 = function( content )
{
	if( typeof content != 'string' ) return '';
	
	return new Buffer( content, 'base64' ).toString();
};