function init() {
    document.getElementById('loadingDiv').style.visibility = 'hidden';
    Ext.QuickTips.init();
    var epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var epsg900913 = new OpenLayers.Projection("EPSG:900913");
    var loadingpanel = new OpenLayers.Control.LoadingPanel();
    var current_date = new Date();
    var month_names = new Array();
    month_names[month_names.length] = "January";
    month_names[month_names.length] = "February";
    month_names[month_names.length] = "March";
    month_names[month_names.length] = "April";
    month_names[month_names.length] = "May";
    month_names[month_names.length] = "June";
    month_names[month_names.length] = "July";
    month_names[month_names.length] = "August";
    month_names[month_names.length] = "September";
    month_names[month_names.length] = "October";
    month_names[month_names.length] = "November";
    month_names[month_names.length] = "December";
    var day_names = new Array();
    day_names[day_names.length] = "Sunday";
    day_names[day_names.length] = "Monday";
    day_names[day_names.length] = "Tuesday";
    day_names[day_names.length] = "Wednesday";
    day_names[day_names.length] = "Thursday";
    day_names[day_names.length] = "Friday";
    day_names[day_names.length] = "Saterday";
    var date = day_names[current_date.getDay()] + ", " + month_names[current_date.getMonth()] + " " + current_date.getDate() + " " + " " + current_date.getFullYear();

    var gsat = new OpenLayers.Layer.Google("Google Satellite", {
        type: G_SATELLITE_MAP,
        sphericalMercator: true
    });

    var ghybrid = new OpenLayers.Layer.Google("Google Hybrid", {
        type: G_HYBRID_MAP,
        sphericalMercator: true
    });

    var gphysical = new OpenLayers.Layer.Google("Google Terrain", {
        type: G_PHYSICAL_MAP,
        sphericalMercator: true
    });

    var gmap = new OpenLayers.Layer.Google("Google Street", {
        type: null,
        sphericalMercator: true
    });

    var mapnik = new OpenLayers.Layer.OSM("Open Street Map (OSM)");

    var mapOptions = {
        projection: epsg900913,
        displayProjection: epsg4326,
        units: "m",
        numZoomLevels: 21,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34), // World EPSG:900913 extent
        controls: [new OpenLayers.Control.MouseDefaults(), 
				   new OpenLayers.Control.MousePosition({div: document.getElementById("mouseposition"),}), 
				   new OpenLayers.Control.ScaleLine({maxWidth: 200,geodesic: true})
				  // ,new OpenLayers.Control.PanPanel()
				   
				   ]
    };
    map = new OpenLayers.Map(null, mapOptions);
	
    map.addControl(loadingpanel);

    var check_forest_info = function(layer,ll) {
      lon = ll.lon;
      lat = ll.lat;

      if (layer == 'เขตอุทยานแห่งชาติ')
        layer = 'national_park';
      else if (layer == 'เขตป่าสงวน')
        layer = 'reserve_forest';
      else if (layer == 'ป่าชายเลน ปี 2530')
        layer = 'mangrove_2530';
      else if (layer == 'ป่าชายเลน ปี 2543')
        layer = 'mangrove_2543';
      else if (layer == 'ป่าชายเลน ปี 2552')
        layer = 'mangrove_2552';

      Ext.Ajax.request({
        url: 'rb/check_forest_info.rb'
        ,params: {
          method: 'GET'
          ,layer: layer
          ,lon: lon
          ,lat: lat
          ,format: 'json'
        }
        ,success: function(response, opts){
          var data = Ext.decode(response.responseText);
          var lon = data.lon;
          var lat = data.lat;
          var msg = data.msg;

          var p1 = new OpenLayers.LonLat(lon,lat);
          var p2 = p1.transform(epsg4326,epsg900913);

          if (msg != 'NA')
            info('Result', msg);
        }
        ,failure: function(response, opts){
          alert('check forest info > failure');
          return false;
        }
      });
    };

    // Add events for npark and rforest
    map.events.register("click", map, function(e){
      var lonlat = map.getLonLatFromViewPortPx(e.xy).transform(epsg900913,epsg4326);
      var activelayers = map.getLayersBy("visibility", true);
      for(i=0;i<activelayers.length;i++) {
        if (activelayers[i].name.search('เขต') != -1 || activelayers[i].name.search('ชายเลน') != -1)
          check_forest_info(activelayers[i].name, lonlat);
      }
    });

    var mapPanel;
    var scaleStore = new GeoExt.data.ScaleStore({
        map: map
    });
    var zoomSelector = new Ext.form.ComboBox({
        store: scaleStore,
        width: 140,
        renderTo: 'ScaleSelector',
        emptyText: "Zoom Level",
        tpl: '<tpl for="."><div class="x-combo-list-item">1 : {[parseInt(values.scale)]}</div></tpl>',
        editable: false,
        triggerAction: 'all',
        mode: 'local'
    });
    zoomSelector.on('select', function (combo, record, index) {
        this.map.zoomTo(record.data.level)
    }, this);
    map.events.register('zoomend', this, function () {
        var scale = scaleStore.queryBy(function (record) {
            return this.map.getZoom() == record.data.level
        });
        if (scale.length > 0) {
            scale = scale.items[0];
            zoomSelector.setValue("1 : " + parseInt(scale.data.scale))
        } else {
            if (!zoomSelector.rendered) return;
            zoomSelector.clearValue()
        }
    });
    Ext.namespace('Ext.selectdata');
    Ext.selectdata.zooms = [
        ['11190592', '1546524', '11192985', '1547934', 'อนุสาวรีย์ชัยสมรภูมิ'],
        ['11190391', '1544415', '11192618', '1545790', 'สยามพารากอน'],
        ['11193809', '1560957', '11196035', '1562333', 'DSI (กรมสอบสวนคดีพิเศษ)']
    ];
    var zoomstore = new Ext.data.ArrayStore({
        fields: [{
            name: 'ymin',
            type: 'float'
        },
        {
            name: 'xmin',
            type: 'float'
        },
        {
            name: 'ymax',
            type: 'float'
        },
        {
            name: 'xmax',
            type: 'float'
        },
        {
            name: 'label',
            type: 'string'
        }],
        data: Ext.selectdata.zooms
    });

    function geocoder(q) {
      Ext.Ajax.request({
        url: 'rb/geocoder.rb'
        ,params: { q: q }
        ,success: function(resp,opt) {
          var data = Ext.decode(resp.responseText);
          var lat = data.lat;
          var lng = data.lng;
          var poi = new OpenLayers.LonLat(lng,lat);
          mapPanel.map.setCenter(poi,17);
        }
        ,failure: function(resp, opt) {
          Ext.Msg.alert('Result', 'Failed');
        } 
      });
    };

    var quickzoom = new Ext.form.ComboBox({
        tpl: '<tpl for="."><div ext:qtip="{label}" class="x-combo-list-item">{label}</div></tpl>',
        store: zoomstore,
        displayField: 'label',
        typeAhead: true,
        mode: 'local',
        forceSelection: true,
        triggerAction: 'all',
        width: 175,
        emptyText: 'Quick Zoom',
        selectOnFocus: true,
        enableKeyEvents: true,
        editable: true,
        listeners: {
            'keypress': function(combo, e) {
              if (e.getCharCode() == e.ENTER) {
                var kw = combo.getRawValue();
                ll = geocoder(kw);
                return false;
              }
            },
            'select': function (combo, record) {
                mapPanel.map.zoomToExtent(new OpenLayers.Bounds(record.data.ymin, record.data.xmin, record.data.ymax, record.data.xmax))
            },
            scope: this
        }
    });
    var featureInfo = new OpenLayers.Control.WMSGetFeatureInfo({
        queryVisible: true,
        highlightOnly: false,
        maxFeatures: 20
    });
    map.addControl(featureInfo);
    featureInfo.activate();
    var toolbarItems = [],
    action, actions = {};
    var toggleGroup = "ToggleToolbar";
    OpenLayers.Control.Measure.prototype.geodesic = true;

    function check(btn) {
        if (btn == 'OK') {
            oDragPanCtrl.activate()
        }
    };
    action = new GeoExt.Action({
        text: "",
        tooltip: "Zoom to max",
        icon: 'images/arrow_out.png',
        control: new OpenLayers.Control.ZoomToMaxExtent(),
        map: map
    });
    actions["max_extent"] = action;
    toolbarItems.push(action);

    toolbarItems.push(' ', ' ', ' ', ' ');

    action = new GeoExt.Action({
        text: "",
        enableToggle: true,
        toggleGroup: toggleGroup,
        tooltip: "Pan", 
        icon: 'images/hand.png',
        control: new OpenLayers.Control.DragPan({
            isDefault: true,
            title: 'Pan'
        }),
        map: map
    });
    actions["Pan"] = action;
    toolbarItems.push(action);

    toolbarItems.push(' ', ' ', ' ', ' ');

    action = new GeoExt.Action({
        text: "",
        enableToggle: true,
        toggleGroup: toggleGroup,
        tooltip: "Zoom In",
        icon: 'images/zoom_in.png',
        control: new OpenLayers.Control.ZoomIn(),
        map: map
    });
    actions["Zoom in"] = action;
    toolbarItems.push(action);

    toolbarItems.push(' ', ' ', ' ', ' ');

    action = new GeoExt.Action({
        text: "",
        enableToggle: true,
        toggleGroup: toggleGroup,
        tooltip: "Zoom Out",
        icon: 'images/zoom_out.png',
        control: new OpenLayers.Control.ZoomOut(),
        map: map
    });
    actions["Zoom out"] = action;
    toolbarItems.push(action);

    toolbarItems.push(' ', ' ', ' ', ' ');

    action = new GeoExt.Action({
        text: "",
        tooltip: "Zoom Box",
        enableToggle: true,
        icon: 'images/magnifier_zoom_box.png',
        toggleGroup: toggleGroup,
        control: new OpenLayers.Control.ZoomBox({
            alwaysZoom: true
        }),
        map: map
    });
    actions["Zoom"] = action;
    toolbarItems.push(action);

    toolbarItems.push(' ', ' ', ' ', ' ');

    ctrl = new OpenLayers.Control.NavigationHistory();
    map.addControl(ctrl);

    action = new GeoExt.Action({
        text: "",
        icon: 'images/arrow_left.png',
        control: ctrl.previous,
        disabled: true,
        tooltip: "Go Backward"
    });
    actions["previous"] = action;
    toolbarItems.push(action);

    action = new GeoExt.Action({
        text: "",
        control: ctrl.next,
        icon: 'images/arrow_right.png',
        disabled: true,
        tooltip: "Go Forward"
    });
    actions["next"] = action;
    toolbarItems.push(action);

    toolbarItems.push(' ', ' ', ' ', ' ');

    action = new GeoExt.Action({
        text: "",
        tooltip: "Select Features",
        enableToggle: true,
        icon: 'images/information.png',
        toggleGroup: toggleGroup,
        control: featureInfo,
        map: map
    });
    actions["Select"] = action;
    toolbarItems.push(action);

    toolbarItems.push(' ', ' ', ' ', ' ');

    var sketchSymbolizers = {
        "Point": {
            pointRadius: 4,
            graphicName: "square",
            fillColor: "white",
            fillOpacity: 1,
            strokeWidth: 1,
            strokeOpacity: 1,
            strokeColor: "#333333"
        },
        "Line": {
            strokeWidth: 3,
            strokeOpacity: 1,
            strokeColor: "#2AFF2A",
            strokeDashstyle: "dash"
        },
        "Polygon": {
            strokeWidth: 2,
            strokeOpacity: 1,
            strokeColor: "#2AFF2A",
            strokeDashstyle: "dash",
            fillColor: "#2AFF2A",
            fillOpacity: 0.2
        }
    };
    var style = new OpenLayers.Style();
    style.addRules([new OpenLayers.Rule({
        symbolizer: sketchSymbolizers
    })]);
    var styleMap = new OpenLayers.StyleMap({
        "default": style
    });

    action = new GeoExt.Action({
        text: "",
        icon: 'images/ruler_square.png',
        toggleGroup: toggleGroup,
        enableToggle: true,
        tooltip: "วัดขนาดพื้นที่",
        control: new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
            displayClass: 'olControlMeasureArea', 
	    clickout: true,
            persist: false,
            handlerOptions: {
                layerOptions: {
                    styleMap: styleMap
                }
            },
            eventListeners: {
                measure: function (evt) {
                    Ext.MessageBox.show({
                        title: 'พื้นที่โดยประมาณ',
                        buttons: Ext.MessageBox.OK,
                        width: 200,
                        msg: "Area: " + evt.measure.toFixed(2) + " " + evt.units + "&sup2;"
                    })
                }
            }
        }),
        map: map
    });
    actions["area"] = action;
    toolbarItems.push(action);

    toolbarItems.push(' ', ' ', ' ', ' ');

    action = new GeoExt.Action({
        text: "",
        enableToggle: true,
        toggleGroup: toggleGroup,
	icon: 'images/ruler.png',
        tooltip: "วัดระยะทาง",
        control: new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
            persist: false,
            handlerOptions: {
                layerOptions: {
                    styleMap: styleMap
                }
            },
            eventListeners: {
                measure: function (evt) {
                    Ext.MessageBox.show({
                        title: 'ระยะทางรวมโดยประมาณ',
                        buttons: Ext.MessageBox.OK,
                        width: 200,
                        msg: "Length: " + evt.measure.toFixed(2) + " " + evt.units
                    })
                }
            }
        }),
        map: map
    });
    actions["line"] = action;
    toolbarItems.push(action);

    var win;
    var toolwin;
    var capabilitieswin;
    var winMetadata;
    var metadatabutton = new Ext.Button({
        text: 'Metadata',
        icon: 'images/grid.png',
        enableToggle: false,
        handler: function (toggled) {
            if (!winMetadata) {
                winMetadata = new Ext.Window({
                    title: 'Metadata',
                    layout: 'fit',
                    width: 600,
                    height: 500,
                    closeAction: 'hide',
                    plain: true,
                    items: [tabsMetadata],
                    buttons: [{
                        text: 'Close',
                        handler: function () {
                            winMetadata.hide()
                        }
                    }]
                })
            }
            winMetadata.show(this)
        }
    });

    var tabsMetadata = new Ext.TabPanel({
        margins: '3 3 3 0',
        activeTab: 0,
        defaults: {
          autoScroll: true
        },
        resizable: false,
        items: [{
            title: 'METADATA',
            items: [grid_metadata,
            {
                id: 'detailPanel',
                region: 'center',
                bodyStyle: {
                    background: '#ffffff',
                    padding: '7px',
                    color: '#111166'
                },
                html: '<span style="color:#069; font-weight:bold;">เลือกข้อมูล</span>'
            }]
        },
        {
            title: 'INSPIRE',
            html: "ขอขอบคุณ website ที่เป็นต้นแบบในการพัฒนา http://maps.zgb.de/www/zgb_energie/geodatenportal.html"
        }]
    });

    var tabs = new Ext.TabPanel({
        margins: '3 3 3 0',
        activeTab: 0,
        defaults: {
            autoScroll: true
        },
        resizable: false,
        items: [{
            title: 'DSI Map Extra',
            html: "<table class='table_allgemein'>" + "<tr><td><a href='http://dsi-map.go.th'><img height='100px' src='images/dsi-logo.png' alt='DSI' /></a></td></tr>" + "<tr><td>การพัฒนา DSI Map Extra</td></tr>" + "<tr><td><p>พัฒนา Smart Search ที่สามารถใส่ input ได้หลากหลาย เริ่มต้นด้วย แสดงรายการ Quick Zoom สำหรับสถานที่ตัวอย่าง สามารถกรอกข้อมูลพิกัด ในรูปแบบต่างๆ เช่น Lat/Long UTM Zone 47 48, UTM Indian 1975 เฉพาะกรณีนี้ ผู้ใช้งานต้องระบุคำว่า Indian หร่อ 1975 ต่อท้ายโดยเว้นวรรคเพื่อให้ระบบได้ทราบว่าเป็น projection ชนิดนี้ (อย่างน้อย ระบุอักษร I หรือ i)<p>&nbsp;</p>นอกจากนี้ ยังได้เพิ่มความสามารถ geocoder ทำให้ระบุชื่อสถานที่เป็นภาษาไทย หรือ ภาษาอังกฤษได้ เมื่อกดปุ่ม [Enter] ระบบจะทำการค้นหาตำแหน่งพิกัดให้ และหากพบคำค้น จะทำการ Zoom ไปยังสถานที่นั้นๆทันที</p><p>&nbsp;</p><p>ขอขอบคุณต้นแบบสำหรับการพัฒนา <a href='http://maps.zgb.de/www/zgb_energie/geodatenportal.html'>ZGB Website</a></p></td></tr>" + "</table>"
        },
        {
            title: 'ข้อมูลด้านเทคนิค',
            html: "<table class='table_allgemein'>" + "<tr><td>ข้อมูลด้านเทคนิค</td></tr>" + "<tr><td>WMS/WFS Server:</td><td><img height='50px' src='images/GeoServer_100.png' alt='Geoserver' /></td></tr>" + "<tr><td>Tile Caching: </td><td><img height='50px' src='images/geowebcache1.png' alt='Geoserver' /></td></tr>" + "<tr><td>GUI Design</td><td><img height='50px' src='images/logoEXT.png' alt='Geoserver' /></td></tr>" + "</table>"
        }]
    });
    
    var capabilitiesgrid_aaa = new Ext.grid.GridPanel({
        title: "รายการชั้นข้อมูล",
        width: 580,
        height: 400,
        viewConfig: {
            forceFit: true
        },
        store: new GeoExt.data.WMSCapabilitiesStore({
            url: "/cgi-bin/mapserv?SERVICE=WMS&REQUEST=GetCapabilities&map=/ms603/map/wms-dsi-extra.map",
            autoLoad: true
        }),
        columns: [{
            header: "Name",
            dataIndex: "name",
            sortable: true
        },
        {
            header: "Title",
            dataIndex: "title",
            sortable: true
        }],
        tbar: [new Ext.Button({
            text: "เพิ่มชั้นข้อมูล",
            icon: 'images/add.png',
            tooltip: 'เลื่อกชั้นข้อมูลที่ต้องการใช้งาน กดปุ่ม [Ctrl] เมื่อต้องการเลือกหลายชั้น',
            handler: function () {
                var sm = capabilitiesgrid_aaa.getSelectionModel();
                var record = sm.getSelected();
                mapPanel.layers.add([record.copy()])
            }
        })]
    });

    capabilitiesgrid_aaa.on('rowdblclick', function () {
        var sm = capabilitiesgrid_aaa.getSelectionModel();
        var record = sm.getSelected();
        mapPanel.layers.add([record.copy()])
    });

    var tabscapabilities = new Ext.TabPanel({
        margins: '3 3 3 0',
        activeTab: 0,
        forceFit: true,
        defaults: {
          autoScroll: true
        },
        resizable: false,
        items: [capabilitiesgrid_aaa],
        bbar: [new Ext.Button({
            text: 'Close',
            icon: 'images/close.png',
            handler: function () {
                capabilitieswin.hide()
            }
        })]
    });

    var toolwin = new Ext.Window({
        title: "Navigation Tools",
        layout: 'fit',
        width: '300',
        height: 'auto',
        border: false,
        closable: false,
        collapsible: true,
        x: 400,
        y: 50,
        resizable: false,
        closeAction: 'hide',
        plain: true,
        tbar: [toolbarItems]
    });
    toolwin.show();
	
