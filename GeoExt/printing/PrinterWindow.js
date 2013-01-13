/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

Ext.namespace('GeoExt.ux');

GeoExt.ux.PrinterWindow = Ext.extend(Ext.Window, {
    id: 'printerwindow',
    modal: true,
    title: OpenLayers.i18n('Printer'),
    height: 100,
    width: 275,

    initComponent: function() {

        this.printerPanel = new GeoExt.ux.PrinterPanel({
            map: this.map,
            height: 100
        });

        this.items = [
            this.printerPanel
        ];
        GeoExt.ux.PrinterWindow.superclass.initComponent.call(this);
    }
});