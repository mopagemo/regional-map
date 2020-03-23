const fs = require('fs');
const parseString = require('xml2js').parseString;

var kml = fs.readFileSync(process.argv[2]);
parseString(kml, function(err, result) {
    if (err)
        throw err;

    var places = {};
    var id = 0;

    result.kml.Document[0].Folder.forEach(function(folder) {
        if (!folder.name || !folder.name[0])
            return;
        if (!folder.Placemark)
            return;

        folder.Placemark.forEach(function(placemark) {
            places[id++] = parsePlace(removeSpace(folder.name[0]), placemark);
        });
    });

    console.log(JSON.stringify(places, null, 2));
});

function parsePlace(folderName, place) {
    var longLat = removeSpace(place.Point[0].coordinates[0]).split(',');

    var description = getExtendedData(place, 'Descrição / Description') || getExtendedData(place, 'descrição');
    /*if(!description && place.description)
        description = removeSpace(place.description[0]);*/

    return {
        name: {
            en: place.name[0],
            pt: place.name[0],
        },
        coordinates: {
            lat: longLat[1],
            long: longLat[0],
        },
        logo: {
            url: getExtendedData(place, 'gx_media_links'),
        },
        tags: [
            folderName
        ],
        description: {
            en: description,
            pt: description
        },
        contact: {
            en: getExtendedData(place, 'Contacto / Contact'),
            pt: getExtendedData(place, 'Contacto / Contact'),
        },
        phone: {
            en: getExtendedData(place, 'Telefone / phone number'),
            pt: getExtendedData(place, 'Telefone / phone number'),
        },
        email: {
            en: getExtendedData(place, 'Contacto electrónico / Contact email'),
            pt: getExtendedData(place, 'Contacto electrónico / Contact email'),
        },
        website: {
            en: getExtendedData(place, 'Página Web / Homepage'),
            pt: getExtendedData(place, 'Página Web / Homepage'),
        },
        hosting: {
            en: getExtendedData(place, 'Acolhimento / Hosting'),
            pt: getExtendedData(place, 'Acolhimento / Hosting'),
        },
        means: {
            en: getExtendedData(place, 'Meios de produção / Means'),
            pt: getExtendedData(place, 'Meios de produção / Means'),
        },
        needProducts: {
            en: getExtendedData(place, 'Necessidades - Produtos / NEEDS-products'),
            pt: getExtendedData(place, 'Necessidades - Produtos / NEEDS-products'),
        },
        needServices: {
            en: getExtendedData(place, 'Necessidades - Serviços / NEEDS-services'),
            pt: getExtendedData(place, 'Necessidades - Serviços / NEEDS-services'),
        },
        needTransports: {
            en: getExtendedData(place, 'Necessidades - Transporte / NEEDS-transport'),
            pt: getExtendedData(place, 'Necessidades - Transporte / NEEDS-transport'),
        },
        resourceProducts: {
            en: getExtendedData(place, 'Recursos - Produtos / RESOURCES-products'),
            pt: getExtendedData(place, 'Recursos - Produtos / RESOURCES-products'),
        },
        resourceServices: {
            en: getExtendedData(place, 'Recursos - Serviços / RESOURCES-services'),
            pt: getExtendedData(place, 'Recursos - Serviços / RESOURCES-services'),
        },
        resourceTransports: {
            en: getExtendedData(place, 'Recursos - Transporte / RESOURCES-transport'),
            pt: getExtendedData(place, 'Recursos - Transporte / RESOURCES-transport'),
        },
    };
}

function removeSpace(node) {
    if (!node || !node.replace)
        return;

    //.replace(/\s/g, '')
    return node.replace(/(^\s*)|(\s*$)/g, '');
}

function getExtendedData(node, match) {
    if (!node || !node.ExtendedData)
        return;

    var matchingNode = node.ExtendedData[0].Data.find(function(dataNode) {
        if (!dataNode)
            return false;

        return dataNode.$.name == match;
    });

    if (matchingNode && matchingNode.value) {
        return removeSpace(matchingNode.value[0]);
    }

    return;
}