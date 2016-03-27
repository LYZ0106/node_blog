/**
 * Created by Administrator on 2016/2/11.
 */
var check = require('./checkLogin');
var dbModel = require('../models/dbModel');
var articleModel = dbModel.articleModel;

/* GET articles listing. */
function router(app) {
    //get publish article page
    app.get('/publish.do', check.checkIsLogin);
    app.get('/publish.do', function (req, res, next) {
        res.render('publish', {
            user: req.session.user
        });
    });

    //publish an new article
    app.post('/publish.do', check.checkIsLogin);
    app.post('/publish.do', function(req, res, next) {
        var tags = [req.body.articleTag1, req.body.articleTag2, req.body.articleTag3],
            date = new Date(),
            time = {
                date: date,
                year: date.getFullYear(),
                month: date.getFullYear()+'-'+(date.getMonth()+1),
                day: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
                minute: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
                        +" "+date.getHours()+":"
                        +(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
            };
        var article = new articleModel({
            title: req.body.articleTitle,
            author: req.session.user.userName,
            content: req.body.articleText,
            tags: tags,
            createTime: time
        });

        article.save(function (err, article) {
            if(err) {
                console.log(err);
                return res.render('publish', {
                    user: req.session.user,
                    errinfo: '提交失败'
                });
            }
            res.render('feedback', {
                user: req.session.user,
                type: 'publish',
                errinfo: null,
                successinfo: '文章已成功提交！'
            });
        });
    });

    //find articles by author
    app.get('/u/:author', function(req, res, next) {
        var curPage = req.query.curPage ? parseInt(req.query.curPage) : 1;
        var condition = {
            'author': req.params.author
        };

        articleModel.count(condition, function(err, count) {
            if(err) {
                console.log(err);
                return res.render('index', {
                    user: req.session.user,
                    errinfo: 'count err!'
                });
            }
            articleModel.find(condition, null, {
                skip: (curPage-1)*5,
                limit: 5
            }, function (err, articles) {
                if(err) {
                    console.log(err);
                    return res.render('index', {
                        user: req.session.user,
                        errinfo: 'find err!'
                    });
                }
                res.render('index', {
                    user: req.session.user,
                    curPage: curPage,
                    articles: articles,
                    isFirstPage: curPage-1 === 0,
                    isLastPage: (curPage-1)*5+articles.length === count
                });
            });
        });
    });

    //show an article
    app.get('/u/:author/:day/:title', function(req, res) {
        var conditions = {
            'title': req.params.title,
            'author': req.params.author,
            'createTime.day': req.params.day
        };
        articleModel.findOne(conditions, function(err, article) {
            if(err) {
                console.log(err);
                return res.send('find article err!');
            }
            if(article) {
                articleModel.update(conditions, {$inc: {"pv": 1}}, function(err) {
                    if(err) {
                        console.log(err);
                        return res.send('update article pv fail!');
                    }
                    res.render('article', {
                        user: req.session.user,
                        article: article
                    });
                });
            }
            else {
                res.send('find article null!');
            }
        });
    });

    //edit an article
    app.get('/edit/:name/:day/:title', check.checkIsLogin);
    app.get('/edit/:name/:day/:title', function(req, res) {
        var conditions = {
            'title': req.params.title,
            'author': req.params.name,
            'createTime.day': req.params.day
        };
        articleModel.findOne(conditions, function(err, article) {
            if(err) {
                console.log(err);
                return res.send('find article err!');
            }
            if(article) {
                res.render('edit', {
                    user: req.session.user,
                    article: article
                });
            }
            else {
                res.send('find article null!');
            }
        });
    });

    //article edit and submit
    app.post('/edit/:name/:day/:title', check.checkIsLogin);
    app.post('/edit/:name/:day/:title', function(req, res) {
        var tags = [req.body.articleTag1, req.body.articleTag2, req.body.articleTag3],
            date = new Date(),
            time = {
                date: date,
                year: date.getFullYear(),
                month: date.getFullYear()+'-'+(date.getMonth()+1),
                day: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
                minute: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
                +" "+date.getHours()+":"
                +(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
            };
        var conditions = {
            'title': req.params.title,
            'author': req.params.name,
            'createTime.day': req.params.day
        };
        var update = {
            title: req.body.articleTitle,
            content: req.body.articleText,
            tags: tags,
            createTime: time
        };

        articleModel.findOneAndUpdate(conditions, update, function(err) {
            if(err) {
                console.log(err);
                return res.send('更新文章失败！');
            }
            res.render('feedback', {
                user: req.session.user,
                type: 'publish',
                errinfo: null,
                successinfo: '文章已成功修改！'
            });
        });
    });

    //remove an article
    app.get('/remove/:name/:day/:title', check.checkIsLogin);
    app.get('/remove/:name/:day/:title', function(req, res) {
        var conditions = {
            'title': req.params.title,
            'author': req.params.name,
            'createTime.day': req.params.day
        };
        articleModel.findOne(conditions, function(err, article) {
            if(err) {
                console.log(err);
                return res.send('remove find article fail.');
            }
            if (article.reprintInfo) {
                if(article.reprintInfo.reprintFrom) {
                    var reprint_from = article.reprintInfo.reprintFrom;
                    articleModel.findOneAndUpdate({
                        'title': reprint_from.title,
                        'author': reprint_from.author,
                        'createTime.day': reprint_from.day
                    }, {
                        $pull: {
                            'reprintInfo.reprintTo': {
                                'title': article.title,
                                'author': article.author,
                                'day': article.createTime.day
                            }
                        }
                    }, function(err) {
                        if(err) {
                            console.log(err);
                            return res.send('remove article update reprint_from data fail.');
                        }
                    });
                }
            }
        });
        articleModel.findOneAndRemove(conditions, function(err) {
            if(err) {
                console.log(err);
                return res.send('删除该文章失败！');
            }
            res.render('feedback', {
                user: req.session.user,
                type: 'publish',
                errinfo: null,
                successinfo: '已删除该文章！'
            });
        });
    });

    //add an article comment
    app.post('/comment/:name/:day/:title', check.checkIsLogin);
    app.post('/comment/:name/:day/:title', function(req, res) {
        var conditions = {
            'title': req.params.title,
            'author': req.params.name,
            'createTime.day': req.params.day
        };
        var date = new Date();
        var comment = {
            headIcon: '/images/owl.png',
            reviewer: req.body.commUser,
            email: req.body.email,
            website: req.body.website,
            content: req.body.commCon,
            createTime: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
            +" "+date.getHours()+":"
            +(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
        };
        articleModel.findOneAndUpdate(conditions, {
            $push:{'comments': comment}
        }, {'new': true}, function(err, article) {
            if(err) {
                console.log(err);
                return res.send('提交评论失败！');
            }
            res.render('article', {
                user: req.session.user,
                article: article,
                type: 'publish',
                errinfo: null,
                successinfo: '已提交该评论！'
            });
        });
    });

    //remove an article comment
    app.get('/rm-comment/:name/:day/:title/:comAuthor/:comTime', check.checkIsLogin);
    app.get('/rm-comment/:name/:day/:title/:comAuthor/:comTime', function (req, res) {
        var conditions = {
            'title': req.params.title,
            'author': req.params.name,
            'createTime.day': req.params.day
        };
        var update = {$pull: {'comments':{
            reviewer: req.params.comAuthor,
            createTime: req.params.comTime
        }}};
        articleModel.findOneAndUpdate(conditions, update, {'new': true}, function(err, article) {
            if(err) {
                console.log(err);
                return res.send('删除评论失败！');
            }
            res.render('article', {
                user: req.session.user,
                article: article,
                type: 'publish',
                errinfo: null,
                successinfo: '已删除该评论！'
            });
        });
    });

    //reprint an article
    app.get('/reprint/:name/:day/:title', function(req, res) {
        //find reprint_from data
        var conditions = {
            'title': req.params.title,
            'author': req.params.name,
            'createTime.day': req.params.day
        };
        articleModel.findOne(conditions, function(err, article) {
            if(err) {
                console.log(err);
                res.send('reprint find article fail.');
            }
            //alter reprint_from copy data
            var newArticle = {},
                date = new Date(),
                time = {
                    date: date,
                    year: date.getFullYear(),
                    month: date.getFullYear()+'-'+(date.getMonth()+1),
                    day: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate(),
                    minute: date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
                    +" "+date.getHours()+":"
                    +(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
                };

            newArticle.title = (article.title.search(/[转载]/) > -1) ? article.title : '[转载]'+article.title;
            newArticle.author = req.session.user.userName;
            newArticle.content = article.content;
            newArticle.pv = 0;
            newArticle.tags = article.tags;
            newArticle.createTime = time;
            newArticle.comments = [];
            newArticle.reprintInfo = {reprintFrom: {
                title: req.params.title,
                author: req.params.name,
                day: req.params.day
            }};

            //add reprint_to key for reprint_from data
            articleModel.findOneAndUpdate(conditions, {
                $push: {'reprintInfo.reprintTo': {
                    title: newArticle.title,
                    author: newArticle.author,
                    day: time.day
                }}
            }, function(err) {
                if(err) {
                    console.log(err);
                    return res.send('reprint_from date update fail.');
                }
            });

            //insert reprint_from copy data to database
            articleModel.create(newArticle, function(err, article) {
                if(err) {
                    console.log(err);
                    return res.send('insert reprint_from data fail.');
                }
                var url = encodeURI('/u/'+article.author+'/'+article.createTime.day+'/'+article.title);
                res.redirect(url);
            });
        });


    });
}

module.exports = router;