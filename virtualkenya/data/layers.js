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