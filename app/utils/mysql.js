"use strict";

let mysql = require( 'mysql' );
let async = require( 'async' );

//type  'logic' | 'log'
let DB = function( conf, limit ) {
	this.pool = null;
	this.conf = conf;
	console.log( this.conf );
	this.init( limit );
};

module.exports = DB;

DB.prototype.init = function( limit ) {
	this.pool = mysql.createPool({
		host : this.conf.HOST,
		port : this.conf.PORT,
		user : this.conf.USER,
		password : this.conf.PSWD,
		database : this.conf.DB,
		//queryFormat : queryFormat,
		connectionLimit : limit
	});
};

//------normal 方法 start
function insertSQL( tablename, data ) 
{
	let tname = [];
	let tval = [];
	for( let key in data ) 
	{
		tname.push( key );
		tval.push( "'" + data[key] + "'" );
	}
	return 'INSERT INTO ' + tablename + ' (' + tname.join( ',' ) + ') VALUES (' + tval.join( ',' ) + ')';
}

function insertsSQL( tablename, data )
{
	if( data.constructor != Array ) data = [ data ];

	let tname = [];
	let tval = [];
	let tmp = [];
	for( let i = 0; i < data.length; i ++ ) 
	{
		tmp = [];
		for( let key in data[ i ] ) 
		{
			if( i === 0 ) tname.push( key );
			
			tmp.push( "'" + data[ i ][ key ] + "'" );
		}
		tval.push( '(' + tmp.join( ',' ) + ')' );
	}
	tmp = null;
	return 'INSERT INTO ' + tablename + ' (' + tname.join( ',' ) + ') VALUES ' + tval.join( ',' );
}

function updateSQL( tablename, data, where ) 
{
	let setdata = [];
	for( let key in data ) 
	{
		if( typeof data[ key ] != 'function' ) 
		{
			//特殊处理与这种sql:  set key = key + 1
			if( typeof data[ key ] === 'string' && data[ key ].indexOf( key ) === 0 ) 
			{
				setdata.push( key + ' = ' + data[ key ] );
				continue;
			}
			setdata.push( key +" = '" + data[ key ] + "'" );
		}
	}
	return 'UPDATE ' + tablename + ' SET ' + setdata.join(',') + ' WHERE ' + where + ';';
}

function deleteSQL( tablename, where ) 
{
	return 'DELETE FROM '+ tablename +' WHERE '+ where +';';
};

function selectSQL( tablename, where, row ) 
{
	return 'SELECT ' + row + ' FROM ' + tablename + ' WHERE ' + where + ';';
}
//------normal 方法 end

//过滤数据，防止sql注入
function escape( val )
{
	return mysql.escape( val );
}

/**
 * Desc: 数据库Query的格式化。注意，自定义的只有三个参数。
 * @param sql
 * @param values
 * @param timeZone
 * @returns {*}
 */
function queryFormat (sql, values, timeZone) 
{
    if(sql.search(/\:(\w+)/) >= 0)
	{
        return sql.replace(/\:(\w+)/g, function (txt, key) {
            if (values.hasOwnProperty(key)) return this.escape(values[key]);
            return txt;
        }.bind(this));
    }
    return mysql.format(sql, values, false, timeZone);
}

DB.prototype.escape = escape;

//单条sql执行方法
DB.prototype.query = function( sql, args ) {
	
	if( !sql )
	{
		args( { 'error': 'no sql' + sql }, null );
		return;
	}
	this.pool.getConnection(function( err, connection ) {

		if( err ) {
			args( err, null );
			return;
		}
		connection.query( sql, function( err, res ) {
			if( err ) console.log( 'err-sql='+ sql );
			args( err, res );
			connection.release();
		});
	});
};

//插入数据
DB.prototype.insert = function( tablename, data, args ) {
	if( typeof data === 'function' ) {
		this.query( tablename, data );
		return;
	}
	let sql = insertSQL( tablename, data );
	this.query( sql, function( err, res ) {
		if( !err && res[ 'affectedRows' ] == 0 ) {
			err = { 'err' : 'insert响应条数为0' };
		}
		args( err, res );
	});
};

