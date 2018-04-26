"use strict";

let LotteryDao = module.exports;

function nop(a,b,c,d,e,f,g)
{
}

//获取当前所有的彩票
LotteryDao.lottery_config = function( callback ){

    let sql = 'SELECT * FROM `lottery_config`';
    global.CENTER_DB.query( sql, function( err, retList ){

        callback( err, retList );
    });
};

//获取当前所有的购彩用户(按照期号获取)
LotteryDao.getUserByExpect = function( expect, callback ){

    let sql = 'SELECT * FROM user_lottery WHERE expect="' + expect + '"';
    global.CENTER_DB.query( sql, function( err, retList ){

        callback( err, retList );
    });
};

//增加用户购买彩票记录
LotteryDao.addUserLoteryLog = function( data, callback ){

    global.CENTER_DB.inserts( 'user_lottery_log', data, nop );
};

//增加购买彩票记录
LotteryDao.addLoteryLog = function( data, callback ){

    global.CENTER_DB.inserts( 'lottery_log', data, nop );
};

//删除购买记录
LotteryDao.truncate = function(){

    global.CENTER_DB.query( 'truncate table user_lottery', nop );
};

//插入一条最新的期号信息
LotteryDao.lottery_new = function( expect, lottery_code ){

    let sql = 'INSERT INTO lottery (expect,lottery_code) VALUES ("'+ expect +'", "'+ lottery_code + '") ON DUPLICATE KEY UPDATE expect="'+ expect +'",up_time=NOW()';
    global.CENTER_DB.query( sql, nop );
};

//用户购买彩票
LotteryDao.doBuyLottery = function( role_id, data, callback ){

    global.CENTER_DB.startTransaction( ( con ) => {

        con.waterfall( [ 

            function( cb )
            {
                con.select( 'user', 'user_id = ' + role_id, 'golds', cb );
            },
            function( res, cb )
            {
                if( !res || res.length < 1 )
                {
                    //异常信息
                    cb( { errcode : 900 } );
                    return;
                }
                if( res[ 0 ].golds < data.user_gold )
                {
                    //用户没有足够的金币购买
                    cb( { errcode : 500 } );
                    return;
                }
                con.insert( 'user_lottery', data, cb );
            },
            function( res, cb )
            {
               let sql = 'UPDATE user SET golds = golds -' + data.user_gold + ' WHERE user_id = ' + role_id;
               con.query( sql, cb );
            },
            function( res, cb )
            {
                con.commit( cb );
            },
        ], function( err, res ){

            if( err )
            {
                //失败，数据回滚
                con.rollback();
                callback( err, 0 );
                //记录错误log
                //logger.error( err );
                return;
            }
            callback( null, 1 );
        });
    });
};

//获得用户购买彩票记录
LotteryDao.getUserLoteryLog = function( role_id, id, callback ){

    let sql = 'select * from user_lottery_log where user_id=' + role_id;
    if( id > 0 ) sql += ' and id<' + id;

    sql += ' order by create_time desc limit 10';

    global.CENTER_DB.query( sql, callback );
};