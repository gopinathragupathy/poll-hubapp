
//db
var mongoose = require('mongoose');
var opts = {
    server: {
       socketOptions: { keepAlive: 1 }
    }
};

/*
mongo: {
    development: {
        connectionString: 'mongodb://dbuser:12xu@ds027345.mongolab.com:27345/mattel_test'
    },
    production: {
        connectionString: 'mongodb://dbuser:12xu@ds027345.mongolab.com:27345/mattel_test'
    }
};


switch(app.get('env')){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, opts);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}
*/


//mongoose.connect('mongodb://dbuser:12xu@ds027345.mongolab.com:27345/mattel_test', opts);

mongoose.connect('mongodb://localhost:27017/mattel_test', opts);


