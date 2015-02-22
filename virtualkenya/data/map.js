/*
*
* File: map.js
* Application to display a MAp using Openlayers,Geoext and extjs
*Author:wanjohi kibui
*/
 Ext.require([
    'Ext.container.Viewport',
    'GeoExt.panel.Map',
    'GeoExt.data.FeatureStore',
    'GeoExt.grid.column.Symbolizer',
    'GeoExt.selection.FeatureModel',
    'Ext.grid.GridPanel',
    'Ext.layout.container.Accordion',
    'Ext.chart.*',
    'GeoExt.tree.LayerContainer',
    'GeoExt.panel.Legend',
    'Ext.tree.plugin.TreeViewDragDrop',
    'GeoExt.tree.View',
    'GeoExt.data.MapfishPrintProvider',
    'GeoExt.plugins.PrintExtent'
]);
 
Ext.application({
    name: 'Events Visualizer',
    launch: function(){
 
        var map = new OpenLayers.Map("map-id",{
            controls: [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.ArgParser(),
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.LayerSwitcher(),
            new OpenLayers.Control.MousePosition(),
            new OpenLayers.Control.OverviewMap(),
            new OpenLayers.Control.Scale(),
            new OpenLayers.Control.PanZoomBar(),
            new OpenLayers.Control.KeyboardDefaults()
    ]
        });
        var wms = new OpenLayers.Layer.WMS(
            "OpenLayers WMS",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
                {layers: 'basic'},
                {isBasiclayer: true},
                {visibility:false},
                {displayInLayerSwitcher: true}
        );
        /*var google_layer = new OpenLayers.Layer.Google(
            'Google Map Layer',
            {layer: 'basic'},
            {isBasiclayer: true}
        );*/
        var context = {
            getColor: function(feature) {
                if (feature.attributes.area > 2) {
                    return 'green';
                }
                if (feature.attributes.area > 1) {
                    return 'orange';
                }
                return 'red';
            }
        };
        var template = {
            cursor: "pointer",
            fillOpacity: 0.5,
            fillColor: "${getColor}",
            pointRadius: 5,
            strokeWidth: 1,
            strokeOpacity: 1,
            strokeColor: "${getColor}",
            graphicName: "circle"
        };
        var style = new OpenLayers.Style(template, {context: context});

        var towns = new OpenLayers.Layer.Vector("Towns", {
            styleMap: new OpenLayers.StyleMap({
                'default': style
            }),
            protocol: new OpenLayers.Protocol.HTTP({
                url: "data/towns.json",
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()],
            isBasiclayer: false,
            displayInLayerSwitcher: true,
            //visibility:false
        });
        var roads = new OpenLayers.Layer.Vector("Roads", {
            styleMap: new OpenLayers.StyleMap({
                'default': style
            }),
            protocol: new OpenLayers.Protocol.HTTP({
                url: "data/roads.json",
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()],
            displayInLayerSwitcher: true,
            isBasiclayer: false,
            //visibility:false,
        });
         /*// The printProvider that connects us to the print service
        printProvider = Ext.create('GeoExt.data.MapfishPrintProvider', {
            method: "GET", // "POST" recommended for production use
            capabilities: printCapabilities, // from the info.json script in the html
            customParams: {
                mapTitle: "Printing Demo",
                comment: "This is a map printed from GeoExt."
            }
        });
    
        var printExtent = Ext.create('GeoExt.plugins.PrintExtent', {
            printProvider: printProvider
        });*/
        map.addLayers([wms,towns,roads]);
        map.setCenter(new OpenLayers.LonLat(34.449,-0.1589),5);
           //adding a popup panel for our layer 'towns'
           var popup;
          function createPopup(feature) {
              // close existing popup
                if (popup) {
                        popup.destroy();
                    }
              popup = new GeoExt.Popup({
                     title: "Kenya Towns",
                     location: feature,
                     width:200,
                     height: 100,
                     html: feature.attributes.town_name + "<br/>" + feature.attributes.area + "<br/>",
                     maximizable: true,
                     collapsible: true,
                     //items:items[0]
              });
              popup.show();
          }

          towns.events.on({
            featureselected: function(e) {
              createPopup(e.feature);
            }
          });
         // create feature store, binding it to the vector layer
        var store = Ext.create('GeoExt.data.FeatureStore', {
            layer: towns,
            enablePaging: true,
            pageSize: 19,
            fields: [
                {
                    name: 'symbolizer',
                    convert: function(v, r) {
                        return r.raw.layer.styleMap.createSymbolizer(r.raw, 'default');
                    }
                },
                {name: 'town_name', type: 'string'},
                {name: 'area', type: 'float'}
            ],
            autoLoad: true
        });
        var chart1 = Ext.create('Ext.chart.Chart',{
            animate: true,
            store: store,
            //height:500,
            //width:340,
            //layout:'fit',
            legend:{
                visible:true,
                position:'right',
                labelFont:'10px Comic Sans MS'
            },
            margin:'30 0 0 0',
            //autoHeight:true,
            //insetPadding: 30,
            background: {
                    gradient: {
                    id: 'backgroundGradient',
                    stops: {
                        0: {
                            color: '#ffffff'
                        },
                        100: {
                            color: '#eaf1f8'
                        }
                    }
                    }
            },
            axes: [{
                type: 'Numeric',
                minimum: 0,
                position: 'left',
                fields: ['area'],
                title: 'Area',
                grid: true,
                label: {
                    renderer: Ext.util.Format.numberRenderer('0,0'),
                    font: '10px Arial'
                }
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['town_name'],
                title: 'Name',
                grid:true,
                label: {
                    rotate: {
                        degrees: 270
                    }
                }
            }],
            series: [{
                type: 'line',
                axis: 'left',
                xField: 'town_name',
                yField: 'area',
                showInLegend:true,
                label:{
                    field:'town_name',
                    contrast:true,
                    font:'18px Arial'
                },
                listeners: {
                  itemmouseup: function(item) {
                      Ext.example.msg('Item Selected', item.value[1] + ' The area ' + Ext.Date.monthNames[item.value[0]]);
                  }  
                },
                tips: {
                    trackMouse: true,
                    width: 80,
                    height: 40,
                    renderer: function(storeItem, item) {
                        this.setTitle(storeItem.get('town_name'));
                        this.update(storeItem.get('area'));
                    }
                },
                style: {
                    fill: '#38B8BF',
                    stroke: '#38B8BF',
                    'stroke-width': 3
                },
                markerConfig: {
                    type: 'circle',
                    size: 4,
                    radius: 4,
                    'stroke-width': 0,
                    fill: '#38B8BF',
                    stroke: '#38B8BF'
                }
            }]
        });
        var chartPanel = new Ext.Panel({
            title:'Visualization Charts',
            //cls:'empty',
            layout:'fit',
            tbar: [{
                    text: 'Save Chart',
                    handler: function() {
                        Ext.MessageBox.confirm('Confirm Download', 'Download the chart as image?', function(choice){
                            if(choice == 'yes'){
                                Chart.save({
                                    type: 'image/png'
                                });
                            }
                        });
                    }
                    }, 
                    {
                        text: 'Reload Chart',
                        handler: function() {
                            // Add a short delay to prevent fast sequential clicks
                            window.loadTask.delay(100, function() {
                                store.loadData(generateData());
                            });
                        }
                    }
            ],
            items:[chart1]
        });
        var griddata = new Ext.Panel({
            title:'Grid Preview',
            layout:'fit',
            //flex:1,
            items:[
                {
                    xtype: 'grid',
                    store:store,
                    autoScroll:true,
                    //autoHeight:true,
                    //width:'100%',
                    layout:'fit',
                    movable:false,
                    columnLines: true,
                    viewConfig: {
                        stripeRows: true,
                        enableTextSelection: true
                    },
                    tbar: [{
                        xtype: 'button',
                        text: 'Edit',
                        itemId: 'editButton',
                        active:false
                    },
                    {
                        xtype: 'button',
                        text: 'Delete',
                        action: 'Delete'
                    },
                    {
                        xtype: 'button',
                        text: 'Add',
                        action: 'AddUser'
                    },
                    {
                        xtype:'combo',
                        fieldlabel:'Search',
                        emptyText:'Search Event',
                        queryMode: 'local',
                        store:store,
                        displayField:'area',
                        valueField:'feature',
                        typeAhead:true,
                        listeners: {
                            select: function(combo, value, options){
                                filters
                                event.getStore().filter('area', combo.
                                    getValue());
                                event.getStore().clearFilter();
                            }
                        }
                    }   
                    ],
                     //bbar:pagingBar,
                    columns: [{
                        menuDisabled: true,
                        //sortable: false,
                        flex:0.05,
                        xtype: 'gx_symbolizercolumn',
                        dataIndex: "symbolizer"
                        },{
                        header: "Name",
                        flex:0.3,
                        dataIndex: "town_name"
                        }, {
                        header: "area",
                        flex:0.1,
                        dataIndex: "area"
                        }
                    ],
                    selType: 'featuremodel'
                }
            ]
        });
        var length = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
            eventListeners: {
                measure: function(evt) {
                    alert("Length = " + evt.measure + evt.units);
                }
            }
        });
        var area = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
            eventListeners: {
                measure: function(evt) {
                    alert("Area = " + evt.measure + evt.units);
                }
            }
        });
        var lengthButton = new Ext.Button({
            text: 'Measure Length',
            enableToggle: true,
            //toggleGroup: toggleGroup,
            handler: function(toggled){
                if (toggled) {
                    length.activate();
                } else {
                    length.deactivate();
                }
            }
        });

        var areabutton = new Ext.Button({
            text: 'Measure Area',
            enableToggle: true,
            //toggleGroup: toggleGroup,
            handler: function(toggled){
                if (toggled) {
                    area.activate();
                } else {
                    area.deactivate();
                }
            }
        });
        var mapPanel = Ext.create('GeoExt.panel.Map', {
            title: 'Events Viewer',
            map: map,
            fallThrough: true,
            layout:'fit',
            region:'center',
            /*plugins: [printExtent],
            bbar: [{
                text: "Create PDF",
                handler: function() {
                    // the PrintExtent plugin is the mapPanel's 1st plugin
                    mapPanel.plugins[0].print();
                }
            }],*/
            tbar:
                [lengthButton,
                    {
                        xtype: 'button',
                        text: 'Zoom To Extents',
                    },
                    {
                        xtype: 'button',
                        text: 'Pan',
                    },
                    {
                        id: 'measure_menu',
                        text: 'Measure',
                        menu: [
                            {text: 'Point',
                            handler:function(){
                            alert("draw your feature");
                            }},
                            {
                                text: 'Line',
                                enableToggle: true,
                                handler: function(toggled){
                                    if (toggled) {
                                        length.activate();
                                    } else {
                                        length.deactivate();
                                    }
                                }
                            },
                            {
                                text: 'Area',
                                enableToggle: true,
                                handler: function(toggled){
                                    if (toggled) {
                                        area.activate();
                                    } else {
                                        area.deactivate();
                                    }
                                }
                            },
                        ]
                    },
                    {
                        id: 'print_menu',
                        text: 'Print',
                        menu: [
                            {text: 'Print Preview'},
                            {text: 'Print'},
                            {text: 'Print Settings'},
                        ]
                    },
                    {
                        xtype: 'textfield',
                        align:'right',
                        Tooltip: 'Search Map',
                        emptyText:'Search Map'
                    },
                ]
        });
        var storeTree = Ext.create('Ext.data.TreeStore',{
            model:'GeoExt.data.LayerTreeModel',
            root:{
                expanded:true,
                children:[
                {
                    plugins:[{
                        ptype:'gx_layercontainer',
                        store:map.layers
                    }],
                    expanded:true,
                    text:'Layers'
                },
                {
                    plugins:['gx_baselayercontainer'],
                    expanded:false,
                    text:'BaseMaps'
                },
                {
                    plugins:['gx_overlaylayercontainer'],
                    expanded:true,
                    text:'OverLay Layers'
                }]
            }
        });
        var tree = Ext.create('GeoExt.tree.Panel',{
            title:'Map Layers',
            autoScroll:true,
            viewConfig:{
                plugins:[{
                    ptype:'treeviewdragdrop',
                    appendOnly:true
                }]
            },
            store:storeTree,
            rootVisible:true,
            lines:true
        });
        var myaccordioneast = new Ext.Panel({
            title:'Data Preview',
            region:'east',
            //margin:'5 0 5 5',
            split:true,
            width:'30%',
            layout:'accordion',
            collapsible:true,
            items:[griddata]
        });
        var myaccordionwest = new Ext.Panel({
            title:'Data Visualization',
            region:'west',
            layout:'fit',
            //margin:'5 0 5 5',
            split:true,
            width:'27%',
            layout:'accordion',
            collapsible:true,
            items:[tree,
            /*{
                xtype: "treepanel",
                ref: "tree",
                title:'Layers',
                //region: "west",
                width: 200,
                store:storeTree,
                autoScroll: true,
                enableDD: true,
                root:{
                expanded:true,
                children:[
                {
                    plugins:[{
                        ptype:'gx_layercontainer',
                        store:mapPanel.layers
                    }],
                    expanded:true
                },
                {
                    plugins:['gx_baselayercontainer'],
                    expanded:true,
                    text:'BaseMaps'
                },
                {
                    plugins:['gx_overlaylayercontainer'],
                    expanded:true,
                }]
            }
                root: new GeoExt.tree.LayerContainer({
                    expanded: true
                })

            },*/
            chartPanel]
        });
        mapPanel.map.addControl(length);
        mapPanel.map.addControl(area);
        var selectCtrl = new OpenLayers.Control.SelectFeature(towns);
        mapPanel.map.addControl(selectCtrl);
        selectCtrl.activate();
        map.addControl(new OpenLayers.Control.WMSGetFeatureInfo({
            autoActivate: true,
            infoFormat: "application/vnd.ogc.gml",
            maxFeatures: 3,
            eventListeners: {
                "getfeatureinfo": function(e) {
                    var items = [];
                    Ext.each(e.features, function(feature) {
                        items.push({
                            xtype: "propertygrid",
                            title: feature.fid,
                            source: feature.attributes
                        });
                    });
                    new GeoExt.Popup({
                        title: "Feature Info",
                        width: 200,
                        height: 200,
                        layout: "accordion",
                        map: mapPanel,
                        location: e.xy,
                        items: items
                    }).show();
                }
            }
        }));
        // create grid panel configured with feature store
        Ext.create('Ext.container.Viewport', {
            layout: 'border',
            renderTo: Ext.getBody(),
            items: [mapPanel,myaccordioneast,myaccordionwest,
                {
                    region:'south',
                    title:'Transforming ideas into reality'

                },
                {
                    region:'north',
                    height:70,
                    //width:'100%',
                    //xtype: 'container',
                    html:'Mapping Center',
                    style:"background-image:url(data/images/logo2.jpg) !important"

                }
                ]  
                    
        });

    //printExtent.addPage();
    }
});