exports.auth = function(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}


exports.notAuth = function(req, res, next) {
    if (req.user) {
        res.redirect('/success');
    } else {
        next();
    }
}

exports.apiAuth = function(req, res, next) {
    if(!req.user) return res.status(403).json({error:"you are not signed in"});
    let useridJSON= JSON.parse(req.user);
    req.userId = useridJSON._id;
    next();
}
