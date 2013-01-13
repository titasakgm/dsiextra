    // create the Data Store
    var store = new Ext.data.Store({
        // load using HTTP
        url: '/cgi-bin/mapserv?SERVICE=WMS&REQUEST=GetCapabilities&map=/ms603/map/wms-dsi-extra.map',

        // the return will be XML, so lets set up a reader
        reader: new Ext.data.XmlReader({
               // records will have an "Item" tag
               record: 'Layer',
               id: 'Name',
               totalRecords: '@total'
           }, [
               // set up the fields mapping into the xml doc
               // The first needs mapping, the others are very basic
               'Name' , 
	       'Title'
           ])
    });

    // create the grid
    var grid_metadata = new Ext.grid.GridPanel({
	id:"selectable_grid",
        store: store,
        columns: [
            {header: 'Name', width: 200, dataIndex: 'name', sortable: true},
            {header: 'Title', width: 200, dataIndex: 'title', sortable: true}
        ],
	sm: new Ext.grid.RowSelectionModel({singleSelect: true}),
	viewConfig: {
	  forceFit: true
	},		
        height:250,
	split: true,
	region: 'north'
    });
	
	
	// define a template to use for the detail view
	var bookTplMarkup = [
		'Name: {name} ({title})<br/>'
	];
	var bookTpl = new Ext.Template(bookTplMarkup);

	
	grid_metadata.getSelectionModel().on('rowselect', function(sm, rowIdx, r) {
		var detailPanel = Ext.getCmp('detailPanel');
		bookTpl.overwrite(detailPanel.body, r.data);
	});
    store.load();
