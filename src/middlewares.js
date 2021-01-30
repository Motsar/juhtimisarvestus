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
