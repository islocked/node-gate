"use strict";

let HotManager = require( '../hotwork/hotManager.js' );

let Index = module.exports;

Index.rlpush = ( req, resp ) => {

    global.REDIS.lpush( 't_list', [ JSON.stringify( { 't' :1 } ), JSON.stringify( { 't' :2 } ) ], ( err, retCode ) => {

        HotManager.getApi().send( resp, 0, '', { code : retCode } );
    });
};

Index.rrpop = ( req, resp ) => {

    global.REDIS.rpop( 't_list', ( err, retCode ) => {

        HotManager.getApi().send( resp, 0, '', { code : retCode } );
    });
};

setTimeout( () => {

    
    // global.REDIS.brpop( 't_list', ( err, retCode ) => {

    //     console.log( 'retval--->', retCode );
    // });
    dobrpop();

}, 3000 );

function dobrpop()
{
    global.REDIS.brpop( 't_list', 0, ( err, retCode ) => {

        console.log( 'retval--->', retCode );
        dobrpop();
    });
}
