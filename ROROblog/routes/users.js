
var crypto = require('crypto');
var check = require('./checkLogin');
var dbModel = require('../models/dbModel');
var userModel = dbModel.userModel;

/* GET users listing. */
function router(app){
    //show login page
    app.get('/login.do', check.checkNotLogin);
    app.get('/login.do', function (req, res, next) {
        res.render('login', {
            user: null,
            errinfo: null
        });
    });

    //login handler
    app.post('/login.do', check.checkNotLogin);
    app.post('/login.do', function (req, res, next) {
        var md5 = crypto.createHash('md5'),
            password_md5 = md5.update(req.body.password).digest('hex');
        // findOne 返回首先找到的单个文档,
        userModel.findOne({userName: req.body.username}, function (err, user) {
            if(err){
                console.log('err: ', err);
                return res.render('login', {
                    user: null,
                    errinfo: 'query err!'
                });
            }
            if((!user) || (user.password!=password_md5)){
                return res.render('login', {
                    user: null,
                    errinfo:'用户名或密码错误!'
                });
            }
            req.session.user = user;
            res.redirect('/');
        });
    });

    //show register page
    app.get('/register.do', check.checkNotLogin);
    app.get('/register.do', function (req, res, next) {
        res.render('register', {
            user: null,
            errinfo: null
        });
    });

    //register Handler
    app.post('/register.do', check.checkNotLogin);
    app.post('/register.do', function (req, res, next) {
        //console.log("username:"+req.body.username);
        //console.log("password:"+req.body.password);
        var username = req.body.username,
            md5 = crypto.createHash('md5'),
            passwd_md5 = md5.update(req.body.password).digest('hex');

        var user = new userModel({
            userName: username,
            password: passwd_md5
        });
        user.save(function (err, user) {
           if(err){
               console.log(err);
               return res.render('register',{
                   user: null,
                   errinfo: '注册失败 =='
               });
           }
           res.render('feedback',{
               user: null,
               type: 'signup',
               errinfo: null,
               sucessinfo: '你注册成功啦！(=^ ^=)'
           });
        });
    });

    //get user info page
    app.get('/setinfo.do', check.checkIsLogin);
    app.get('/setinfo.do', function (req, res, next) {
        res.render('setinfo', {
            user: req.session.user
        });
    });

    //commit new user info
    app.post('/setinfo.do', check.checkIsLogin);
    app.post('/setinfo.do', function(req, res, next) {
        var usrInfo = {
            nickName: req.body.nickName,
            userTitle: req.body.usrTitle,
            profile: req.body.profile,
            eMail: req.body.eMail
        };
        userModel.findByIdAndUpdate(req.session.user._id, {$set: usrInfo}, {'new': true}, function(err, user) {
            if(err){
                console.log('err: ', err);
                return res.render('setinfo', {
                    user: req.session.user,
                    errinfo: 'update err!'
                });
            }
            req.session.user = user;
            res.render('feedback',{
                user: req.session.user,
                type: 'setinfo',
                errinfo: null,
                sucessinfo: '你设置成功啦！(=^ ^=)'
            });
        });
    });

    //logout Handler
    app.get('/logout.do', check.checkIsLogin);
    app.get('/logout.do', function (req, res, next) {
        req.session.user = null;
        /*当前目录是“/”，从根目录重定向到“/”。window.location没有变，所以没有刷新*/
        res.redirect('/');
    });

    //findByName Ajax Handler
    app.get('/findByName.do', function (req, res, next) {
        var name = req.query.name;
        userModel.findOne({userName: name}, function (err, user) {
            if (err){
                console.log("err:", err);
                return res.send(err);
            }
            res.send(user);
        });
    });

}

module.exports = router;
