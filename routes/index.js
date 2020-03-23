var express = require('express'),
    fs = require('fs');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.sendFile('/www/regional_map/public/index.htm');
});

router.post('/save/:placeId', function(req, res, next) {
    var placeId = req.params.placeId;
    var places = loadPlaces();

    if (!places[placeId]) {
        return res.send({
            success: false,
            error: 'Invalid Id'
        });
    }

    var place = places[placeId];

    for (var key in req.body) {
        if (key.match(/^edit-([a-zA-Z]+)-(en|pt)$/)) {
            var field = RegExp.$1;
            var lang = RegExp.$2;

            if (field == 'lat') {
                place.coordinates.lat = req.body[key];
                continue;
            } else if (field == 'long') {
                place.coordinates.long = req.body[key];
                continue;
            }

            if (!place[field]) {
                place[field] = {};
            }

            place[field][lang] = req.body[key];
        } else {
            res.json({
                success: false,
                error: `Invalid key: ${key}`
            });
            return;
        }
    }

    savePlaces(places);

    res.json({
        success: true
    });
});

function loadPlaces() {
    var mapFile = fs.readFileSync('public/map.json');
    return JSON.parse(mapFile);
}

function savePlaces(places) {
    var backupFilename = 'public/map-' + new Date().getTime() + '.json';
    fs.writeFileSync(backupFilename, fs.readFileSync('public/map.json'));
    fs.writeFileSync('public/map.json', JSON.stringify(places, null, 4));
}

module.exports = router;
