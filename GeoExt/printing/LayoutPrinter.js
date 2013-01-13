/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace("GeoExt.ux.layout");

GeoExt.ux.layout.LayoutPrinter = function(map, layout) {
    GeoExt.ux.layout.LayoutPrinter.layout = layout;
    GeoExt.ux.layout.LayoutPrinter.map = map;
};

GeoExt.ux.layout.LayoutPrinter.OpenPrint = function() {
    var page = GeoExt.ux.layout.getHtmlPage(GeoExt.ux.layout.LayoutPrinter.layout);
    var pageUrl = null;
    if (page.indexOf('http://') === 0) {
        pageUrl = page;
    } else {
        pageUrl = "../ux/layout/" + page;
    }
 	  if (Ext.isIE) {
        // appendChild problem: http://tamentis.com/doc/no_such_interface/
       // alert('IE not supported (http://tamentis.com/doc/no_such_interface/). Please use Firefox !');
        var mapPanel = GeoExt.MapPanel.guess();
        mapPanel.printEl();
    } else {
        GeoExt.ux.layout.LayoutPrinter.printWindow = window.open(pageUrl, "_blank", "menubar=0,scrollbars=0,location=0,status=0,width=" + GeoExt.ux.layout.getPageWidth(GeoExt.ux.layout.LayoutPrinter.layout) + ",height=" + GeoExt.ux.layout.getPageHeight(GeoExt.ux.layout.LayoutPrinter.layout) + "");
    }
};

GeoExt.ux.layout.LayoutPrinter.Apply = function(childWindow) {
    if (childWindow.map) {
        GeoExt.ux.layout.LayoutPrinter.setMap(childWindow);
    }
};

GeoExt.ux.layout.LayoutPrinter.setMap = function(childWindow) {
    var options = {
        tileSize: GeoExt.ux.layout.LayoutPrinter.map.tileSize,
        projection: GeoExt.ux.layout.LayoutPrinter.map.projection,
        units: GeoExt.ux.layout.LayoutPrinter.map.units,
        resolutions: GeoExt.ux.layout.LayoutPrinter.map.resolutions,
        maxResolution: GeoExt.ux.layout.LayoutPrinter.map.maxResolution,
        minResolution: GeoExt.ux.layout.LayoutPrinter.map.minResolution,
        maxScale: GeoExt.ux.layout.LayoutPrinter.map.maxScale,
        minScale: GeoExt.ux.layout.LayoutPrinter.map.minScale,
        maxExtent: GeoExt.ux.layout.LayoutPrinter.map.maxExtent,
        minExtent: GeoExt.ux.layout.LayoutPrinter.map.minExtent,
        restrictedExtent: GeoExt.ux.layout.LayoutPrinter.map.restrictedExtent,
        numZoomLevels: GeoExt.ux.layout.LayoutPrinter.map.numZoomLevels,
        theme: GeoExt.ux.layout.LayoutPrinter.map.theme,
        displayProjection: GeoExt.ux.layout.LayoutPrinter.map.displayProjection,
        fallThrough: GeoExt.ux.layout.LayoutPrinter.map.fallThrough,
        panTween: GeoExt.ux.layout.LayoutPrinter.map.panTween,
        eventListeners: GeoExt.ux.layout.LayoutPrinter.map.eventListeners,
        panMethod: GeoExt.ux.layout.LayoutPrinter.map.panMethod,
        panDuration: GeoExt.ux.layout.LayoutPrinter.map.panDuration,
        paddingForPopups: GeoExt.ux.layout.LayoutPrinter.map.paddingForPopups
    };

    childWindow.map.setOptions(options);
    for (var i = 0; i < GeoExt.ux.layout.LayoutPrinter.map.layers.length; i++) {
        var layer = GeoExt.ux.layout.LayoutPrinter.map.layers[i];

        // Clone the vector features
        if (layer instanceof OpenLayers.Layer.Vector) {
            var vectorLayer = new OpenLayers.Layer.Vector();
            var clonedFeatures = [];
            for (var k = 0; k < layer.features.length; k++) {
                clonedFeatures.push(layer.features[k].clone());

            }
            vectorLayer.addFeatures(clonedFeatures);
            childWindow.map.addLayer(vectorLayer);
        } else {
            childWindow.map.addLayer(layer.clone());
        }

    }
    childWindow.map.setCenter(GeoExt.ux.layout.LayoutPrinter.map.getCenter(), GeoExt.ux.layout.LayoutPrinter.map.getZoom());
};

GeoExt.ux.layout.LayoutPrinter.layout = null;

GeoExt.ux.layout.LayoutPrinter.printWindow = null;

GeoExt.ux.layout.LayoutPrinter.map = null;