Ext.ux.loadGoogleVisualizationPackages("piechart");
Ext.BLANK_IMAGE_URL = 'ext/resources/images/default/s.gif';

var visualConfigs = {
	'PieChart': {
		id:'PieChart',
		title: 'My Daily Activities',
		xtype: 'googlevisualizationcomponent',
		visualizationType: 'ColumnChart',
		visualizationConfig: {
			width: 340,
			height: 350,
			is3D: true
		},
		columns: [
			['string', 'Energiequelle'],
			['number', 'Prozent']
		],
		data: [
			['Wind', 71.5],
			['Solar', 2.9],
			['Biomasse', 21.9],
			['Gas', 5],
			['Wasserkraft', 4]
		]
	}
	
};

	var pie = visualConfigs['PieChart'];

	var graphbutton = new Ext.Button({
        text: 'Statistic',
        icon: 'images/charts.png',
        enableToggle: false,
        handler: function (toggled) {
            if (!win1) {
		var win1 = new Ext.Window({
                        title: 'Statistic',
						border : true,
                        layout: 'fit',
                        width: 360,
                        height: 440,
                        closeAction: 'hide',
                        plain: true,
                        items:[pie],
						tbar:[
						'<span style="color:#555555; font-size:15px;font-weight:bold">Eneuerbare Energiequellen im ZGB</span>','->'
							]
                        ,buttons: [{
                            text: 'Close',
                            handler: function () {
                                win1.hide()
                            }
                        }]
                    }); 
                win1.show(this)
            }
            
        }
    });
	
    var zoomthai = new Ext.Button({
        text: '',
        icon: 'images/zoomfull.png',
        tip: 'กลับสู่แผนที่เริ่มต้น',
        enableToggle: false,
        handler: function () {
          map.zoomToExtent(new OpenLayers.Bounds(10825820,613199,11772036,2332357)); // Thailand EPSG:900913 extent
        },
        allowDepress: false
    });

    var printDialog;
    var printProvider = new GeoExt.data.PrintProvider({
        method: "GET",
        capabilities: printCapabilities,
        customParams: {
            mapTitle: "DSI MAP Extra",
            comment: date
        }
    });
	
    //////////////////////////////////////////////
    // Utilty functions
    //////////////////////////////////////////////

    function info(title, msg) {
      Ext.Msg.show({
        title: title,
        msg: msg,
        minWidth: 200,
        modal: true,
        icon: Ext.Msg.INFO,
        buttons: Ext.Msg.OK
      });
    };

    mapPanel = new GeoExt.MapPanel({
        region: 'center',
        map: map,
        //layers: [mapnik, gsat, ghybrid, gphysical, gmap,layer_wea, layer_solar, layer_kraftwerke, layer_erdwaerme, layer_wasserkraft, layer_biogas, layer_avifaun_gast, layer_avifaun_brut, layer_tabu_wgs84, Landschaftsbild_10km_Puffer_Harz_wgs84, Landschaftsbild_5km_Puffer_Lappwald_wgs84, layer_suchraum_v4, layer_suchraum_v3, layer_suchraum_v2, layer_suchraum_v1, layer_windpotential, layer_wea_f, Grenzen-label, Grenzen],
        layers: [mapnik, gsat, ghybrid, gphysical, gmap],
        items: [{
            xtype: "gx_zoomslider",
            vertical: true,
            height: 130,
            x: 18,
            y: 40,
            plugins: new GeoExt.ZoomSliderTip()
        }],
        tbar: [zoomthai,'-',
	    new Ext.Button({
              text: 'Info',
              icon: 'images/about.png',
              tooltip: 'ข้อมูลด้านเทคนิค',
              handler: function () {
                if (!win) {
                    win = new Ext.Window({
                        title: 'ข้อมูลด้านเทคนิค',
                        layout: 'fit',
                        width: 600,
                        height: 500,
                        closeAction: 'hide',
                        plain: true,
                        items: [tabs],
                        buttons: [{
                            text: 'Close',
                            handler: function () {
                                win.hide()
                            }
                        }]
                    })
                }
                win.show(this)
            }
        }), '-', new Ext.Button({
            text: 'เพิ่มชั้นข้อมูล',
            icon: 'images/add.png',
            tooltip: 'เลือกชั้นข้อมูลที่ต้องการใช้งาน กดปุ่ม [Ctrl] เมื่อต้องการเลือกหลายชั้น',
            handler: function () {
                if (!capabilitieswin) {
                    capabilitieswin = new Ext.Window({
                        title: "เลือกชั้นข้อมูลที่ต้องการใช้งานเพิ่มเติม",
                        layout: 'fit',
                        width: '300',
                        height: 'auto',
                        border: false,
                        closable: true,
                        collapsible: true,
                        x: 400,
                        y: 110,
                        resizable: true,
                        closeAction: 'hide',
                        plain: true,
                        tbar: [tabscapabilities]
                    })
                }
                capabilitieswin.show(this)
            }
        }), '-', new Ext.Button({
            text: "พิมพ์แผนที่",
            icon: 'images/printer.png',
            tooltip: "Export to PDF Format",
            handler: function() {
            var printerWindow = new GeoExt.ux.PrinterWindow({
              map: map
            });
            printerWindow.show();
        }

        }), '->', quickzoom]

    });
	
	
 // tree
	
    var layerRoot = new Ext.tree.TreeNode({
        text: "DSI Extra",
        expanded: false
    });

    var layerListBase = new GeoExt.tree.BaseLayerContainer({
        text: "<span class='TreeHeader'>Base Layer</span>",
        map: map,
        expanded: false
    });

    layerRoot.appendChild(layerListBase);

    var dsi_store = new GeoExt.data.LayerStore({
        id: "id_dsi_store",
        text: "DSI Layers4",
        map: map,
        initDir: 0,
        loader: {
            filter: function (record) {
                return record.get("layer").name.indexOf("WMS") !== -1
            }
        }
    });
	
    var clickListener = function (node, event) {
        if (!capabilitieswin) {
            capabilitieswin = new Ext.Window({
                title: "เลือกชั้นข้อมูลที่ต้องการใช้งานเพิ่มเติม",
               	layout: 'fit',
                width: '300',
                height: 'auto',
                border: false,
                closable: true,
                collapsible: true,
                x: 400,
                y: 110,
                resizable: true,
                closeAction: 'hide',
                plain: true,
                tbar: [tabscapabilities]
            })
        }
        capabilitieswin.show(this)
    };

    layerRoot.appendChild(new GeoExt.tree.OverlayLayerContainer({
        id: 'id_dsi_layer',
        icon: 'images/add.png',
        text: "<span class='TreeHeader'>เพิ่มชั้นข้อมูล</span>",
        layerStore: dsi_store,
        expanded: true,
        leaf: true,
        listeners: {
          click: {
            fn: clickListener
          }
        }
    }));

    var tree = new Ext.tree.TreePanel({
        rootVisible: true,
        root: layerRoot,
        rootVisible: false
    });

    var removeLayerAction = new Ext.Action({
        text: "Remove Layer",
        icon: 'images/delete.png',
        disabled: false,
        tooltip: "Remove Layer",
        handler: function () {
            var node = layerTree.getSelectionModel().getSelectedNode();
            if (node && node.layer) {
                var layer = node.layer;
                var store = node.layerStore;
                store.removeAt(store.findBy(function (record) {
                    return record.get("layer") === layer
                }))
            }
        }
    });

    var layerTree = new Ext.tree.TreePanel({
        useArrows: true,
        title: 'เลือกชั้นข้อมูล',
        region: 'north',
        root: layerRoot,
        bodyStyle: 'background-image:url("images/dsi.png");background-repeat:no-repeat;background-position: bottom left;',
        enableDD: false,
        expanded: true,
        applyLoader: true,
        rootVisible: true,
        width: 340,
        height: 400,
        listeners: {
            contextmenu: function (node, e) {
                node.select();
                var c = node.getOwnerTree().contextMenu;
                c.contextNode = node;
                c.showAt(e.getXY())
            },
            scope: this
        },
        contextMenu: new Ext.menu.Menu({
            items: [{
                text: "Zoom to Layer Extent",
                icon: 'images/arrow_out.png',
                handler: function () {
                    var node = layerTree.getSelectionModel().getSelectedNode();
                    if (node && node.layer) {
                        this.map.zoomToExtent(node.layer.maxExtent)
                    }
                },
                scope: this
            },
            removeLayerAction,
            {
                text: "Custom Layers",
                icon: 'images/add.png',
                handler: function () {
                    if (!capabilitieswin) {
                        capabilitieswin = new Ext.Window({
                            title: "รายละเอียดชั้นข้อมูล",
                            layout: 'fit',
                            width: '600',
                            height: 'auto',
                            border: false,
                            closable: true,
                            collapsible: true,
                            x: 400,
                            y: 110,
                            resizable: true,
                            closeAction: 'hide',
                            plain: true,
                            tbar: [tabsMetadata]
                        })
                    }
                    capabilitieswin.show(this)
                }
            }]
        })
    });
	
    var legendPanel = new GeoExt.LegendPanel({
        region: 'center',
        defaults: {
            labelCls: 'mylabel',
            style: 'padding:5px',
            dynamic: true
        },
        bodyStyle: 'padding:0px',
        width: 200,
        autoScroll: true
    });
    var legendwin = new Ext.Window({
        title: "WMS Layer Legend",
        layout: 'fit',
        width: 200,
        collapsible: true,
        height: 500,
        closeAction: 'hide',
        plain: true,
        items: [legendPanel],
        buttons: [{
            icon: 'images/close.png',
            text: 'Close',
            handler: function () {
                legendwin.hide()
            }
        }]
    });
    var tabsInhalt = new Ext.TabPanel({
        margins: '3 3 3 0',
        activeTab: 0,
        region: 'center',
        defaults: {
            autoScroll: true
        },
        resizable: false,
        items: [layerTree]
    });
    var northPanel = {
        region: 'north',
        height: 0,
        contentEl: 'wrap',
        minSize: 75,
        maxSize: 80,
        cmargins: '0 0 5 0'
    };
    var westPanel = {
        title: 'DSI Extra',
        region: 'west',
        collapsible: true,
        margins: '0 0 0 0',
        cmargins: '0 5 0 0',
        width: 350,
        maxSize: 300,
        bodyStyle: 'border:0px',
        layout: 'border',
        defaults: {
            split: true,
            bodyStyle: 'padding:15px'
        },
        tbar: ['->', new Ext.Button({
            text: 'Legend',
            icon: 'images/legend.png',
            tooltip: '',
            handler: function () {
                legendwin.show(this)
            }
        })],
        items: [tabsInhalt]
    };
    var southPanel = {
        region: 'south',
        contentEl: 'south',
        bodyStyle: 'background-color:#34466C;',
        height: 27,
        minSize: 100,
        maxSize: 200,
        margins: '0 0 0 0'
    };
	
    var container = new Ext.Viewport({
        layout: 'border',
        defaults: {
            split: true,
            bodyStyle: 'padding:0px'
        },
        items: [mapPanel, westPanel, northPanel, southPanel]
    });
    //mapCenter = new OpenLayers.LonLat(100.56567,13.89040).transform(epsg4326, epsg900913);
    //var mapCenter = new OpenLayers.LonLat(1169180, 6843865);
    var mapCenter = new OpenLayers.LonLat(11194919,1561645);
    map.setCenter(mapCenter, 5);
    map.setBaseLayer(ghybrid);
};
