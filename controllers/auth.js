module.exports = function(mongoClient){
  var express = require("express");
  var router = express.Router();
  var saltRounds = 10;
  const bcrypt = require('bcrypt');
  var superSecretSecret = "rateItIsAnAwesomeApplication";

  router.post("/login", function(req, response){
    mongoClient.connect("mongodb://localhost:27017/users", function(err, db){
      if(err) throw err;
      var dbo = db.db("users");
      dbo.createCollection("users", function(err, res){
        dbo.collection("users").findOne({email:req.body.email}, function(err, results){
          if(err) throw err;
          console.log("found a user");
          db.close();
          bcrypt.compare(req.body.password, results.hashedPassword).then(function(res){
            if(res){
              console.log("passwords match");
            } else {
              console.log("passwords don't match")
            }
          })
          // create a jwt token and send it back;
          response.json({
            "username":req.body.email,
            "password":req.body.password
          });
        });
      });
    });
  });

  router.post("/signup", function(req, response){
    var password = req.body.password;
    bcrypt.genSalt(saltRounds, function(err, salt){
      bcrypt.hash(password, salt, function(err, hash){
        var signUpUser = {
          email:req.body.email,
          userName:req.body.userName,
          hashedPassword:hash
        }
        mongoClient.connect("mongodb://localhost:27017/users", function(err, db){
          if(err) throw err;
          var dbo = db.db("users");
          dbo.createCollection("users", function(err, res){
            dbo.collection("users").insertOne(signUpUser, function(err, res){
              if(err) throw err;
              console.log("inserted document");
              db.close();
              console.log(req.body);
              // create a jwt token and send it back;
              response.json({
                "username":req.body.userName,
                "password":req.body.password
              });
            });
          });
        });
      });
    });
  });
  return router;
}