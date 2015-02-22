Ext.Loader.setConfig ({
    enabled : true,
    disableCaching : false,
    paths : {
        GeoExt : "{{ STATIC_URL}}virtualkenya/geoext/src/GeoExt",
        Ext : "{{ STATIC_URL}}virtualkenya/extjs/src"
    }
});