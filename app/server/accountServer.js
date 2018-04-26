"use strict";

let HotManager = require( '../hotwork/hotManager.js' );

let AccServer = module.exports;

let hallAddr = "";

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

function send( res, ret )
{
	let str = JSON.stringify( ret );
	res.send(str);
}

AccServer.getServerInfo = function( req, resp ){

    if( !req.query.version )
	{
		//客户端上传版本号(如果为空，直接中断登陆)
		send( resp, {
			version : null,
			appweb:config.APP_WEB,
		});
		return;
	}
	if( req.query.version == '0' )
	{
		//特殊处理，浏览器调试使用
		send( resp, {
			version:config.VERSION,
			hall:hallAddr,
			appweb:config.APP_WEB,
		});
		return;
	}
	let path = __dirname + '/../../version.json';
	if( !fs.existsSync( path ) ) 
	{
		//文件不存在
		send( resp, {
			version : null,
			appweb:config.APP_WEB,
		});
		return;
	}
	let _version = JSON.parse( fs.readFileSync( path ) );
	let client_version = req.query.version.split( '.' );
	let server_version = _version.version.split( '.' );

	if( client_version[ 0 ] != server_version[ 0 ] || client_version[ 1 ] != server_version[ 1 ] )
	{
		//版本不正确
		send( resp, {
			version : null,
			appweb:config.APP_WEB,
		});
		return;
	}
	send( resp, {
		version:config.VERSION,
		hall:hallAddr,
		appweb:config.APP_WEB,
	});
};

AccServer.guest = function( req, resp ){

    let account = "guest_" + req.query.account;
	//let sign = Common.md5(account + req.ip + config.ACCOUNT_PRI_KEY);
	let sign = HotManager.getCommon().md5( account + req.ip + config.ACCOUNT_PRI_KEY );
	let ret = {
		errcode:0,
		errmsg:"ok",
		account:account,
		halladdr:hallAddr,
		sign:sign
	}
	send(res,ret);
};

//获取微信权限
function get_access_token(code,os,callback)
{
	if( !appInfo[os] )
	{
		callback(false,null);
		return;
	}
	const info = appInfo[os];
	const data = {
		appid:info.appid,
		secret:info.secret,
		code:code,
		grant_type:"authorization_code"
	};
	//Api.doSendByGet( "https://api.weixin.qq.com/sns/oauth2/access_token",data,callback );
	HotManager.getApi().doSendByGet( "https://api.weixin.qq.com/sns/oauth2/access_token",data,callback );
	//http.get2("https://api.weixin.qq.com/sns/oauth2/access_token",data,callback,true);
}

function get_state_info(access_token,openid,callback)
{
	const data = {
		access_token:access_token,
		openid:openid
	};
	HotManager.getApi().doSendByGet( "https://api.weixin.qq.com/sns/userinfo",data,callback );
	//Api.doSendByGet( "https://api.weixin.qq.com/sns/userinfo",data,callback );
	//http.get2("https://api.weixin.qq.com/sns/userinfo",data,callback,true);
}

