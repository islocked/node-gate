"use strict";

let HotManager = require( '../hotwork/hotManager.js' );

let User = module.exports;

//查询用户
User.getUser = function( req, resp ){

    let name = req.query.name;      //用户名字

    HotManager.getUserDao().findByName( name, ( retCode, userInfo ) => {

        HotManager.getApi().send( resp, 0, '', { user : userInfo } );
    });
};

//修改用户信息
User.modifyUser = function( req, resp ){

    let info = req.body;
    let user_id = info.user_id;      //角色名字
    delete info.user_id;
    if( HotManager.getCommon().empty( info ) )
    {
        HotManager.getApi().send( resp, 900, '', {} );
        return;
    }
    HotManager.getUserDao().update_user_info( user_id, info, ( retCode, userInfo ) => {

        HotManager.getApi().send( resp, 0, '', { user : userInfo } );
    });
};

//新增用户信息
User.createUser = function( req, resp ){

    let info = req.body;
    if( HotManager.getCommon().empty( info ) )
    {
        HotManager.getApi().send( resp, 900, '', {} );
        return;
    }
    let user_id = info.user_id;      //角色id
    HotManager.getUserDao().create_user( user_id, info, ( user_id ) => {

        HotManager.getApi().send( resp, 0, '', { user_id : user_id } );
    });
};

//购买彩票
User.buyLottery = function( req, resp ){

    let info = req.body;
    if( HotManager.getCommon().empty( info ) )
    {
        HotManager.getApi().send( resp, 900, '', {} );
        return;
    }
    let user_id = info.user_id;                 //角色id
    let lottery_code = info.lottery_code;       //彩票类型
    let user_gold = info.user_gold;             //花费了多少钱购买
    let expect = info.expect;                   //期号
    let play_list = info.play_list;             //玩法

    let data = {

        user_id         : role_id,
        code            : code,
        lottery_code    : lottery_code,
        create_time     : HotManager.getMode( 'common' ).getTime(),
        user_gold       : user_gold,
        expect          : expect,
    };
    HotManager.getMode( 'lotteryDao' ).doBuyLottery( user_id, data, ( err, retCode ) => {

        let _code = retCode == 0 ? ( err.errcode ? err.errcode : 900 ) : 200;
        HotManager.getMode( 'api' ).send( resp, _code, '', {} );
    });
};

//查询彩票购买记录
User.userLotteryLogs = function( req, resp ){

    let info = req.body;
    if( HotManager.getCommon().empty( info ) )
    {
        HotManager.getApi().send( resp, 900, '', {} );
        return;
    }
    let user_id = info.user_id;                 //角色id
    let id = info.id;                           //id(0=获取第一页，后面的页数，根据id来获取)

    HotManager.getMode( 'lotteryDao' ).getUserLoteryLog( user_id, id, ( err, retCode ) => {

        HotManager.getMode( 'api' ).send( resp, 0, '', { list : retCode } );
    });
};