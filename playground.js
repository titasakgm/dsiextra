
					
Ext.ux.loadGoogleVisualizationPackages("piechart");
Ext.BLANK_IMAGE_URL = 'ext/resources/images/default/s.gif';

var visualConfigs = {
	'PieChart': {
		id:'PieChart',
		title: 'My Daily Activities',
		xtype: 'googlevisualizationcomponent',
		visualizationType: 'PieChart',
		visualizationConfig: {
			width: 500,
			height: 440,
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
                        width: 520,
                        height: 440,
                        closeAction: 'hide',
                        plain: true,
                        items:[pie],
						tbar:[
						'<span style="color:#555555; font-size:15px;font-weight:bold">EEG Energiequellen im ZGB</span>','->'
							]
                        ,buttons: [{
                            text: 'Close',
                            handler: function () {
                                win.hide()
                            }
                        }]
                    }); 
                win1.show(this)
            }
            
        }
    });
