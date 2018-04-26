"use strict";

let HotManager = require( '../hotwork/hotManager.js' );

let RouteCfgServer = module.exports;

const ROUTE_CONFIG = {

    '3000' : [ 'user', 'getUser' ],                                //获取用户信息
    '3001' : [ 'user', 'modifyUser' ],                             //修改用户信息
    '3002' : [ 'user', 'createUser' ],                             //创建新用户
    '3003' : [ 'user', 'buyLottery' ],                             //购买彩票
    '3004' : [ 'user', 'userLotteryLogs' ],                        //获得彩票购买记录
    '1000' : [ 'index', 'rlpush' ],                                 //获得彩票购买记录
    '1001' : [ 'index', 'rrpop' ],                                 //获得彩票购买记录
};

/**
 * 根据路由id获取配置信息 
 */
RouteCfgServer.getRoute = function( route_code ){

    return !ROUTE_CONFIG[ route_code ] ? null : ROUTE_CONFIG[ route_code ];
};