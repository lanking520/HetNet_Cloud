var restful = require('node-restful'); //convert mongo object to rest-api

module.exports = function(app,route){
    //Setup for RESt.
    var rest =restful.model(
    'system',
    app.models.system
    ).methods(['get','post','put','delete']).before('get', function(req,res,next){
        var obj = req.query
        if(obj['Email']== undefined)
        {
            res.status(500).jsonp({ error: 'Bad Input' });
        }
        else
        {
            next();
        }
        });
    // Register this end with the app
    rest.register(app, route);

    //Return middleware
    return function(req,res,next){
        next();
    };
};