//插入数据
DB.prototype.inserts = function( tablename, data, args ) {
	if( typeof data === 'function' ) {
		this.query( tablename, data );
		return;
	}
	let sql = insertsSQL( tablename, data );
	this.query( sql, function( err, res ) {
		if( !err && res[ 'affectedRows' ] == 0 ) {
			err = { 'err' : 'insert响应条数为0' };
		}
		args( err, res );
	});
};

//更新
DB.prototype.update = function( tablename, data, where, args ) {
	if( typeof data === 'function' ) {
		this.query( tablename, data );
		return;
	}
	let sql = updateSQL( tablename, data, where );
	console.log( 'update->' + sql );
	this.query( sql ,function ( err, res) {
		if( !err && res[ 'affectedRows' ] == 0 ) {
			err = 'update响应条数为0';
		}
		args( err, res );
	});
};

//删除
DB.prototype.delete = function( tablename, where, args ) {
	if( typeof where === 'function' ) {
		this.query( tablename, where );
		return;
	}
	let sql = deleteSQL( tablename, where );
	this.query( sql, function( err, res ) {
		args( err, res );
	});
};

//查询
DB.prototype.select = function( tablename, where, row, args ) {
	if( typeof where === 'function' ) {
		this.query( tablename, where );
		return;
	}
	if( typeof row === 'function' ) {
		args = row;
		row = '*';
	}
	let sql = selectSQL( tablename, where, row );
	this.query( sql, function( err, res ) {
		args( err, res );
	});
};

//事务
DB.prototype.startTransaction = function( callback ) {
	this.pool.getConnection(function( err, con ) {
		if( err ) {
			logger.error( 'function-startTransaction : ', err );
		}
		let rescon = {
			'end': function() {
				con.release();
			},
			'rollback': function() {
				con.rollback(function( err ){
					if( err ) {
						logger.error( 'function-startTransaction-rollback : ', err );
					}
				});
				con.release();
			},
			'commit': function( args ) {
				con.commit( function( err ) {
					if( err ) {
						args( err );
					}
					else {
						args( null );
						con.release();
					}
				});
			},
			'insert': function( tablename, data, args ) {
				if( typeof data === 'function' ) {
					this.query( tablename, data );
					return;
				}
				let sql = insertSQL( tablename, data );
				this.query( sql, function( err, res ) {
					if( !err && res['affectedRows'] == 0 ) {
						err = {'err':'insert响应条数为0'}
					}
					args( err, res );
				});
			},
			'inserts': function( tablename, data, args ) {
				if( typeof data === 'function' ) {
					this.query( tablename, data );
					return;
				}
				let sql = insertsSQL( tablename, data );
				this.query( sql, function( err, res ) {
					if( !err && res['affectedRows'] == 0 ) {
						err = {'err':'insert响应条数为0'}
						console.log( 'sql err inserts=' + sql );
					}
					args( err, res );
				});
			},
			'update': function( tablename, data, where, args ) {
				if( typeof data === 'function' ) {
					this.query( tablename, data );
					return;
				}
				let sql = updateSQL( tablename, data, where );
				this.query( sql, function( err, res ) {
					if( !err && res['affectedRows'] == 0 ) {
						err = 'update响应条数为0';
					}
					args( err, res );
				});
			},
			'delete': function( tablename, where, args ) {
				if( typeof where === 'function' ) {
					this.query( tablename, where );
					return;
				}
				let sql = deleteSQL( tablename, where );
				this.query(sql, function( err, res ) {
					if( !err && res['affectedRows'] == 0 ) {
						err = { 'err' : 'delete响应条数为0' };
					}
					args(err,res);
				});
			},
			'select': function( tablename, where, row, args ) {
				if( typeof where === 'function' ) {
					this.query( tablename, where );
					return;
				}
				if( typeof row === 'function' ) {
					args = row;
					row = '*';
				}
				let sql = selectSQL( tablename, where, row );
				this.query( sql, args );
			},
			'query': function( sql, args ) {
				con.query( sql, function( err, results ) {
					args( err, results );
				});
			},
			'waterfall': function( func_array, cb ) {
				func_array.unshift(
					function( cb ) {
						con.beginTransaction( function( err ) {
							if( err ) {
								cb( err );
								return;
							}
							cb( null );
						});
					}
				);
				async.waterfall( func_array, cb );
			}
		};
		callback( rescon );
	});
};