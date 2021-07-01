import photoshop from 'photoshop';
import uxp from 'uxp'
import btoa from 'btoa';
import os from 'os';
const hexToHsl = require('hex-to-hsl');
const app = photoshop.app;
const actionTree = photoshop.app.actionTree;
const batchPlay = photoshop.action.batchPlay;
const fs = uxp.storage.localFileSystem;
const st = uxp.storage;
// https://www.adobe.io/xd/uxp/develop/tutorials/how-to-ask-user-for-confirmation/
const { confirm } = require("./lib/dialogs.js");

// https://www.adobe.io/xd/uxp/uxp/reference-js/Modules/uxp/Persistent%20File%20Storage/Folder/
// this is not existing in the real uxp api! I really don't know what to say, why they provide such documentation?
// const fd = uxp.storage.Folder;
const Buffer = require('buffer/').Buffer;

var isReading = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));``
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
 // need to improve this function, add color parameter to this function
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
        
        if (app.activeDocument.layers[0]._id !== mergeHintLayer._id){
            console.log("Moving merge hint layer to the top");
            await moveLayerToTop(mergeHintLayer, true);}
    }

    // Otherwise create it
    else {
        createMergeHintLayer()
    }
    await activatePencil();
    await setBrushSize(brushSize);
    // await setColorRed();
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
      if (app.activeDocument.layers[0]._id !== splitHintLayer._id){
        console.log("Moving split hint layer to the top");
        await moveLayerToTop(splitHintLayer, true);}            
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

