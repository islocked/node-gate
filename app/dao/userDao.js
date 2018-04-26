"use strict";

let userDao = module.exports;

function nop(a,b,c,d,e,f,g)
{
}

function setCallback( callback )
{
    return typeof callback !== 'function' ? nop : callback;
}

//查询用户信息
userDao.findAccount = function( user_id, callback )
{
    callback = setCallback( callback );
    if( !user_id )
    {
        callback( null );
        return;
    }
    const sql = 'SELECT * FROM user WHERE user_id=' + user_id;
    
    global.CENTER_DB.query( sql, function(err, rows, fields) {

        if( err )
        {
            callback( null );
            return;
        }
        if( rows.length < 1 )
        {
            callback( null );
            return;
        }
        callback( rows[ 0 ] );
    });
};

//根据账号查询账号是否存在
userDao.findByName = function( name, callback )
{
    callback = setCallback( callback );
    if( !account )
    {
        callback( 0, null );
        return;
    }
    const sql = 'SELECT * FROM user WHERE name=' + global.CENTER_DB.escape( name );
    global.CENTER_DB.query( sql, function(err, rows, fields) {

        if( err )
        {
            console.log( 'findByAccount,,', err );
            callback( 1, null );
            return;
        }
        if( rows.length == 0 )
        {
            callback( 2, null );
            return;
        }
        callback( 3, rows[ 0 ] );
    });  
};

//根据账号查询账号是否存在
userDao.is_user_exist = function( account, callback )
{
    callback = setCallback( callback );
    if( !account )
    {
        callback( -3 );
        return;
    }
    const sql = 'SELECT account_id FROM user WHERE name=' + global.CENTER_DB.escape( account );
    global.CENTER_DB.query( sql, function(err, rows, fields) {

        if( err )
        {
            callback( -2 );
            return;
        }
        if( rows.length == 0 )
        {
            callback( -1 );
            return;
        }
        callback( rows[ 0 ].account_id );
    });  
};

//创建一个新账号
userDao.create_user = function( userInfo, callback ){

    callback = setCallback( callback );
    if( !userInfo )
    {
        callback( -1 );
        return;
    }
    global.CENTER_DB.insert( 'user', userInfo, function( err, rows, fields ) {
        if (err) 
        {
            console.log( 'create_user err,,', err );
            callback( -1 );
            return;
        }
        callback( rows.insertId );
    });
};

userDao.update_user_info = function( user_id, updateInfo, callback ){

    callback = setCallback( callback );
    if( user_id == null )
    {
        callback( -1 );
        return;
    }
    console.log( 'update_user_info,,', updateInfo );
    global.CENTER_DB.update( 'user', updateInfo, 'user_id=' + user_id, function( err, rows, fields ) {
        if (err) 
        {
            console.log( 'create_user err', err );
            callback( -1 );
            return;
        }
        callback( user_id );
    });
};