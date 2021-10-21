var PROPERTIES = require('./mock-properties').data,
    favorites = PROPERTIES;

function findAll(req, res, next) {
    return res.json(PROPERTIES);

};

function findById(req, res, next) {
    var id = req.params.id;
    res.json(PROPERTIES[id - 1]);
}

function getFavorites(req, res, next) {
    res.json(favorites);
}

function favorite(req, res, next) {
    var property = req.body;
    var exists = false;
    for (var i = 0; i < favorites.length; i++) {
        if (favorites[i].id === property.id) {
            exists = true;
            break;
        }
    }
    if (!exists) favorites.push(property);
    res.send("success")
}

function unfavorite(req, res, next) {
    var id = req.params.id;
    for (var i = 0; i < favorites.length; i++) {
        if (favorites[i].id == id) {
            favorites.splice(i, 1);
            break;
        }
    }
    res.json(favorites)
}

function like(req, res, next) {
    var property = req.body;
    PROPERTIES[property.id - 1].likes++;
    //res.json(PROPERTIES[property.id - 1].likes);
    console.log("like");
    res.json(PROPERTIES[0].likes);
}

function test(req,res,next){
const used = process.memoryUsage();
for (let key in used) {
	  console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
}
    res.send("success")
    //res.json(PROPERTIES[0].likes);
}

exports.findAll = findAll;
exports.findById = findById;
exports.getFavorites = getFavorites;
exports.favorite = favorite;
exports.unfavorite = unfavorite;
exports.like = like;
exports.test = test;
