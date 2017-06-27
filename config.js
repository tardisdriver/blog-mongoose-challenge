exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://tardisdriver:Temple45evil@ds139362.mlab.com:39362/blog-challenge';
exports.PORT = process.env.PORT || 8080;