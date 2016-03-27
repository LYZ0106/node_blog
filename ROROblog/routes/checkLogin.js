/**
 * Created by Administrator on 16-2-10.
 */
exports.checkNotLogin = function(req, res, next){
    if(req.session.user){
        return res.render('feedback', {
            user: req.session.user,
            errinfo: "你已经登录啦，需注销后才能操作 (o'.'o)"
        });
    }
    next();
};

exports.checkIsLogin = function(req, res, next){
    if(!req.session.user){
        return res.render('feedback', {
            user: null,
            errinfo: "你还未登录呢！快去登录吧(o'.'o)"
        });
    }
    next();
};
