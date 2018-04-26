/*
Navicat MySQL Data Transfer

Source Server         : 123.206.185.202
Source Server Version : 50635
Source Host           : 123.206.185.202:3306
Source Database       : ssc

Target Server Type    : MYSQL
Target Server Version : 50635
File Encoding         : 65001

Date: 2018-01-23 03:16:01
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user_id` int(10) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `user_name` varchar(100) NOT NULL DEFAULT '' COMMENT '用户名字',
  `password` varchar(32) NOT NULL DEFAULT '' COMMENT '用户密码',
  `golds` int(10) NOT NULL DEFAULT '0' COMMENT '用户金币',
  `create_time` int(10) NOT NULL DEFAULT '0' COMMENT '创建时间',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1000000 DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of user
-- ----------------------------
