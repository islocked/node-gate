"use strict";

const REDIS = require( 'redis' );
const API = [ 'lpush', 'rpush', 'lpop', 'rpop' ];

let RedisLib = function( options ){

    this.options = options;
    this.client = null;
    this.init( options );
};

RedisLib.prototype.init = function( options ){

    //{ db : 1, password : 'sxfewre }
    this.client = REDIS.createClient( '6379', '123.206.185.202', { db : options.db } );

    this.client.on('ready', ( err ) => {
        console.log('redis ready');

        //this.client.select( 1, () => {} );
    });
    this.client.on('error', ( err ) => {
        this.client = null;
        console.log('redis start error!!!', this.options );
    });
};

RedisLib.prototype.lpush = function( scheme, val, callback ){

    if( this.client )
    {
        this.client.lpush( scheme, val, ( err, replies ) => {

            console.log( 'err,,', err );
            console.log( 'replies,,', replies );
            callback( null, replies );
        });
        return;
    }
    callback( null, 0 );
};

RedisLib.prototype.rpop = function( scheme, callback ){

    if( this.client )
    {
        this.client.rpop( scheme, ( err, retVal ) => {

            console.log( 'err,,', err );
            console.log( 'retVal,,', retVal );
            callback( null, retVal );
        });
        return;
    }
    callback( null, 0 );
};

/**
 * 阻塞获取数据，如果timeout为0，会一直等待
 * @param {*} scheme        //key名 
 * @param {*} timeout       //阻塞超时
 * @param {*} callback      //回掉
 */
RedisLib.prototype.lrpop = function( scheme, timeout, callback ){

    if( this.client )
    {
        this.client.lrpop( scheme, timeout, ( err, retVal ) => {

            console.log( 'err,,', err );
            console.log( 'retVal,,', retVal );
            callback( null, retVal );
        });
        return;
    }
    callback( null, null );
};

/**
 * 阻塞获取数据，如果timeout为0，会一直等待
 * @param {*} scheme        //key名 
 * @param {*} timeout       //阻塞超时
 * @param {*} callback      //回掉
 */
RedisLib.prototype.brpop = function( scheme, timeout, callback ){

    if( this.client )
    {
        this.client.brpop( scheme, timeout, ( err, retVal ) => {

            console.log( 'err,,', err );
            console.log( 'retVal,,', retVal );
            callback( null, retVal );
        });
        return;
    }
    callback( null, null );
};

//publish频道
RedisLib.prototype.publish = function( sub_name ){

    this.client.publish( sub_name, 1, ()=>{} );
};

//订阅一个频道
RedisLib.prototype.subscribe = function( sub_name, callback ){

    this.client.subscribe( sub_name );  
    this.client.on('subscribe',  
        (channel,count) => {  
            console.log("channel:" + channel + ", count:"+count);  
        }  
    );  
    this.client.on('message',  
        (channel,message) => {  
            //console.log("channel:" + channel + ", msg:"+message);  
            callback( channel, message );
        }  
    );  
    this.client.on('unsubscribe',  
        (channel,count) => {  
            console.log("channel:" + channel + ", count:"+count);  
        }  
    );  
};

RedisLib.prototype.disconnect = function(){

    this.client.quit();
    this.client = null;
};

module.exports = RedisLib;