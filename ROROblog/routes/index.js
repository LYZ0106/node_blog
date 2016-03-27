var usersRouter = require("./users");
var articlesRouter = require("./articles");
var dbModel = require('../models/dbModel');
var articleModel = dbModel.articleModel;

function router(app){
    /* GET home page. */
    app.get('/', function(req, res, next) {
        var curPage = req.query.curPage ? parseInt(req.query.curPage) : 1;
        var condition = {};
        if(req.session.user) {
            //condition.author = req.session.user.userName;
        }
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

    /* GET archive page. */
    app.get('/archive.do', function(req, res, next) {
        articleModel.find({}, {
            'title': 1,
            'author': 1,
            'createTime': 1
        }, function(err, articles) {
            if(err) {
                console.log(err);
                return res.send('find all archive fail.');
            }
            res.render('listinfo', {
                title: '存档',
                user: req.session.user,
                articles: articles
            });
        });
    });

    /* GET tags page. */
    app.get('/tags.do', function(req, res) {
        articleModel.distinct('tags', function(err, tags) {
            if(err) {
                console.log(err);
                return res.send('tags distinct fail.');
            }
            res.render('tags', {
                title: '标签',
                user: req.session.user,
                tags: tags
            });
        });
    });

    app.get('/tags/:tag', function(req, res) {
        var conditions = {
            tags: req.params.tag
        };
        articleModel.find(conditions, {
            'title': 1,
            'createTime': 1,
            'author': 1
        },function(err, articles){
            if(err) {
                console.log(err);
                return res.send('find article by tag is fail.');
            }
            res.render('listinfo', {
                title: req.params.tag,
                user: req.session.user,
                articles: articles
            });
        });
    });

    /* GET search page. */
    app.get('/search.do', function(req, res) {
        res.render('search', {
            title: '搜索',
            user: req.session.user
        });
    });

    /* GET search result */
    app.post('/search.do', function(req, res) {
        var pattern = new RegExp(req.body.content, 'i');
        articleModel.find({
            'title': pattern
        }, {
            'title': 1,
            'author': 1,
            'createTime': 1
        }, function(err, articles) {
            if(err) {
                console.log(err);
                return res.send('search find articles fail.');
            }
            res.render('listinfo', {
                'title': '搜索结果',
                'user': req.session.user,
                'articles': articles
            });
        });
    });

    /* GET links page. */
    app.get('/links.do', function(req, res) {
        res.render('links', {
            title: '友情链接',
            user: req.session.user
        });
    });
    //user router
    usersRouter(app);

    //articles router
    articlesRouter(app);
}


module.exports = router;
