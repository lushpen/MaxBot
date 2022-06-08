require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const url = process.env.MONGODB_URI;
//const url = "mongodb://localhost:27017/";

const app = express();
const jsonParser = express.json();

const userScheme = new Schema({ name: String, chatID: Number, HighScore: Number }, { versionKey: false });
const User = mongoose.model("User", userScheme);

app.use(express.static(__dirname + "/public"));
mongoose.connect(url, { dbName: "usersdb", useUnifiedTopology: true }, function (err) {
    if (err) return console.log(err);
    app.listen(process.env.PORT || 3000, function () {
        console.log("Сервер працює...");
    });
});
app.get("/api/users", function (req, res) {

    User.find({}, function (err, users) {
            if (err) return console.log(err);
        res.send(users)
    }).sort({score: -1}).limit(10);
});

app.get("/api/users/:id", function (req, res) {

    const id = req.params.id;
    User.findOne({ _id: id }, function (err, user) {

        if (err) return console.log(err);
        res.send(user);
    });
});

app.post("/api/users", jsonParser, function (req, res) {

    if (!req.body) return res.sendStatus(400);
    const userScore = req.body.score;
    const userName = req.body.name;
    const userChatID = req.body.chatID;
    const user = new User({ name: userName, chatID: userChatID});

    user.save(function (err) {
        if (err) return console.log(err);
        res.send(user);
    });
});

app.delete("/api/users/:id", function (req, res) {

    const id = req.params.id;
    User.findByIdAndDelete(id, function (err, user) {

        if (err) return console.log(err);
        res.send(user);
    });
});

app.put("/api/users", jsonParser, function (req, res) {

    if (!req.body) return res.sendStatus(400);
    const id = req.body.id;
    const userName = req.body.name;
    const userChatID = req.body.chatID;
    const newUser = { chatID: userChatID, name: userName };

    User.findOneAndUpdate({ _id: id }, newUser, { new: true }, function (err, user) {
        if (err) return console.log(err);
        res.send(user);
    });
});
