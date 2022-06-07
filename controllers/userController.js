const User = require("../models/user.js");
 
exports.addUser = function (request, response){
    response.render("create.hbs");
};
exports.getUsers = function(request, response){
     
    User.find({}, function(err, allUsers){
  
        if(err) {
            console.log(err);
            return response.sendStatus(400);
        }
        response.render("users.hbs", {
            users: allUsers
        });
    });
};
exports.postUser= function(request, response){
    if(!request.body) return response.sendStatus(400);
    const userName = request.body.name;
    const ChatID=request.body.ChatID;
    const score=request.body.score;
    const user = new User({name: userName, ChatID: ChatID, score:score});
     
    user.save(function(err){
        if(err) return console.log(err);
        response.redirect("/users");
    });
};