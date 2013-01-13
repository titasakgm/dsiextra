/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace("GeoExt.ux.layout");

GeoExt.ux.layout.layouts = [
    [OpenLayers.i18n('A4 portrait'), 'a4_portrait.html',790,1120],
    [OpenLayers.i18n('A4 landscape'), 'a4_landscape.html',1120,790]
];

GeoExt.ux.layout.getHtmlPage = function(layout) {
    for (var i = 0; i< GeoExt.ux.layout.layouts.length;i++) {
        if (GeoExt.ux.layout.layouts[i][0] == layout) {
            return GeoExt.ux.layout.layouts[i][1];
        }
    }
};

GeoExt.ux.layout.getPageWidth = function(layout) {
    for (var i = 0; i< GeoExt.ux.layout.layouts.length;i++) {
        if (GeoExt.ux.layout.layouts[i][0] == layout) {
            return GeoExt.ux.layout.layouts[i][2];
        }
    }
};

GeoExt.ux.layout.getPageHeight = function(layout) {
    for (var i = 0; i< GeoExt.ux.layout.layouts.length;i++) {
        if (GeoExt.ux.layout.layouts[i][0] == layout) {
            return GeoExt.ux.layout.layouts[i][3];
        }
    }
};

GeoExt.ux.layout.LayoutStore = new Ext.data.SimpleStore({
    fields: ['layout', 'htmlpage', 'pageWidth', 'pageHeight'],
    data: GeoExt.ux.layout.layouts
});



