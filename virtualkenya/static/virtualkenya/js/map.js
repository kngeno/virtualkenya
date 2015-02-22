/*
*
* File: map.js
* Application to display a MAp using Openlayers,Geoext and extjs
*Author:Ngeno
*/
 Ext.require([
    'Ext.container.Viewport',
    'Ext.window.MessageBox',
    'GeoExt.panel.Map',
    'GeoExt.data.FeatureStore',
    'GeoExt.grid.column.Symbolizer',
    'GeoExt.selection.FeatureModel',
    'Ext.grid.GridPanel',
    'Ext.layout.container.Accordion',
    'Ext.chart.*',
    'Ext.toolbar.Paging',
    'GeoExt.container.WmsLegend',
    //'GeoExt.container.UrlLegend',
    //'GeoExt.container.VectorLegend',
    'GeoExt.panel.Legend',
    'Ext.tree.plugin.TreeViewDragDrop',
    'GeoExt.window.Popup',
    'GeoExt.data.MapfishPrintProvider',
    'GeoExt.plugins.PrintExtent',
    'GeoExt.tree.LayerContainer',
    'GeoExt.tree.OverlayLayerContainer',
    'GeoExt.tree.BaseLayerContainer',
    'GeoExt.data.LayerTreeModel',
    'GeoExt.Action'
]);
 
