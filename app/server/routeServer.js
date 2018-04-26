"use strict";

let HotManager = require( '../hotwork/hotManager.js' );

let Route = module.exports;

//入口方法
Route.init = function( route_code, req, resp )
{
    //let _route = HotManager.getRouteCfgServer().getRoute( route_code );
    console.log( 'HotManager.getMode,,', HotManager.getMode( 'routeConfigServer' ) );
    let _route = HotManager.getMode( 'routeConfigServer' ).getRoute( route_code );
    if( !_route )
    {
        //未知的路由信息
        HotManager.getApi().send( resp, 1000, '', {} );
        return;
    }
    //if( !HotManager[ _route[ 0 ] ] || !HotManager[ _route[ 0 ] ]()[ _route[ 1 ] ] )
    if( !HotManager.getMode( _route[ 0 ] ) || !HotManager.getMode( _route[ 0 ] )[ _route[ 1 ] ] )
    {
        //异常信息(消息id不存在)
		HotManager.getApi().send( resp, 900, '', {} );
		return;
    }
    //HotManager[ _route[ 0 ] ]()[ _route[ 1 ] ]( req, resp );
    HotManager.getMode( _route[ 0 ] )[ _route[ 1 ] ]( req, resp );
};