export async function activatePencil() {
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

export async function setBrushSize(size) {
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
        "_isCommand": true,
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

export async function setColorYellow() {
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

 // Select layer with given name and unselect the rest
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
    await moveLayerToTop(layer)
}

// export async function moveLayerToTop(layerID) {
//     const result = await batchPlay(
//     [
//     {
//         "_obj": "move",
//         "_target": [
//             {
//                 "_ref": "layer",
//                 "_enum": "ordinal",
//                 "_value": "targetEnum"
//             }
//         ],
//         "to": {
//             "_ref": "layer",
//             "_index": app.activeDocument.layers.length - 1
//         },
//         "adjustment": false,
//         "version": 5,
//         "layerID": [
//             layerID
//         ],
//         "_isCommand": false,
//         "_options": {
//             "dialogOptions": "dontDisplay"
//         }
//     }
//     ],{
//     "synchronousExecution": false,
//     "modalBehavior": "fail"
//     });
// }

export async function moveLayerToTop(layer, forEdit=false, layerGroup=app.activeDocument.layers) {
    let topLayer;
    const doc = app.activeDocument;
    if (layerGroup.isGroupLayer){
        topLayer = layerGroup.children[0];
    }
    else{
        topLayer = doc.layers[0];
    }
        
    if (topLayer._id !== layer._id)
        await moveAboveTo(layer, topLayer, forEdit);
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
            "_index": 1
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

// hide all layers in current active document
async function hideAllLayers() {
    const layers = app.activeDocument.layers;
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    layers.forEach(layer => {
        layer.visible = false; // there is a better way to hide the layer, batchplay is not easy to use, really
    })
}

// show all layers in current active document
async function showAllLayers(layerGroup=app.activeDocument.layers) {
    if (layerGroup.isGroupLayer){
        layerGroup.children.forEach(layer => {
            layer.visible = true
        })
        layerGroup.visible = true;
    }
    else{
        layerGroup.forEach(layer=>{layer.visible=true})
    }
}

async function createLayer(name, doc=app.activeDocument) {
    const layer = await doc.createLayer({ name })
    return layer
}

export function getLayerByName(name, layerGroup=app.activeDocument.layers) {
    // this function need to be improved
    // get the layer in first layer group
    let layers;
    if (layerGroup.isGroupLayer)
        layers = layerGroup.children;
    else
        layers = layerGroup;

    const filterResult = layers.filter(layer => layer.name === name);
    if (filterResult.length > 0) {
        return filterResult[0];
    }
    return false;
}

async function renameActiveLayer(name) {
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

export async function setRGBMode(){
    const result = await batchPlay(
    [
       {
          "_obj": "convertMode",
          "to": {
             "_class": "RGBColorMode"
          },
          "_isCommand": true,
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
 // Todo: this seems could have a better way
function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return btoa( binary );
}



function showResizeConfirm(){
    document.querySelector("#dlgExample").uxpShowModal({
    title: "Resize your work?",
    resize: "none", // "both", "horizontal", "vertical",
    size: {
      width: 480,
      height: 240
    }
  });
}

async function showConfirm(doc, w_new, h_new, th) {
  /* we'll display a dialog here */
  const feedback = await confirm(
          `Resize ${doc.title} ?` , //[1]
          `Would you like to reszie your work to ${parseInt(w_new)}px x ${parseInt(h_new)}px? Other wise the process time of any image that greater than ${th}px might increase to a few minitues. `, //[2]
          ["No", "Yes"] /*[3]*/
        );
  switch (feedback.which) {
  case 0:
    /* User canceled */
    return false;
  case 1:
    /* User clicked Enable */
    return true;
}

}

// Open files and read their id, filename, and base64 string
export async function readFiles() {
    // this is to avoid two open dialog pop out on windows
    if (isReading){
        return [];
    }
    isReading = true;

    try{
        // pop up a dialog to select images 
        const files = await fs.getFileForOpening({
            allowMultiple: true,
            types: st.fileTypes.images
        });
        // save the path of all opened files
        // maybe useful, I don't know
        files.forEach(async (file) => {
            const fileName = file.name;
            const path = file.nativePath.replace(fileName, '');
            // const workingFolder = fs.createEntry(path, {type:st.types.folder})
            // let token = await fs.createPersistentToken(workingFolder);
            
            // https://www.adobe.io/xd/uxp/uxp/reference-js/Global%20Members/Data%20Storage/LocalStorage/
            // accroding to the link above, localStorage can only stroe string
            // why...why? orz
            localStorage.setItem(fileName, path);
            // localStorage.setItem(fileName + '_token', token);

        })
        
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
        // update all opend images into the plugin panel
        const newScenes = await Promise.all(files.map(async (file) => {
            // read file and convert it to base64 code
            const fileContents = await file.read({format: uxp.storage.formats.binary});
            let base64String = _arrayBufferToBase64(fileContents);
            // open file in photoshop
            const doc = await app.open(file);
            let w = doc.width;
            let h = doc.height;
            let th = 2000;
            let w_new = w;
            let h_new = h;
            let r = 0;
            let resize = false;
            // if the image is too large, resize it first
            if (w > th && h > th){
                // compute the new width and height
                if (w > h){
                    r = w/h;
                    h_new = th;
                    w_new = r*th;
                }
                else{
                    r = h/w;
                    w_new = th;
                    h_new = r*th;
                }
                // pop out a dialog to ask user to decide
                resize = await showConfirm(doc, w_new, h_new, th); 
            }
            // 
            await sleep(300);
            // rename and hide the opened image 
            if (app.activeDocument.activeLayers[0].locked === true){
                app.activeDocument.activeLayers[0].locked = false; //this is the best way to lock or unlock layer
                app.activeDocument.activeLayers[0].name = file.name; // and rename layer
                // app.activeDocument.activeLayers[0].visible = false;
                app.activeDocument.activeLayers[0].locked = true;
            }
            const documentID = doc._id;
            const fileName = doc.title;
            // save result to newSecne
            return {
                documentID,
                fileName,
                base64String,
                image: [base64String],
                flatted: false,
                displayed: false,
                resize,
                "newSize":[w_new, h_new],
                clicked:false,
                historyIndex: 0,
            }    
        }))

        isReading = false;
        if (await ensurePersistentToken()){
            // return new scene
            return newScenes;    
        }
        else{
            return [];
        }
    }
    catch (e){
        console.log(e);
        isReading = false;
        return [];
    }
    
}

async function confirmContinue() {
  /* we'll display a dialog here */
  const feedback = await alert(
          "Reset your flatting result?", //[1]
          "If continue, this will reset all your works on this document") //[2]
};

// find the temp folder token
async function setPersistentFolder() {
    // let's get the default temp folder, we don't need those intermediate files
    let platform = os.platform()
    let tempPath;
    let answer;
    if (platform === "darwin"){
        tempPath = "/tmp/";
        navigator.clipboard.writeText({"text/plain": tempPath});
        answer = await confirm(
          "Please indicate the temporary folder path", //[1]
          "Use 'shift + command + g' and paste the temp folder path in the next open file dailog, then click 'open'.",
          ["Cancel", "Continue"]);
        // app.showAlert("Please indicate the temporary folder path, using 'shift + command + g' and paste the temp folder path in the open file dailog, then click 'open'.");
        if (answer.which === 0){
            app.showAlert("The temp folder must be specified")
            return false;
        }
    }
    else if (platform === "win32"){
        tempPath = "c:\\temp\\flatting_temp";
        // navigator.clipboard.writeText({"text/plain": tempPath});
        answer = await confirm(
          "Please indicate the temporary folder path", //[1]
          "Set the temp folder path to \" c:\\temp\\flatting_temp \". If this folder does not exsit, please create them manually ",
          ["Cancel", "Continue"]);
        // app.showAlert("Please indicate the temporary folder path, paste the temp folder path in the open file dailog and click 'open'.");   
        if (answer.which === 0){
            app.showAlert("The temp folder must be specified")
            return false;
        }
    }
    else {
        tempPath = "/tmp/";
        answer = await confirm(
          "Please indicate the temporary folder path", //[1]
          "Can't detect the platform type, please choose the temporary folder path manually",
          ["No", "Yes"]);
        // app.showAlert("Can't detect the platform type, please choose the temporary folder path manually");
        if (answer.which === 0){
            app.showAlert("The temp folder must be specified")
            return false;
        }
    }
    await sleep(1000); 
    // copy the path to clipboard
    let entry1 = await fs.getFolder(); 
    let token1 = await fs.createPersistentToken(entry1);
    localStorage.setItem("persistentFolder", token1);
    localStorage.setItem("persistentPath", entry1.nativePath);
    
    answer = await confirm(
      "Wanna to save the resized file to a different place?", //[1]
      "If the image's size is too large, it will be resized and saved to a new path, Cancel for use the same path as temp folder",
      ["Cancel", "Continue"]);
    // app.showAlert("Can't detect the platform type, please choose the temporary folder path manually");
    if (answer.which === 0){
        
        await sleep(1000);
        localStorage.setItem("resizeFolder", token1);
        localStorage.setItem("resizePath", entry1.nativePath);
    }
    else{
        await sleep(1000);
        let entry2 = await fs.getFolder(); 
        let token2 = await fs.createPersistentToken(entry2);
        localStorage.setItem("resizeFolder", token2);
        localStorage.setItem("resizePath", entry2.nativePath);
    }
    
        
    return true;

}

// Prompt user to create persistent token or path if none exist
export async function ensurePersistentToken() {
    const thePersistentFolderToken = await localStorage.getItem("persistentFolder");
    const thePersistentFolderPath = await localStorage.getItem("persistentPath");
    const theResizeFolderToken = await localStorage.getItem("resizeFolder");
    if (thePersistentFolderToken === "undefined" || thePersistentFolderPath === "undefined" ||
        thePersistentFolderToken === null || thePersistentFolderPath === null ||
        theResizeFolderToken === null || theResizeFolderToken === "undefined") {
        return setPersistentFolder();
    }
    return true;
}

// Get an existing file using persistent token
async function getExistingFile(fileName) {
    if (await ensurePersistentToken()){
        const thePersistentFolderToken = await localStorage.getItem("persistentFolder");
        const thePersistentFolder = await fs.getEntryForPersistentToken(thePersistentFolderToken);
        const file = await thePersistentFolder.getEntry(fileName);
        return file;    
    }
    else{
        return false;
    }
    
}

// Create a new file using persistent token
async function createNewFile(fileName) {
    // create file
    await ensurePersistentToken();
    const thePersistentFolderToken = await localStorage.getItem("persistentFolder");
    const thePersistentFolder = await fs.getEntryForPersistentToken(thePersistentFolderToken);
    const file = await thePersistentFolder.createFile(fileName, {overwrite: true});
    return file;
}

export async function createNewFileDialog(){
    const folder = await fs.getFolder();
    // const token = await fs.createPersistentToken(folder);
    // we can't specify the saving name of palette, so we use the date as the file name
    var currentdate = new Date(); 
    const fileName = "FlattingPalette_"+ currentdate.getDate() + "-"
                + (currentdate.getMonth()+1)  + "-" 
                + currentdate.getFullYear() + "_"  
                + currentdate.getHours() + "-"  
                + currentdate.getMinutes() + "-" 
                + currentdate.getSeconds() + ".txt";
    const file = await folder.createFile(fileName, {overwrite: false});
    return file;
}

// Save a base64 string to png
export async function saveBase64Image(data, fileName) {
    const file = await createNewFile(fileName);
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

// Save the merge hint layer and clear current input in it
export async function saveMergeHintLayer(layerGroup=app.activeDocument.layers) {
    if (await saveLayerByName('merge-hint', 'merge-hint.png', layerGroup)){
        // clear the content in this layer
        // but if it is in a group, then we don't need to cleanup
        let layer;
        if (layerGroup.isGroupLayer === undefined){
            layer = await cleanLayerbyName('merge-hint');
            return layer;
        }
        else{
            layer = await getLayerByName('merge-hint', layerGroup);
            return layer;
        }
    }
    else{
        return false;
    }
    
}

export async function saveLineArtistLayer(layerGroup=app.activeDocument.layers) {
    await saveLayerByName('line_artist', 'line-artist.png', layerGroup);
}

export async function saveFillNeuralLayer(layerGroup=app.activeDocument.layers) {
    await saveLayerByName('result_neural', 'fill-neural.png', layerGroup);
}

export async function saveFineSplitHintLayer(layerGroup=app.activeDocument.layers) {
    if (await saveLayerByName('split-hint', 'split-hint-fine.png', layerGroup)){
        let layer;
        if (layerGroup.isGroupLayer){
            layer = await getLayerByName('split-hint', layerGroup);
            return layer;       
        }
        else{
            layer = await cleanLayerbyName('split-hint');
            return layer;
        }
    }
    else
        return false;
    
}

// Save the split hint layer using "saveVisibleLayer"
export async function saveCoarseSplitHintLayer() {
    
    // await hideAllLayers();
    // await showSplitHintLayer();
    // await saveVisibleLayer('split-hint-coarse.png')
    // await showAllLayers();

    await saveLayerByName('split-hint', 'split-hint-coarse.png');
    // clear the content in this layer
    let layer = await cleanLayerbyName('split-hint');
    return layer;
}

// save the layer's content of current active document to png
async function saveLayerByName(layerName, fileName, layerGroup=app.activeDocument.layers){
    if (await hideAllLayersExcept(layerName, layerGroup)){
        let entry = await createNewFile(fileName);
        await app.activeDocument.save(entry);
        await showAllLayers(layerGroup);
        return true;
    }
    else
    {
        app.showAlert("Please select a color in the palette to start colorize");
        return false;
    }
    
}

async function hideAllLayersExcept(layerName, layerGroup=app.activeDocument.layers){
    let currLayer = await getLayerByName(layerName, layerGroup);
    if (currLayer === false){
        return false;
    }
    else{
        await hideAllLayers();
        currLayer.visible = true;
        if (layerGroup.isGroupLayer)
            layerGroup.visible = true;
        return true;    
    }
    
}

async function cleanLayerbyName(layerName, moveToTop = true, doc=app.activeDocument, layerGroup=app.activeDocument.layers){
    let layer = getLayerByName(layerName, layerGroup);
    if (layer.locked){
        layer.selected = true; // we need to select the layer before doing any operation on it
        layer.locked = false;
    }
    await layer.delete();
    layer = await createLayer(layerName, doc);
    // move the layer to the top, so user's input will before everything
    if (moveToTop){
        await moveLayerToTop(layer, true);    
    }
    return layer;
}

async function cleanLayer(layer, moveToTop = true, doc=app.activeDocument){
    if (layer.locked){
        layer.selected = true; // we need to select the layer before doing any operation on it
        layer.locked = false;
    }
    let name = layer.name; 
    await layer.delete();
    layer = await createLayer(name, doc);
    // move the layer to the top, so user's input will before everything
    if (moveToTop){
        await moveLayerToTop(layer, true);
    }
    return layer;
}


export async function moveResultLayerBack(layerTarget){
    let backingLayer = getLayerByName("line_artist");
    await moveBelowTo(layerTarget, backingLayer);   
}

export async function moveSimplifiedLayerBack(layerTarget){
    let backingLayer = getLayerByName("line_hint");
    await moveAboveTo(layerTarget, backingLayer);  
}

export async function moveLineHintLayerBack(layerTarget){
    let backingLayer = getLayerByName("line_artist");
    await moveAboveTo(layerTarget, backingLayer);  
}

export async function moveArtistLayerBack(layerTarget){
    let backingLayer = getLayerByName("result_neural");
    await moveAboveTo(layerTarget, backingLayer);  
}

export async function moveAboveTo(layerTarget, backingLayer, forEdit=false){
    let isLocked = layerTarget.locked;
    backingLayer.selected = true;
    layerTarget.selected = true;
    backingLayer.locked = false;
    layerTarget.locked = false;
    layerTarget.moveAbove(backingLayer);
    layerTarget.moveAbove();
    backingLayer.locked = true;
    backingLayer.selected = false;
    if (forEdit || isLocked===false){
        layerTarget.locked = false;
        layerTarget.selected = true;    
    }
    else{
        layerTarget.locked = true;
        layerTarget.selected = false;
    }

    
}

export async function moveBelowTo(layerTarget, frontLayer, forEdit=false){
    frontLayer.selected = true;
    layerTarget.selected = true;
    frontLayer.locked = false;
    layerTarget.locked = false;
    layerTarget.moveBelow(frontLayer);
    layerTarget.moveBelow();
    frontLayer.locked = true;
    frontLayer.selected = false;
    if (forEdit){
        layerTarget.locked = false;
        layerTarget.selected = true;
    }
    else{
        layerTarget.locked = true;
        layerTarget.selected = false;    
    }
    
}
////////////////////////////////////////////////////
// working area
export async function createLinkLayer(layerName, img, 
                                refresh=false, locked=true, select=false, 
                                doc=app.activeDocument, fix=true){
    // get the action name
    // we have to do this because it is almost impossible to add image into a layer directly
    let actionName = await localStorage.getItem("actionName");
    let imgTemp = await localStorage.getItem("imgTemp");
    let pathTemp = await localStorage.getItem("persistentPath");
    if (actionName === null || actionName === "undefined" ||
        imgTemp === null || imgTemp === "undefined"){
        actionName = "Link to temp";
        imgTemp = 'flatting_temp.png';
        localStorage.setItem("actionName", actionName);
        localStorage.setItem("imgTemp", imgTemp);
    }
    // find if the layer has exists already
    var newLayer = await getLayerByName(layerName);
    var groupLayers = doc.layerTree.filter((layer)=>layer.isGroupLayer)
    // create new layer with given name if not exsits
    if (newLayer === false || groupLayers.length > 0){
        newLayer = await doc.createLayer({name: layerName});
        // since this is new layer, move it to the top
        await moveLayerToTop(newLayer, true);
    }
    else{
        newLayer = await cleanLayer(newLayer, refresh);
        // if this is existing layer, move it to the right position
    }
    // convert to smartobject layer
    await activeLayerToSmartobject();
    // save image to temp PNG file
    await saveBase64Image(img, imgTemp);
    // find the action named "link to flatting temp"
    let action = findActionByName(actionName);
    if (action === null || action === undefined) {
        // if can't find the action, then send a message to user to creat the action first
        app.showAlert("Can't find the action, please add the flatting action to your photoshop");
        return null;
    }
    action.play();
    // rename the layer name, sometimes the action script will overwirte the layer name
    newLayer = getLayerByName(imgTemp.replace(".png", ""));
    newLayer.selected = true;
    newLayer.name = layerName;
    var bottomLayer;
    if (layerName === "result_neural"){
        if (fix){
            // find the first group layer
            let bottomLayers = doc.layerTree.filter((layer)=>layer.isGroupLayer);
            if (bottomLayers.length > 0){
                bottomLayer = doc.layerTree[0];
            }
            else
                bottomLayer = doc.layers[doc.layers.length - 1];
            // I don't want to figure out why, but just put a dirty fix here...
            if (newLayer._id !== bottomLayer._id) 
                await moveAboveTo(newLayer, bottomLayer);
        }
        
        newLayer.locked = false;
        await setLayerMultiply();
            
    }
    else if (layerName === "line_artist"){
        newLayer.locked = false;
        await setLayerMultiply();
        newLayer.locked = true;
    }
    else{
        newLayer.locked = locked;
        newLayer.selected = select;    
    }
     
    return newLayer;
}    

async function setLayerMultiply(){
    const batchPlay = photoshop.action.batchPlay;
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
             "mode": {
                "_enum": "blendMode",
                "_value": "multiply"
             }
          },
          "_isCommand": true,
          "_options": {
             "dialogOptions": "dontDisplay"
          }
       }
    ],{
       "synchronousExecution": false,
       "modalBehavior": "fail"
    });
}

function findActionByName(actionName){
    let flattingAction = actionTree.filter((a)=> a.name === "Flatting actions");
    if (flattingAction){
        return flattingAction[0].actions[0];
    }
    else{
        return flattingAction;
    }
}

async function activeLayerToSmartobject(){
    let result = await batchPlay(
    [
       {
          "_obj": "newPlacedLayer",
          "_isCommand": true,
          "_options": {
             "dialogOptions": "dontDisplay"
          }
       }
    ],{
       "synchronousExecution": false,
       "modalBehavior": "fail"
    });
}

async function linkImageToActiveLayer(fileName){
    // get file token
    const token = await localStorage.getItem(fileName);
    // recorded from Alchmeist
    let result = await batchPlay(
    [
       {
          "_obj": "newPlacedLayer",
          "_isCommand": true,
          "_options": {
             "dialogOptions": "dontDisplay"
          }
       }
    ],{
       "synchronousExecution": false,
       "modalBehavior": "fail"
    });

    result = await batchPlay(
    [
       {
          "_obj": "placedLayerRelinkToFile",
          "null": {
             "_path": token,
             "_kind": "local"
          },
          "_isCommand": true,
          "_options": {
             "dialogOptions": "dontDisplay"
          }
       }
    ],{
       "synchronousExecution": false,
       "modalBehavior": "fail"
    });
}
////////////////////////////////////////////////////

async function getLayerDetail(layerID, docID){
    const result = await batchPlay(
    [
       {
          "_obj": "get",
          "_target": [
             {
                "_ref": "layer",
                "_id": layerID
             },
             {
                "_ref": "document",
                "_id": docID
             }
          ],
          "_options": {
             "dialogOptions": "dontDisplay"
          }
       }
    ],{
       "synchronousExecution": false,
       "modalBehavior": "fail"
    });

    return result[0];
}

async function getActiveLayerDetail(){
    const result = await batchPlay(
    [
       {
          "_obj": "get",
          "_target": [
             {
                "_ref": "layer",
                "_enum": "oridinal",
                "_value": "targetEnum",
             },
          ],
          "_options": {
             "dialogOptions": "dontDisplay"
          }
       }
    ],{
       "synchronousExecution": false,
       "modalBehavior": "fail"
    });``
    return result[0];
}

async function setActiveLayer(layerDict){
    // this is a general way of setting layers, but it is really NOT user friendly
    const result = await batchPlay(
    [
       {
          "_obj": "set",
          "_target": [
             {
                "_ref": "layer",
                "_enum": "oridinal",
                "_value": "targetEnum",
             },
          ],
          "to":{
            "_obj": "layer",
            /* 
            add thing that you want to setup here
            But it will usually failed
            */
            },
          "_isCommand": true,
          "_options": {
             "dialogOptions": "dontDisplay"
          }
       }
    ],{
       "synchronousExecution": false,
       "modalBehavior": "fail"
    });
}

/*
Old fucntions for loading images into layers
These functions work but are quite slow
We will deprecate these in the future
*/
async function openInLayer(fileName, layerName) {
    const file = await getExistingFile(fileName)

    const mainDocument = app.activeDocument;
    await app.open(file);

    // after opend file in the app, there is a new doc
    // so the active document now has changed to this new one
    const tempDocument = app.activeDocument;

    // then duplicate this new layer back to the main document
    await renameActiveLayer(layerName);
    await tempDocument.layers[0].duplicate(mainDocument);
    await tempDocument.closeWithoutSaving();


    app.activeDocument = mainDocument;
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
    const lineHintLayer = getLayerByName('line_hint')
    if (lineHintLayer) {
        lineHintLayer.delete()
    }
    // Load image into layer
    await openInLayer(`${baseName}-line_hint.png`, 'line_hint')
    if (move){
        const layer = getLayerByName('line_hint')
        await moveLayerToTop(layer)
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
        await moveLayerToTop(layer)
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

// generate the array of layer names
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