Ext.application({
    name: 'app',
    splashscreen: {},
    init: function() {
        splashscreen = Ext.getBody().mask('Loading Please Wait' , 'splashscreen');
        splashscreen.addCls('splashscreen');
        Ext.DomHelper.insertFirst(Ext.query('.x-mask-msg')[0], {
            cls: 'x-splash-icon'
        });
    },
    launch: function(){
        var task = new Ext.util.DelayedTask(function(){
            splashscreen.fadeOut({
            duration:1000,
            remove:true
            });
            splashscreen.next().fadeOut({
            duration:1000,
            remove:true,
            listeners:{
            afteranimate:function(el,startTime,eOpts){
            }}
            });
            Ext.getBody().unmask();
        
        });
        var map = new OpenLayers.Map("map-id",{
            controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.ArgParser(),
                new OpenLayers.Control.Attribution(),
                //new OpenLayers.Control.LayerSwitcher(),
                new OpenLayers.Control.MousePosition(),
                new OpenLayers.Control.OverviewMap(),
                new OpenLayers.Control.Scale(),
                new OpenLayers.Control.PanZoomBar(),
                new OpenLayers.Control.KeyboardDefaults()
            ]
        },
        {projection: "EPSG:4326",units: 'degrees'}
        );
        var wms = new OpenLayers.Layer.WMS(
            "OpenLayers WMS",
            "http://vmap0.tiles.osgeo.org/wms/vmap0",
                {layers: 'basic'},
                {isBasiclayer: true},
                {visibility:false},
                {displayInLayerSwitcher: true}
        );
        var turk = new OpenLayers.Layer.WMS(
            "Turkana Boundary",
            "http://maps.virtualkenya.org/geoserver/geonode/wms",
                {layers: 'geonode:turkbnd'},
                {isBasiclayer: false},
                {visibility:true},
                {displayInLayerSwitcher: true}
        );
        var turksand = new OpenLayers.Layer.WMS(
            "Turkana Sand Dam",
            "http://maps.virtualkenya.org/geoserver/geonode/wms",
                {layers: 'geonode:turkana_sanddam'},
                {isBasiclayer: false},
                {visibility:true},
                {displayInLayerSwitcher: true}
        );
        var marsabit = new OpenLayers.Layer.WMS(
            "Marsabit range Condition",
            "http://maps.virtualkenya.org/geoserver/geonode/wms",
                {layers: 'marsabit_rangecondition'},
                {isBasiclayer: false},
                {visibility:true},
                {displayInLayerSwitcher: true}
        );
        var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
        var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
        var position       = new OpenLayers.LonLat(36.949,-0.3689);
        var zoom           = 10; 
        /*var google = new OpenLayers.Layer.Google(
            'Google Map Layer',
            {layer: 'basic'},
            {isBasiclayer: true}
        );
        /*var business = new OpenLayers.Layer.Vector("Business Locations", {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: new OpenLayers.Protocol.WFS({
              url: 'http://localhost:8080/geoserver/wfs',
              featurePrefix:"working",
              featureType: "bussiness",
              featureNS: "http://localhost:8080/geoserver/working",
              srsName: "EPSG:900913",
              geometryName: "the_geom",
              version: "1.1.0"
            })
          });*/
        var OSM = new OpenLayers.Layer.OSM("OpenStreetMap");
        var county = new OpenLayers.Layer.Vector("Nyeri County", {
            protocol: new OpenLayers.Protocol.HTTP({
                url: "data/county.json",
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()],
            isBasiclayer: false,
            displayInLayerSwitcher: true,
            //visibility:false
        });
        var context = {
            getColor: function(feature) {
                if (feature.attributes.permit == 'Yes') {
                    return 'green';
                }
                if (feature.attributes.permit == 'No') {
                    return 'red';
                }
                return 'orange';
            }
        };
        var template = {
            cursor: "pointer",
            fillOpacity: 0.5,
            fillColor: "${getColor}",
            pointRadius: 10,
            strokeWidth: 1,
            strokeOpacity: 1,
            strokeColor: "${getColor}",
            graphicName: "circle"
        };
        var style = new OpenLayers.Style(template, {context: context});

        var health = new OpenLayers.Layer.Vector("Health Facilities", {
            protocol: new OpenLayers.Protocol.HTTP({
                url: "data/health.json",
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()],
            isBasiclayer: false,
            displayInLayerSwitcher: true,
            //visibility:false
        });
        var business = new OpenLayers.Layer.Vector("Business Locations", {
            styleMap: new OpenLayers.StyleMap({
                'default': style
            }),
            protocol: new OpenLayers.Protocol.HTTP({
                url: "data/business.json",
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()],
            isBasiclayer: false,
            displayInLayerSwitcher: true,
            //visibility:false
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
        map.addLayers([health,county,wms,business,turk,turksand,marsabit]);
        map.setCenter(position, zoom );
         // create select feature control
        var selectCtrl = new OpenLayers.Control.SelectFeature(business);
           //adding a popup panel for our layer 'towns'
           var popup;
          function createPopup(feature) {
              // close existing popup
                if (popup) {
                        popup.destroy();
                    }
              popup = new GeoExt.Popup({
                     title: "Health facility",
                     location: feature,
                     width:200,
                     height: 150,
                     html: "<br/> F_name:" + feature.attributes.f_name + "<br/> L_Name:" + feature.attributes.l_name + "<br/>BS Name :" + feature.attributes.bussiness_ + "<br/>Permit :" + feature.attributes.permit + "<br/>Type:"+ feature.attributes.type +"<br/>",
                     maximizable: true,
                     collapsible: true,
                     //items:items[0]
              });
              popup.on({
                close: function() {
                    if(OpenLayers.Util.indexOf(towns.selectedFeatures,
                                               this.feature) > -1) {
                        selectCtrl.unselect(this.feature);
                    }
                }
            });
              popup.show();
          }

          business.events.on({
            featureselected: function(e) {
              createPopup(e.feature);
            }
          });
         // create feature store, binding it to the vector layer
        var store1 = Ext.create('GeoExt.data.FeatureStore', {
            layer: county,
            enablePaging:true,
            pageSize:8,
            fields: [
                {
                    name: 'symbolizer',
                    convert: function(v, r) {
                        return r.raw.layer.styleMap.createSymbolizer(r.raw, 'default');
                    }
                },
                {name: 'kenya_id', type: 'float'},
                {name: 'division_b', type: 'string'},
                {name: 'males', type: 'float'},
                {name: 'females', type: 'float'},
                {name: 'total', type: 'float'}
            ],
            autoLoad: true
        });
        var store = Ext.create('GeoExt.data.FeatureStore', {
            layer: business,
            enablePaging:true,
            pageSize:8,
            fields: [
                {
                    name: 'symbolizer',
                    convert: function(v, r) {
                        return r.raw.layer.styleMap.createSymbolizer(r.raw, 'default');
                    }
                },
                {name: 'f_name', type: 'string'},
                {name: 'l_name', type: 'string'},
                {name: 'contacts', type: 'float'},
                {name: 'bussiness_', type: 'string'},
                {name: 'permit', type: 'string'},
                {name: 'renewal_da', type: 'date'},
                {name: 'type', type: 'string'}
            ],
            autoLoad: true
        });
        chart = Ext.create('Ext.chart.Chart', {
            xtype: 'chart',
            animate: true,
            store: store1,
            shadow: true,
            legend: {
                position: 'right'
            },
            insetPadding: 60,
            theme: 'Base:gradients',
            series: [{
                type: 'pie',
                field: 'total',
                showInLegend: true,
                //donut: donut,
                tips: {
                  trackMouse: true,
                  width: 140,
                  height: 28,
                  renderer: function(storeItem, item) {
                    //calculate percentage.
                    var total = 0;
                    store1.each(function(rec) {
                        total += rec.get('total');
                    });
                    this.setTitle(storeItem.get('division_b') + ': ' + Math.round(storeItem.get('total') / total * 100) + '%');
                  }
                },
                highlight: {
                  segment: {
                    margin: 20
                  }
                },
                label: {
                    field: 'total',
                    display: 'rotate',
                    contrast: true,
                    font: '18px Arial'
                }
            }]
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
        var chartGrouped = Ext.create('Ext.chart.Chart',{
            animate: true,
            store: store1,
            margin:'20 0 5 5',
            //autoHeight:true,
            //insetPadding: 30,
            legend: {
                position: 'top'
            },
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
                fields: ['males','females'],
                title: 'Population',
                grid: true,
                label: {
                    renderer: Ext.util.Format.numberRenderer('0,0'),
                    font: '10px Arial'
                }
            }, {
                type: 'Category',
                position: 'bottom',
                fields: ['division_b'],
                title: 'Constituency',
                label: {
                    rotate: {
                        degrees: 270
                    }
                }
            }],
            series: [{
                type: 'column',
                axis: 'left',
                xField: 'division_b',
                highlight: true,
                yField: ['males','females'],
                tips: {
                    trackMouse: true,
                    width: 80,
                    height: 40,
                    renderer: function(storeItem, item) {
                        this.setTitle(storeItem.get('division_b'));
                        this.update(storeItem.get('males','females'));
                    }
                },
            },
            ]
        });
        var infoPanel= new Ext.Panel({
                title:'County Information',
                id:'info',
                //layout:'fit',
                border:false,
                autoLoad:{
                  url:'../county.html'
                }
        });
        var analysisPanel= new Ext.Panel({
                title:'More Analysis',
                //layout:'fit',
                border:false,
                bodyPadding: '5 5 0',
                html:'<br>Click on a button to launch analysis tool',
                items:[
                {
                    xtype:'button',
                    text:'Click here',
                    //padding:'20 20 15 0',
                    handler: function(){
                        visual.show();
                    }
                }
                ]
        });
        var login = Ext.create('Ext.window.Window', {
                width: 300,
                height: 130,
                closeAction:'hide',
                title: 'User Login',
                //layout: 'anchor',
                items: [{
                    xtype:'form',
                    id:'loginform',
                    border:0,
                    bodyPadding: '5 5 0',
                    items:[{
                            xtype: 'textfield',
                            id:'textuser',
                            fieldLabel: 'Username',
                            emptyText:'Enter username'
                        }, {
                            xtype: 'textfield',
                            fieldLabel: 'Password',
                            id:'textpass',
                            inputType: 'password',
                            emptyText:'Enter password'
                        }],
                        buttons: ['->', {
                                xtype: 'button',
                                text: 'Login',
                            }, {
                                xtype: 'button',
                                text: 'Clear',
                                handler: function() {
                                        Ext.getCmp('loginform').getForm().reset();
                                    }
                            }
                        ]
                    }
                ]
            }
        );
        var details = Ext.create('Ext.tab.Panel', {
            autoHeight:true,
            activeTab: 0,
            items: [
                {
                    xtype: 'panel',
                    title: 'Bar Visualization',
                    id: 'chartpanel',
                    layout: 'fit',
                    items:[chartGrouped],
                    autoScroll:true,
                },
                {
                    xtype: 'panel',
                    title: 'Pie Chart Visualization',
                    //id: 'chartpanel',
                    layout: 'fit',
                    items:[chart],
                    autoScroll:true,
                }
            ],
            //renderTo : Ext.getBody()
        }); 
        var visual = Ext.create('Ext.window.Window', {
                width: 800,
                height:600,
                closeAction:'hide',
                layout:'fit',
                title: 'Analysis Visualization',
                draggable: true,
                resizable: true,
                minimizable: true,
                maximizable: true,
                minHeight:400,
                minWidth:500,
                items: [details]
            }
        );
        var griddata = new Ext.Panel({
            //title:'Grid Preview',
            layout:'fit',
            //flex:1,
            //bbar:pagingBar,
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
                    plugins: [
                            'bufferedrenderer',
                        {
                            xclass: 'Ext.grid.plugin.RowEditing',
                            clicksToMoveEditor: 2,
                            autoCancel: false
                        }
                    ],
                    tbar: [
                    {
                        xtype:'combo',
                        fieldlabel:'Search',
                        emptyText:'Search Event',
                        queryMode: 'local',
                        store:store,
                        displayField:'bussiness_',
                        valueField:'feature',
                        typeAhead:true,
                        listeners: {
                            select: function(combo, value, options){
                                filters
                                event.getStore().filter('bussiness_', combo.
                                    getValue());
                                event.getStore().clearFilter();
                            }
                        }
                    }   
                    ],
                    bbar:[{
                        html:"Business location navigation..............."
                        }
                    ],
                    columns: [{
                        menuDisabled: true,
                        //sortable: false,
                        flex:0.05,
                        xtype: 'gx_symbolizercolumn',
                        dataIndex: "symbolizer"
                        },{
                        header: "First Name",
                        flex:0.1,
                        dataIndex: "f_name"
                        }, {
                        header: "Last Name",
                        flex:0.1,
                        dataIndex: "l_name"
                        },
                        {
                        header: "Business Name",
                        flex:0.1,
                        dataIndex: "bussiness_"
                        }, {
                        header: "Type",
                        flex:0.1,
                        dataIndex: "type"
                        },
                        {
                        header: "Permit",
                        flex:0.1,
                        dataIndex: "permit"
                        },
                        {
                        header: "Renewal Date",
                        flex:0.1,
                        dataIndex: "renewal_da"
                        },
                        {
                        xtype: 'actioncolumn',
                        hideable: false,
                        items: [{
                            icon: 'data/images/delete.gif',
                            tooltip: 'Delete Record',
                            scope: this,
                            handler: function(griddata, rowIndex){
                                griddata.getStore().removeAt(rowIndex);
                            }
                        }]
                        },
                    ],
                    selType: 'featuremodel'
                }
            ]
        });
        var length = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
            immediate: true,
            eventListeners: {
                measure: function(evt) {
                    //alert("Length = " + evt.measure + evt.units);
                    Ext.MessageBox.show({
                            title: 'Line length :',
                            buttons: Ext.MessageBox.OK,
                            width:200,
                            msg:"Line Length: " + evt.measure.toFixed(2) + " " + evt.units
                        }
                    );
                }
            },
            persist: true
        });
        var area = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
            immediate: true,
            eventListeners: {
                measure: function(evt) {
                    Ext.MessageBox.show({
                            title: 'Area :',
                            buttons: Ext.MessageBox.OK,
                            width:200,
                            msg:"Area: " + evt.measure.toFixed(2) + " " + evt.units
                        }
                        );
                }
            },
            persist: true
        });
        var toggleGroup = "Measure";
        var lengthButton = new Ext.Button({
            text: 'Length',
            enableToggle: true,
            toggleGroup: toggleGroup,
            handler: function(toggled){
                if (toggled) {
                    length.activate();
                } else {
                    length.deactivate();
                }
            }
        });

        var areaButton = new Ext.Button({
            text: 'Area',
            enableToggle: true,
            toggleGroup: toggleGroup,
            handler: function(toggled){
                if (toggled) {
                    area.activate();
                } else {
                    area.deactivate();
                }
            }
        });
        var ctrl, toolbarItems = [], action, actions = {};
        
        // ZoomToMaxExtent control, a "button" control
        action = Ext.create('GeoExt.Action', {
            control: new OpenLayers.Control.ZoomToMaxExtent(6),
            map: map,
            text: "Zoom To MaxExtent",
            tooltip: "zoom to max extent"
        });
        actions["max_extent"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push("-");
        // pan control, a "button" control
        action = Ext.create('GeoExt.Action', {
            control: new OpenLayers.Control.Pan(),
            map: map,
            allowDepress: false, 
            toggleGroup: "navigate", 
            group: "navigate", 
            text: "Pan",
            //icon:'../kenya/data/images/pan.gif',
            tooltip: "Pan"
        });
        actions["pan"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push("-");
        //draw zoom box
        //var zoom_box = new OpenLayers.Control.ZoomBox(); 
        action = Ext.create('GeoExt.Action', {
            text:'Zoom',
            control: new OpenLayers.Control.ZoomBox(), 
            map: map, 
            allowDepress: false, 
            //icon: "./img/zoom-world-mini.png", 
            tooltip: "Zoom by drawing a box on map", 
            toggleGroup: "navigate", 
            group: "navigate" 
        }); 
        actions["zoom_box"] = action; 
        toolbarItems.push(Ext.create('Ext.button.Button', action)); 
        toolbarItems.push("-"); 
        //zoom in control
        action = Ext.create('GeoExt.Action', {
            text:'zoom in',
            control: new OpenLayers.Control.ZoomIn(), 
            map: map, 
            tooltip: "Zoom in" 
        }); 
        actions["zoom_in"] = action; 
        toolbarItems.push(Ext.create('Ext.button.Button',action)); 
        toolbarItems.push("-"); 
        //zoom out control
        action = Ext.create('GeoExt.Action', {
            text:'zoom out',
            control: new OpenLayers.Control.ZoomOut(), 
            map: map, 
            tooltip: "Zoom out" 
        }); 
        actions["zoom_out"] = action; 
        toolbarItems.push(Ext.create('Ext.button.Button',action)); 
        toolbarItems.push("-"); 
        //identify features
        action = Ext.create('GeoExt.Action', {
            text: "Identify",
            toggleGroup:"navigate",
            group: "navigate",
            control: new OpenLayers.Control.SelectFeature(business, {
                type: OpenLayers.Control.TYPE_TOGGLE,
                hover: false
            }),
            map: map,
            allowDepress:true,
            enableToggle: true,
            tooltip: "Identify features"
        });
        actions["select"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push("-");
        //measure tools-length
        action = Ext.create('GeoExt.Action', {
            text: "Length",
            toggleGroup:"navigate",
            group: "navigate",
            enableToggle:true,
            allowDepress:true,
            tooltip:'Measure Length',
            map: map,
            control: new OpenLayers.Control.Measure(OpenLayers.Handler.Path , {
                eventListeners: {
                    measure: function(evt) {
                        Ext.MessageBox.show({
                            title: 'Line length :',
                            buttons: Ext.MessageBox.OK,
                            width:200,
                            msg:"Line Length: " + evt.measure.toFixed(2) + " " + evt.units
                        });
                    }
                }
            })
        }); 
        actions["length"] = action; 
        toolbarItems.push(Ext.create('Ext.button.Button',action)); 
        toolbarItems.push("-"); 
        //measure area
        action = Ext.create('GeoExt.Action', {
            text: "area",
            toggleGroup:"navigate",
            group: "navigate",
            enableToggle:true,
            allowDepress:true,
            tooltip:'Measure Area',
            map: map,
            control: new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon , {
                eventListeners: {
                    measure: function(evt) {
                        Ext.MessageBox.show({
                            title: 'Area :',
                            buttons: Ext.MessageBox.OK,
                            width:200,
                            msg:"Area: " + evt.measure.toFixed(2) + " " + evt.units
                        });
                    }
                }
            })
        }); 
        actions["area"] = action; 
        toolbarItems.push(Ext.create('Ext.button.Button',action)); 
        toolbarItems.push("-"); 
        // Navigation history - two "button" controls
        ctrl = new OpenLayers.Control.NavigationHistory();
        map.addControl(ctrl);
        
        action = Ext.create('GeoExt.Action', {
            text: "previous",
            control: ctrl.previous,
            disabled: true,
            tooltip: "previous action"
        });
        actions["previous"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        
        action = Ext.create('GeoExt.Action', {
            text: "next",
            control: ctrl.next,
            disabled: true,
            tooltip: "next "
        });
        actions["next"] = action;
        toolbarItems.push(Ext.create('Ext.button.Button', action));
        toolbarItems.push("->");
        toolbarItems.push(Ext.create('Ext.button.Button',{
            text: 'Login',
            handler: function() {
                login.show();
            }
        }
        ));
        var mapPanel = Ext.create('GeoExt.panel.Map', {
            title: 'Map Viewer',
            map: map,
            //minWidth:'30%',
            fallThrough: true,
            layout:'fit',
            region:'center',
            tbar:toolbarItems,
            /*listeners: {
                render: function(p){
                    p.body.mask('Loading..Please wait....');
                },
                delay: 2
            }*/
            //bbar:[areaButton,lengthButton]
        });
        var legendPanel= new Ext.Panel({
                title:'Map Legend',
                layout:'fit',
                border:false,
                items:[
                    {
                        xtype: "gx_legendpanel",
                        autoScroll: true,
                        border:false,
                        padding: 20
                    }
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
                    allowDD:true,
                    text:'Layers'
                },
                {
                    plugins:['gx_baselayercontainer'],
                    expanded:true,
                    allowDD:true,
                    text:'BaseMaps'
                },
                {
                    plugins:['gx_overlaylayercontainer'],
                    expanded:true,
                    allowDD:true,
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
            rootVisible:false,
            lines:true
        });
        var myaccordioneast = new Ext.Panel({
            title:'Data Preview',
            region:'east',
            width:'20%',
            layout:'accordion',
            collapsible:true,
            items:[legendPanel,analysisPanel]
        });
        var myaccordionwest = new Ext.Panel({
            title:'Data Visualization',
            region:'west',
            split:true,
            collapsible:true,
            width:'20%',
            layout:'accordion',
            items:[tree]
        });
        mapPanel.map.addControl(length);
        mapPanel.map.addControl(area);
        var selectCtrl = new OpenLayers.Control.SelectFeature(business);
        mapPanel.map.addControl(selectCtrl);
        selectCtrl.activate();
        // create grid panel configured with feature store
        Ext.create('Ext.container.Viewport', {
            layout: 'border',
            renderTo: Ext.getBody(),
            items: [mapPanel,myaccordioneast,myaccordionwest,
                {
                    region:'south',
                    height:'40%',
                    collapsible:true,
                    collapsed:true,
                    layout:'fit',
                    split:true,
                    title:'Grid View',
                    //autoScroll:true,
                    items:[griddata]

                },
                {
                    region:'north',
                    height:70,
                    //width:'100%',
                    xtype: 'container',
                    html: '<h1 class="x-panel-header">Biz Trac</h1>',
                    padding: '0 40 10 10',     
                    //bodyStyle: 'background-color: red;',
                    style:"background-image:url(data/images/telelgeo.jpg);font-size: 18px; !important",
                    /*items: [{
                        type: "text",
                        text: "Hello, Sprite!",
                        fill: "green",
                        font: "18px monospace"
                    }]*/

                }
                ]  
                    
        });
    task.delay(5000);
    }
});
