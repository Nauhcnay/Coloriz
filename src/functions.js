import photoshop from 'photoshop';
import uxp from 'uxp'
import btoa from 'btoa';
import os from 'os';
const hexToHsl = require('hex-to-hsl');
const app = photoshop.app;
const batchPlay = photoshop.action.batchPlay;
const fs = uxp.storage.localFileSystem;
const Buffer = require('buffer/').Buffer

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const alert = message => {
    const psCore = photoshop.core;
    psCore.showAlert({ message });
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

/**
 * Brush
 */
export async function handleMergeToolClick(brushSize) {
    const mergeHintLayer = getMergeHintLayer()
    // Select layer if already exists
    if (mergeHintLayer) {
        const result = await batchPlay(
            [
                {
                    "_obj": "select",
                    "_target": [
                        {
                            "_ref": "layer",
                            "_name": "merge-hint"
                        }
                    ],
                    "makeVisible": false,
                    "layerID": [
                        mergeHintLayer._id
                    ],
                    "_isCommand": false,
                    "_options": {
                        "dialogOptions": "dontDisplay"
                    }
                }
            ],
            {
                "synchronousExecution": false,
                "modalBehavior": "fail"
            }
        );            
    }
    // Otherwise create it
    else {
        createMergeHintLayer()
    }
    await activatePencil();
    await setBrushSize(2);
    await setColorRed();
}

export async function handleFineSplitToolClick(brushSize) {
    const splitHintLayer = getSplitHintLayer()
    // Select layer if already exists
    if (splitHintLayer) {
        const result = await batchPlay(
            [
                {
                    "_obj": "select",
                    "_target": [
                        {
                            "_ref": "layer",
                            "_name": "split-hint"
                        }
                    ],
                    "makeVisible": false,
                    "layerID": [
                        splitHintLayer._id
                    ],
                    "_isCommand": false,
                    "_options": {
                        "dialogOptions": "dontDisplay"
                    }
                }
            ],
            {
                "synchronousExecution": false,
                "modalBehavior": "fail"
            }
        );            
    }
    // Otherwise create it
    else {
        createSplitHintLayer()
    }
    await activatePencil();
    await setBrushSize(2);
    await setColorYellow();
}

export async function handleCoarseSplitToolClick(brushSize) {
    const splitHintLayer = getSplitHintLayer()
    // Select layer if already exists
    if (splitHintLayer) {
        const result = await batchPlay(
            [
                {
                    "_obj": "select",
                    "_target": [
                        {
                            "_ref": "layer",
                            "_name": "split-hint"
                        }
                    ],
                    "makeVisible": false,
                    "layerID": [
                        splitHintLayer._id
                    ],
                    "_isCommand": false,
                    "_options": {
                        "dialogOptions": "dontDisplay"
                    }
                }
            ],
            {
                "synchronousExecution": false,
                "modalBehavior": "fail"
            }
        );            
    }
    // Otherwise create it
    else {
        createSplitHintLayer()
    }
    await activateBrush();
    await setBrushSize(10);
    await setColorYellow();
}

async function activatePencil() {
    const result = await batchPlay(
    [
    {
        "_obj": "select",
        "_target": [
            {
                "_ref": "pencilTool"
            }
        ],
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });
    
}

async function activateBrush() {
    const result = await batchPlay(
    [
    {
        "_obj": "select",
        "_target": [
            {
                "_ref": "paintbrushTool"
            }
        ],
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });
    
}

async function setBrushSize(size) {
    const result = await batchPlay(
    [
    {
        "_obj": "set",
        "_target": [
            {
                "_ref": "brush",
                "_enum": "ordinal",
                "_value": "targetEnum"
            }
        ],
        "to": {
            "_obj": "brush",
            "masterDiameter": {
                "_unit": "pixelsUnit",
                "_value": size
            }
        },
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });

}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function RGBtoHSB(r, g, b) {
    let hue;
    let saturation;
    let brightness;

    const cmax = Math.max(r, g, b)
    const cmin = Math.min(r, g, b)

    brightness = cmax / 255
    if (cmax !== 0) {
        saturation = (cmax - cmin) / cmax
    }
    else {
        saturation = 0
    }
    if (saturation === 0) {
        hue = 0
    }
    else {
        let redc = (cmax - r) / (cmax - cmin)
        let greenc = (cmax - g) / (cmax - cmin)
        let bluec = (cmax - b) / (cmax - cmin)
        if (r === cmax) {
            hue = bluec - greenc
        }
        else if (g === cmax) {
            hue = 2 + redc - bluec
        }
        else {
            hue = 4 + greenc - redc
        }
        hue = hue / 6
        if (hue < 0) {
            hue = hue + 1
        }
    }
    return [hue*360, saturation*100, brightness*100]
}

export async function setColor(hex) {
    const { r, g, b } = hexToRgb(hex)
    const [hue, saturation, brightness] = RGBtoHSB(r, g, b)
    const result = await batchPlay(
    [
    {
        "_obj": "set",
        "_target": [
            {
                "_ref": "color",
                "_property": "foregroundColor"
            }
        ],
        "to": {
            "_obj": "HSBColorClass",
            "hue": {
                "_unit": "angleUnit",
                "_value": hue
            },
            "saturation": saturation,
            "brightness": brightness
        },
        "source": "photoshopPicker",
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });

}

async function setColorRed() {
    const result = await batchPlay(
    [
    {
        "_obj": "set",
        "_target": [
            {
                "_ref": "color",
                "_property": "foregroundColor"
            }
        ],
        "to": {
            "_obj": "HSBColorClass",
            "hue": {
                "_unit": "angleUnit",
                "_value": 0
            },
            "saturation": 100,
            "brightness": 100
        },
        "source": "photoshopPicker",
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });

}

async function setColorYellow() {
    const result = await batchPlay(
    [
    {
        "_obj": "set",
        "_target": [
            {
                "_ref": "color",
                "_property": "foregroundColor"
            }
        ],
        "to": {
            "_obj": "HSBColorClass",
            "hue": {
                "_unit": "angleUnit",
                "_value": 55.0579833984375
            },
            "saturation": 100,
            "brightness": 100
        },
        "source": "photoshopPicker",
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });

}

export async function activatePaintBucket() {
    const result = await batchPlay(
        [
        {
            "_obj": "select",
            "_target": [
                {
                    "_ref": "bucketTool"
                }
            ],
            "dontRecord": true,
            "forceNotify": true,
            "_isCommand": false,
            "_options": {
                "dialogOptions": "dontDisplay"
            }
        }
        ],{
        "synchronousExecution": false,
        "modalBehavior": "fail"
        });
}

/**
 * Layer
 */
export async function selectLayerByName(layerName){
    const layer = getLayerByName(layerName)
    const result = await batchPlay(
            [
                {
                    "_obj": "select",
                    "_target": [
                        {
                            "_ref": "layer",
                            "_name": layerName
                        }
                    ],
                    "makeVisible": false,
                    "layerID": [
                        layer._id
                    ],
                    "_isCommand": false,
                    "_options": {
                        "dialogOptions": "dontDisplay"
                    }
                }
            ],
            {
                "synchronousExecution": false,
                "modalBehavior": "fail"
            }
        );            
}
export async function moveSplitHintToTop(){
    const layer = getLayerByName('split-hint');
    console.log("Move split hint layer to top")
    await moveLayerToTop(layer._id)
}

export async function moveLayerToTop(layerID) {
    const result = await batchPlay(
    [
    {
        "_obj": "move",
        "_target": [
            {
                "_ref": "layer",
                "_enum": "ordinal",
                "_value": "targetEnum"
            }
        ],
        "to": {
            "_ref": "layer",
            "_index": app.activeDocument.layers.length - 1
        },
        "adjustment": false,
        "version": 5,
        "layerID": [
            layerID
        ],
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });
}

async function moveLayerToBottom(layerID) {
    const result = await batchPlay(
    [
    {
        "_obj": "move",
        "_target": [
            {
                "_ref": "layer",
                "_enum": "ordinal",
                "_value": "targetEnum"
            }
        ],
        "to": {
            "_ref": "layer",
            "_index": 0
        },
        "adjustment": false,
        "version": 5,
        "layerID": [
            layerID
        ],
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });
}

async function hideLayer(name) {
    const result = await batchPlay(
    [
    {
        "_obj": "hide",
        "null": [
            {
                "_ref": "layer",
                "_name": name
            }
        ],
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });
}

async function showLayer(name) {
    const result = await batchPlay(
    [
    {
        "_obj": "show",
        "null": [
            {
                "_ref": "layer",
                "_name": name
            }
        ],
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });

}

async function hideAllLayers() {
    const layers = app.activeDocument.layers;
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    layers.forEach(layer => {
        const { name } = layer;
        hideLayer(name)
    })
}

async function showAllLayers() {
    const layers = app.activeDocument.layers;
    layers.forEach(layer => {
        const { name } = layer;
        if (name !== "line_artist_org"){
            showLayer(name)
        }
       
    })
}

async function createLayer(name) {
    const layer = await app.activeDocument.createLayer({ name })
    return layer
}

export function getLayerByName(name) {
    const layers = app.activeDocument.layers;
    const filterResult = layers.filter(layer => layer.name === name)
    if (filterResult.length > 0) {
        return filterResult[0]
    }
    return false
}

async function renameActiveLayer(name) {
    // 所以操作ps就只要send这样一个bactch play的命令就可以了，但是这个命令的定义会非常模糊
    // 考虑修改这里需要极为慎重
    // https://www.adobe.io/photoshop/uxp/ps_reference/media/advanced/batchplay/    
    const result = await batchPlay(
    [
    {
        "_obj": "set",
        "_target": [
            {
                "_ref": "layer",
                "_enum": "ordinal",
                "_value": "targetEnum"
            }
        ],
        "to": {
            "_obj": "layer",
            "name": name
        },
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });

}

/**
 * Helpers for merge / split hint layers
 */
async function hideMergeHintLayer() {
    await hideLayer('merge-hint')
}

async function hideSplitHintLayer() {
    await hiderLayer('split-hint')
}

async function showMergeHintLayer() {
   await showLayer('merge-hint')
}

async function showSplitHintLayer() {
    await showLayer('split-hint')
}

function getResultLayer() {
    return getLayerByName('Background');
}

function getMergeHintLayer() {
    return getLayerByName('merge-hint');
}

function getSplitHintLayer() {
    return getLayerByName('split-hint');
}

async function createMergeHintLayer() {
    return await createLayer('merge-hint');
}

async function createSplitHintLayer() {
    return await createLayer('split-hint');
}


/**
 * File I/O
 */
function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return btoa( binary );
}

// Open files and read their id, filename, and base64 string
export async function readFiles() {        
    const files = await fs.getFileForOpening({
        allowMultiple: true,
        types: uxp.storage.fileTypes.images
    });

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    // 有意思的函数
    const newScenes = await Promise.all(files.map(async (file) => {
        const fileContents = await file.read({format: uxp.storage.formats.binary});
        const base64String = _arrayBufferToBase64(fileContents)
        
        const doc = await app.open(file);
        const documentID = doc._id;
        const fileName = doc.title;

        return {
            documentID,
            fileName,
            base64String,
            image: base64String
        }    
    }))
    return newScenes;
}

// Set a folder for persistent token
function setPersistentFolder() {
    let entry = fs.getFolder();
    let token = fs.createPersistentToken(entry);
    localStorage.setItem("persistentFolder", token);
}

// Prompt user to create persistent token if none exists
async function ensurePersistentToken() {
    const thePersistentFolderToken = await localStorage.getItem("persistentFolder");
    if (!thePersistentFolderToken) {
        alert('You must first choose a path where you want to save temporary files.')
        //this is a modal window, it should block everything until user select the temp folder
        setPersistentFolder()
    }
}

// Get an existing file using persistent token
// 但这些api的知识又是从哪里得知的？
async function getExistingFile(fileName) {
    await ensurePersistentToken();
    const thePersistentFolderToken = await localStorage.getItem("persistentFolder");
    const thePersistentFolder = await fs.getEntryForPersistentToken(thePersistentFolderToken);
    const file = await thePersistentFolder.getEntry(fileName);
    return file;
}

// Create a new file using persistent token
async function createNewFile(fileName) {
    await ensurePersistentToken();
    const thePersistentFolderToken = await localStorage.getItem("persistentFolder");
    const thePersistentFolder = await fs.getEntryForPersistentToken(thePersistentFolderToken);
    const file = await thePersistentFolder.createFile(fileName, {overwrite: true});
    return file;
}

// Save a base64 string to png
export async function saveBase64Image(data, fileName) {
    const file = await createNewFile(fileName)
    const buf = new Buffer(data, 'base64');
    await file.write(buf)
}

// Load image as base64 string
export async function loadBase64(fileName) {
    const file = await getExistingFile(fileName)
    const fileContents = await file.read({format: uxp.storage.formats.binary});
    const base64String = _arrayBufferToBase64(fileContents)
    return base64String;
}

// Save visible layer as png
async function saveVisibleLayer(fileName) {
    const file = await createNewFile(fileName)
    const saveFile = await fs.createSessionToken(file);
    
    const result = await batchPlay(
    [
    {
        "_obj": "save",
        "as": {
            "_obj": "PNGFormat",
            "method": {
                "_enum": "PNGMethod",
                "_value": "quick"
            },
            "PNGInterlaceType": {
                "_enum": "PNGInterlaceType",
                "_value": "PNGInterlaceNone"
            },
            "PNGFilter": {
                "_enum": "PNGFilter",
                "_value": "PNGFilterAdaptive"
            },
            "compression": 6
        },
        "in": {
            "_path": saveFile,
            "_kind": "local"
        },
        "documentID": 563,
        "copy": true,
        "lowerCase": true,
        "saveStage": {
            "_enum": "saveStageType",
            "_value": "saveBegin"
        },
        "_isCommand": false,
        "_options": {
            "dialogOptions": "dontDisplay"
        }
    }
    ],{
    "synchronousExecution": false,
    "modalBehavior": "fail"
    });
}

// Save the merge hint layer using "saveVisibleLayer"
export async function saveMergeHintLayer() {
    // this function is very low efficient
    await hideAllLayers();
    await showMergeHintLayer();
    await saveVisibleLayer('merge-hint.png')
    await showAllLayers();
    let layer = getLayerByName('merge-hint')
    layer.delete();
    await createLayer('merge-hint');
    layer = getLayerByName('merge-hint')
    await moveLayerToTop(layer._id)
}

// Save the split hint layer using "saveVisibleLayer"
export async function saveFineSplitHintLayer() {
    await hideAllLayers();
    await showSplitHintLayer();
    await saveVisibleLayer('split-hint-fine.png')
    await showAllLayers();
    let layer = getLayerByName('split-hint')
    layer.delete();
    await createLayer('split-hint');
    layer = getLayerByName('split-hint')
    await moveLayerToTop(layer._id)
}

// Save the split hint layer using "saveVisibleLayer"
export async function saveCoarseSplitHintLayer() {
    await hideAllLayers();
    await showSplitHintLayer();
    await saveVisibleLayer('split-hint-coarse.png')
    await showAllLayers();
    let layer = getLayerByName('split-hint')
    layer.delete();
    await createLayer('split-hint');
    layer = getLayerByName('split-hint')
    await moveLayerToTop(layer._id)
}

async function openInLayer(fileName, layerName) {
    const file = await getExistingFile(fileName)

    const mainDocument = app.activeDocument;
    await app.open(file);

    // why there have two variable with the same value?
    // no there are different after open a new file
    const tempDocument = app.activeDocument;

    // why do this?
    await renameActiveLayer(layerName);
    await tempDocument.layers[0].duplicate(mainDocument);
    await tempDocument.closeWithoutSaving();


    app.activeDocument = mainDocument;
}


export async function unlockLayer(documentID){
    // is const result = really necessary?
    console.log("unlock background layer...");
    
    const result = await batchPlay(
    [
       {
          "_obj": "historyStateChanged",
          "documentID": documentID,
          //"ID": 943, //这个id有啥用？
          "name": "Make Layer",
          "hasEnglish": true,
          "_isCommand": false,
          "_options": {
             "dialogOptions": "dontDisplay"
          }
       }
    ],{
       "synchronousExecution": false,
       //"modalBehavior": "fail"
    });
    
    await renameActiveLayer("line_artist_org");
    await hideLayer("line_artist_org");
}



// Load result into a new layer
export async function loadResult(baseName, move) {
    // Delete if already exists
    const resultLayer = getLayerByName('result')
    if (resultLayer) {
        resultLayer.delete()
    }

    // Load image into layer
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    // template literals
    await openInLayer(`${baseName}-result.png`, 'result')
    if (move){
        const layer = getLayerByName('result')
        await moveLayerToBottom(layer._id)    
    }
    
}

export async function loadLineArtist(baseName, move) {
    // Delete if already exists
    console.log('loading artist line')
    const artistLayer = getLayerByName('line_artist')
    if (artistLayer) {
        artistLayer.delete();
    }

    // Load image into layer
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
    // template literals
    await openInLayer(`${baseName}-line_artist.png`, 'line_artist')
    if (move){
        const layer = getLayerByName('line_artist')
        await moveLayerToBottom(layer._id)
    }
}

// Load line_simplified into a new layer
export async function loadLineHint(baseName, move) {
    // Delete if already exists
    const lineSimplifiedLayer = getLayerByName('line_hint')
    if (lineSimplifiedLayer) {
        lineSimplifiedLayer.delete()
    }

    // Load image into layer
    await openInLayer(`${baseName}-line_hint.png`, 'line_hint')
    if (move){
        const layer = getLayerByName('line_hint')
        await moveLayerToTop(layer._id)
    }
    
}

// Load line_simplified into a new layer
export async function loadLineSimplified(baseName, move) {
    // Delete if already exists
    const lineSimplifiedLayer = getLayerByName('line_simplified')
    if (lineSimplifiedLayer) {
        lineSimplifiedLayer.delete()
    }

    // Load image into layer
    await openInLayer(`${baseName}-line_simplified.png`, 'line_simplified')
    if (move){
        const layer = getLayerByName('line_simplified')
        await moveLayerToTop(layer._id)
    }
    
}

export async function loadLayer(fileName, layerName) {
    // Delete if already exists
    let layer = getLayerByName(layerName)
    if (layer) {
        layer.delete()
    }

    // Load image into layer
    await openInLayer(fileName, layerName)
    layer = getLayerByName(layerName)
    await moveLayerToBottom(layer._id)
}

function getLayerNames(numLayers) {
    const layers = [...Array(numLayers).keys()]
    const layerNames = []
    layers.forEach(index => {
        const layerName = `segment-${index}`
        layerNames.push(layerName)
    })
    return layerNames
}

// async function deleteLayers(layerNames) {
//     layerNames.forEach(layerName => {
//         let layer = getLayerByName(layerName)
//         if (layer) {
//             layer.delete()
//         }
//     })
// }

// async function openLayers(baseName, numLayers) {
//     const layers = [...Array(numLayers).keys()]
//     layers.forEach(async(index) => {
//         const fileName = `${baseName}-segment-${index}.png`        
//         const file = await getExistingFile(fileName)
//         await app.open(file)
//     })
// }

// async function copyLayers(baseName, layerNames, mainDocument) {

//     app.documents.forEach(async(document) => {
//         const { title } = document;
//         const splits = title.split('.')
//         const fileName = splits[Math.max(0, splits.length-2)]
//         let layerName;
//         if (fileName.startsWith('png-segment')) {
//             layerName = fileName.substring(4)
//         }
//         if (layerNames.includes(layerName)) {
//             app.activeDocument = document
//             await renameActiveLayer(layerName)
//             await document.layers[0].duplicate(mainDocument)
//             await document.closeWithoutSaving()
//         }
//     })
//     app.activeDocument = mainDocument
// }

async function copyLayer(fileName, layerName, mainDocument) {
    const file = await getExistingFile(fileName)
    await app.open(file)

    await sleep(300) // TODO: find a good rate
    const tempDocument = app.activeDocument

    await renameActiveLayer(layerName)
    await tempDocument.layers[0].duplicate(mainDocument)
    await tempDocument.closeWithoutSaving()

    app.activeDocument = mainDocument
}

async function groupLayers() {
    const doc = app.activeDocument;
    const layers = doc.layers.filter(layer => layer.name.startsWith('segment'))
    const group = await doc.createLayerGroup({ name: "segments", fromLayers: layers })
    await moveLayerToBottom(group._id)
    return group
}

export async function loadLayers(baseName, numLayers) {
    const layerGroup = getLayerByName('segments')
    if (layerGroup) {
        layerGroup.delete()
    }

    const mainDocument = app.activeDocument
    const layerNames = getLayerNames(numLayers)
    const fileNames = layerNames.map(layerName => {
        return `${baseName}-${layerName}.png`
    })

    await asyncForEach(layerNames, async(layerName, i) => {
        const fileName = fileNames[i]
        await copyLayer(fileName, layerName, mainDocument)
    })

    await groupLayers()

}

// This fails a lot when # of images gets big, deprecated
// 好吧这就是他为什么不载入layer的原因
async function loadLayersBatch(baseName, numLayers) {
    deleteLayers(layerNames)

    console.log('opening layers...')
    await openLayers(baseName, numLayers)

    console.log('waiting 10 sec...')
    setTimeout(async() => {
        console.log('start copying!')
        await copyLayers(baseName, layerNames, mainDocument)
    }, 10000)
}

