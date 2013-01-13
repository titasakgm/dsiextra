/**
 * Copyright (c) 2008-2009 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = GeoExt.ux
 *  class = PrinterPanel
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */

Ext.namespace('GeoExt.ux');

GeoExt.ux.PrinterPanel = Ext.extend(Ext.Panel, {

    /** api: config[map]
     *  ``OpenLayers.Map``  A configured map
     */
    /** private: property[map]
     *  ``OpenLayers.Map``  The map object
     */
    map: null,

    layoutCombo: null,

    defaultLayout: OpenLayers.i18n('A4 portrait'),

    /** private: method[initComponent]
     *  Private initComponent override.
     */
    initComponent : function() {
        var defConfig = {
            plain: true,
            border: false
        };

        Ext.applyIf(this, defConfig);

        this.layoutCombo = new Ext.form.ComboBox({
            id: 'layoutcombo',
            fieldLabel: OpenLayers.i18n('Layout'),
            store: GeoExt.ux.layout.LayoutStore,
            displayField:'layout',
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText:'Select a layout...',
            selectOnFocus:true,
            resizable:true
        });

        this.layoutCombo.setValue(this.defaultLayout);

        // Create items of printer panel
        this.items = [
            {
                layout: 'form',
                border:false,
                items: [
                    {
                        layout: 'column',
                        border: false,
                        defaults:{
                            layout:'form',
                            border:false,
                            bodyStyle:'padding:5px 5px 5px 5px'
                        },
                        items:[
                            {
                                columnWidth:1,
                                defaults:{
                                    anchor:'100%'
                                },
                                items: [
                                    this.layoutCombo
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                layout: 'column',
                border: false,
                items: [
                    {
                        columnWidth: 1,
                        border: false,
                        bodyCfg: {tag:'center'},
                        items: [
                            {
                                xtype:'button',
                                text: OpenLayers.i18n('Print'),
                                handler: function() {
                                    this.print();
                                },
                                scope: this
                            }
                        ]
                    }
                ]

            }
        ];

        this.addEvents(
            /** api: event[printed]
             *  Fires when a routing has been computed
             *
             *  Listener arguments:
             *  * comp - :class:`GeoExt.ux.RoutingPanel`` This component.
             *  * layout - :class:`GeoExt.ux.RoutingPanel`` This component.
             */
                'printed',

            /** api: event[beforeprinted]
             *  Fires when before a routing is computed
             *
             *  Listener arguments:
             *  * comp - :class:`GeoExt.ux.RoutingPanel`` This component.
             *  * layout
             */
                'beforeprinted');

        GeoExt.ux.PrinterPanel.superclass.initComponent.call(this);
    },

    /** private: method[print]
     *  Print the map
     */
    print: function() {
        this.fireEvent('beforeprinted', this, this.layoutCombo.getValue());
        GeoExt.ux.layout.LayoutPrinter(this.map, this.layoutCombo.getValue());
        GeoExt.ux.layout.LayoutPrinter.OpenPrint();
        if (Ext.getCmp('printerwindow')) {
            Ext.getCmp('printerwindow').close();
        }
        this.fireEvent('printed', this, this.layoutCombo.getValue());

    }
});

Ext.reg('gxux_printerpanel', GeoExt.ux.PrinterPanel);