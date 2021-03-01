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

exports.roundOff = (num, places) => {
    const x = Math.pow(10,places);
    return Math.round(num * x) / x;
}

exports.absoluteHorizontal = (higher, lower) => {
    return higher-lower;
}

exports.procentageHorizontal = (higher, lower) => {
    if(higher===0 && lower===0) return 0;
    return ((higher-lower)/lower)*100;
}

exports.verticalProcentageCalc = (entryLine, entryTotal) => {
    if(entryLine===0) return 0;
    return (entryLine/entryTotal)*100;
}
