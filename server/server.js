setTimeout(function() {

var Hapi = require('hapi'),
	Routes = require('./routes'),
	Db = require('./config/db'),
	bunyan = require('bunyan'),
	mongoStream = require('mongo-writable-stream'),
	Config = process.env.NODE_ENV === undefined ? require('./config/development') : require('./config/' + process.env.NODE_ENV);


var app = {};
	app.config = Config;

var server = new Hapi.Server();

server.connection({ port: app.config.server.port });

server.route(Routes.endpoints);

var plugins = [
	{
		register: require('hapi-locale'),
		options: {
			scan: {
				path: __dirname + "/locales"
			},
			order: ['headers'],
			header: 'accept-language'
		}
	},
	{
		register: require('joi18n')
	},
	{
		register: require( "hapi-i18n" ),
		options: {
			locales: ["pt_BR", "en_US"],
			directory: __dirname + "/locales",
			languageHeaderField: "accept-language"
		}
	},
	{
		register: require('hapi-bunyan'),
		options: {
			logger: bunyan.createLogger({
				name: 'ServerLogger',
				level: 'debug',
				stream: new mongoStream({
					url: 'mongodb://mongo/umaflex-log',
					collection: 'hapi'
				})
			}),
			includeTags: true
		}
	}
];

server.register(plugins, function ( err ){
	if ( err ){
		console.log( err );
	}
});

server.start(function () {
	console.log('Server started ', server.info.uri);
});

module.exports = server;
}, 10000);