//过滤微信昵称
function _filterStr( str )
{
	str = unescape( escape( str ).replace( /\%uD.{3}/g, '' ) );
	str = str.replace( /[\ud800-\udfff]/g );
	str = str.replace( /'/g, '' );
	str = str.replace( /"/g, '' );
	str = str.replace( /"\"/g, '' );
	return str;
}

//创建角色
function create_user( info, callback )
{
	if( typeof info.name == 'string' )
	{
		info.name = _filterStr( info.name );	//过滤昵称
	}
	if( !info.name ) info.name = ' ';

	//info.name = Common.toBase64( info.name );
	info.name = HotManager.getCommon().toBase64( info.name );
	HotManager.getAccDao().findByAccount( info.account,function( retCode, accInfo ){

		if( retCode <= 1 )
		{
			//异常错误
			callback( { err : -1 } );
			return;
		}
		const _now = HotManager.getCommon().getTime();
		if( retCode == 2 )
		{
			let _insertInfo = {
				account : info.account,
				name : info.name,
				gems : 10,
				system : info.system,
				plat : info.plat,
				headimg : info.headimgurl,
				sex : info.sex,
				phone : '',
				create_time : _now,
				login_time : _now,
				game_id : 0,
				game_room_id : '',
				invite_code : '',
				area_id : ''
			};
			HotManager.getAccDao().create_user( _insertInfo, function( ret ){

				_insertInfo.account_id = ret;
				callback( { err : ret, user : _insertInfo } );
			});
			return;
		}
		const _updateInfo = {

			account : info.account,
			name : info.name,
			headimg : info.headimgurl,
			sex : info.sex,
			login_time : _now
		};
		for( let k in _updateInfo )
		{
			if( accInfo[ k ] ) accInfo[ k ] = _updateInfo[ k ];
		}
		HotManager.getAccDao().update_user_info( accInfo.account_id, _updateInfo, function( ret ){

			callback( { err : 1, user : accInfo } );
		});
	});
}

AccServer.login = function( req, resp ){

    let from = HotManager.getCommon().intval( req.query.from ); 		//登陆来源

	console.log( '=====come here====' );
	console.log( 'login,,', req.query );
	if( from == 0 )
	{
		//win登陆，游客
		let account = req.query.account; 		//游客账号
		if( account == undefined || account == null )
		{
			//异常信息
			send( resp, { errcode: 100, errmsg:"info err." } );
			return;
		}
		guest_login( 'guest_' + account, req.ip, function( retData ){

			send( resp, retData );
		});
		return;
	}
	if( from == 1 )
	{
		//微信登陆
		let code = req.query.code;
		let os = req.query.os;
		if(code == null || code == "" || os == null || os == "")
		{
			send(resp,{errcode:-2,errmsg:"info err."});
			return;
		}
		wx_login( code, os, req.ip, function( retData ){
			
console.log( 'retdata,,', retData );
			send( resp, retData );
		});
		return;
	}
	send( resp, { errcode:100, errmsg:"loginx err." } );
};

//微信登陆
let wx_login = function( code, os, ip, callback ){

	get_access_token(code,os,function(suc,data)
	{
		if( data && ( data.errcode > 0 || !data.access_token || !data.openid ) )
		{
			//微信数据异常错误
			callback( { errcode:data.errcode, errmsg:"info err." } );
			return;
		}
console.log( suc + '=weixin ret,,', data );
		if(suc)
		{
			get_state_info( data.access_token, data.openid, function(suc2,data2)
			{
				if( !suc2 || ( data2 && data2.errcode && data2.errcode > 0 ) )
				{
					//微信数据异常错误
					callback( { errcode:data.errcode, errmsg:"info err2." } );
					return;
				}
				const openid = data2.openid;
				const nickname = data2.nickname;
				const sex = data2.sex;
				const headimgurl = data2.headimgurl;
				const account = "wx_" + openid;

				let _info = {

					account : account,
					name : nickname,
					headimgurl : '',
					system : ( os == 'Android' ? 1 : 2 ),
					plat : 1,
					sex : sex
				};
				_doCreatFunc( _info, callback );
			});
			return;
		}
		callback( { errcode:-1, errmsg:"unkown err." } );
	});
};

//游客登陆
let guest_login = function( name, ip, callback ){

	let _info = {

		account : name,
		name : name,
		headimgurl : '',
		system : 0,
		plat : 0,
		sex : 0
	};
	console.log( 'guest_login,,', _info );
	_doCreatFunc( _info, callback );
};

let _doCreatFunc = function( regInfo, callback )
{
	create_user( regInfo, function( userInfo ){

		console.log( 'info,,', userInfo );
		if( userInfo.err < 0 )
		{
			//注册失败
			callback( { errcode : 100 } );
			return;
		}
		let _user = userInfo.user;
		//const sign = Common.hmac( _user.account_id + secretKey, secretKey );
		const sign = HotManager.getCommon().hmac( _user.account_id + secretKey, secretKey );
		let ret = {
			errcode : 0,
			//halladdr:hallAddr,
			sign:sign,
			userInfo : _user,
			showAuth : _getShowAuth( _user.area_id )
		};
		callback( ret );
	});
};

//获取显示权限
let _getShowAuth = function( auth_id ){

console.log( auth_id + '-showauth,,', global.AUTH );
	if( global.AUTH && global.AUTH[ auth_id ] )
	{
		return global.AUTH[ auth_id ].id;
	}
	return global.AUTH[ '9999' ].id;
};