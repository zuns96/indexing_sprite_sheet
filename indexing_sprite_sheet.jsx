var myRulers = app.preferences.rulerUnits;
app.preferences.rulerUnits = Units.PIXELS;

var _canvasWidth = parseInt(app.activeDocument.width);
var _canvasHeight = parseInt(app.activeDocument.height);

main();

app.preferences.rulerUnits = myRulers;

function main()
{
        var dlg = Dialog();

        var canvasWidth = new UnitValue(dlg.xCanvas.text, 'px');
        var canvasHeight = new UnitValue(dlg.yCanvas.text, 'px');

        var itemSizeX = new UnitValue(dlg.xSize.text, 'px');
        var itemSizeY = new UnitValue(dlg.ySize.text, 'px');

        var col = parseInt(canvasWidth / itemSizeX);
        var row = parseInt(canvasHeight / itemSizeY);

        var fontSize = dlg.fontSize.text;

        var tableWidth = itemSizeX * col;
        var tableHeight = itemSizeY * row;

        try
        {
                var firstQ = confirm("\nTableWidth : " + tableWidth + "\nTableHeight : " + tableHeight + "\nItemWidth : " + itemSizeX + "\nItemHeight : " + itemSizeY + "\ncol : " + col + "\n row : " + row + "\nTotal Item Cnt : " + col * row);
                if(firstQ) 
                {
                        RunScript(tableWidth, tableHeight, itemSizeX, itemSizeY, col, row, fontSize);
                        
                        alert("Process complete");
                }
        }
        catch (ex)
        {
                alert(ex + "\nProcess Failed");
                return;
        }
}

function Dialog()
{
	var dlg = new Window ('dialog'); 

        dlg.add("statictext").text = "Canvas Width (px)";
	dlg.xCanvas = dlg.add("edittext");
	dlg.xCanvas.text = _canvasWidth;

        dlg.add("statictext").text = "Canvas Height (px)";
	dlg.yCanvas = dlg.add("edittext");
	dlg.yCanvas.text = _canvasHeight;

	dlg.add("statictext").text = "Item Width (px)";
	dlg.xSize = dlg.add("edittext");
	dlg.xSize.text = _canvasWidth * 0.5;

	dlg.add("statictext").text = "Item Height (px)";
	dlg.ySize = dlg.add("edittext");
	dlg.ySize.text = _canvasHeight * 0.5;

	dlg.add("statictext").text = "fontSize (px)";
	dlg.fontSize = dlg.add("edittext");
	dlg.fontSize.text = 30;

	dlg.btnRun = dlg.add("button", undefined , 'Continue'); 
	dlg.btnRun.onClick = function() 
        {	
		this.parent.close(0); 
        }; 

	dlg.center(); 
	dlg.show();
	
	return dlg;
}

function RunScript(tableSizeX, tableSizeY, itemSizeX, itemSizeY, col, row, fontSize)
{
        var docLayer = app.activeDocument.artLayers;
        var layer = docLayer.add();
        layer.name = "Table";
        app.activeDocument.activeLayer = app.activeDocument.artLayers.getByName("Table");

        DrawGrid(tableSizeX, tableSizeY, col, row);
        
        var num = 1;
        fontSize = new UnitValue(parseInt(fontSize), 'px') * ( 10 / 13 );
        ProgressBar(row * col);
        try
        {
                for(var i = 0; i < row; ++i)
                {
                        for(var j = 0; j < col; ++j)
                        {
                                ProgressBar.message(num-1 + "/" + (row * col) + " : " + num + ".layer");
                                var numLayer = MakeTextLayer(num, fontSize, itemSizeX, itemSizeY, j, i);
                                numLayer.merge();
                                ProgressBar.increment();
                                ++num;
                        }
                }
        }
        catch (ex)
        {
                ProgressBar.close();
                throw ex;
        }
        ProgressBar.close();
}

function MakeTextLayer(text, fontSize, itemSizeX, itemSizeY, col, row) 
{
        var layers = app.activeDocument.artLayers;
        var layer = layers.add();
        layer.kind = LayerKind.TEXT;

        var textItem = layer.textItem;
        textItem.size = fontSize;
        textItem.contents = text;

        var layerWidth = layer.bounds[2] - layer.bounds[0];
        var layerHeight = layer.bounds[3] - layer.bounds[1];

        // layer.name = text + ".[" + layerWidth + ", " + layerHeight + "]";

        var posX = (itemSizeX + layerWidth) * col;
        var posY = (itemSizeY + layerHeight) * row;
        if(col > 0)
        {
                posX -= (layerWidth * col);
        }
        
        if(row == 0)
        {
                posY += layerHeight;
        }
        else
        {
                posY -= layerHeight * (row - 1);
        }

        textItem.position = [posX, posY];

        return layer;
}

function DrawGrid(tableSizeX, tableSizeY, col, row)
{
        var rowPerHieght = tableSizeY / row;
        var colPerWidth = tableSizeX / col;
        for(var i = 0; i < row + 1; ++i)
        {
                var lineY =  rowPerHieght * i;
                for(var j = 0; j < col + 1; ++j)
                {
                        var lineX = colPerWidth * j;

                        var lineWidth = 2;
                        var startPoint = [];
                        var endPoint = [];
                        if(j == 1)
                        {
                                startPoint[0] = 0
                                startPoint[1] = lineY;
                                
                                endPoint[0] = tableSizeX;
                                endPoint[1] = lineY;

                                DrawLine( startPoint, endPoint, lineWidth );
                        }

                        startPoint[0] = lineX;
                        startPoint[1] = 0;
                        
                        endPoint[0] = lineX;
                        endPoint[1] = tableSizeY;

                        DrawLine( startPoint, endPoint, lineWidth );
                }
        }
}

function DrawLine( startPos, endPos, width ) 
{
        var desc = new ActionDescriptor();
        var lineDesc = new ActionDescriptor();
        var startDesc = new ActionDescriptor();
        var endDesc = new ActionDescriptor();

        startDesc.putUnitDouble( charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), startPos[0] );
        startDesc.putUnitDouble( charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), startPos[1] );
        lineDesc.putObject( charIDToTypeID('Strt'), charIDToTypeID('Pnt '), startDesc );

        endDesc.putUnitDouble( charIDToTypeID('Hrzn'), charIDToTypeID('#Pxl'), endPos[0] );
        endDesc.putUnitDouble( charIDToTypeID('Vrtc'), charIDToTypeID('#Pxl'), endPos[1] );
        lineDesc.putObject( charIDToTypeID('End '), charIDToTypeID('Pnt '), endDesc );
        lineDesc.putUnitDouble( charIDToTypeID('Wdth'), charIDToTypeID('#Pxl'), width );
        
        desc.putObject( charIDToTypeID('Shp '), charIDToTypeID('Ln  '), lineDesc );
        desc.putBoolean( charIDToTypeID('AntA'), true );
        
        executeAction( charIDToTypeID('Draw'), desc, DialogModes.NO );
}

function ProgressBar(steps) 
{
        var bar;
        var progressText;
        var window;

        window = new Window("palette", "Progress", undefined, {closeButton: false});
        progressText = window.add("statictext");
        progressText.preferredSize = [450, -1]; // 450 pixels wide, default height.
        if (steps) 
        {
                bar = window.add("progressbar", undefined, 0, steps);
                bar.preferredSize = [450, -1]; // 450 pixels wide, default height.
        }

        ProgressBar.close = function() 
        {
                window.close();
        };
        
        ProgressBar.increment = function ()
        {
                bar.value++;
        };
        
        ProgressBar.message = function (message)
        {
                progressText.text = message;
        };
        
        window.show();
}