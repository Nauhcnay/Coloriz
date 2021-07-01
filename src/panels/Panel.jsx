// https://reactjs.org/
import React, { useState, useEffect } from "react";
import photoshop from 'photoshop';
import uxp from 'uxp';
const fs = uxp.storage.localFileSystem;
const st = uxp.storage;

// load resource
import mergeInstruction from '../assets/merge-instruction.png'
import splitInstruction from '../assets/split-instruction.png'
// import colorIcon from '../assets/color.svg'
// import tuningIcon from '../assets/tuning.svg'

// load from own scripts
import {
    setRGBMode,
    handleMergeToolClick,
    handleFineSplitToolClick,
    handleCoarseSplitToolClick,
    readFiles,
    saveBase64Image,
    loadResult,
    loadLineSimplified,
    loadLayer,
    saveMergeHintLayer,
    saveFineSplitHintLayer,
    saveCoarseSplitHintLayer,
    loadBase64,
    loadLayers,
    activatePaintBucket,
    setColor,
    unlockLayer,
    loadLineArtist,
    moveSplitHintToTop,
    selectLayerByName,
    loadLineHint,
    createLinkLayer,
    moveResultLayerBack, 
    moveSimplifiedLayerBack,
    moveArtistLayerBack,
    saveLineArtistLayer,
    saveFillNeuralLayer,
    createNewFileDialog,
    getLayerByName,
    moveLineHintLayerBack,
    moveLayerToTop,
    moveAboveTo,
    moveBelowTo,
    activatePencil,
    setBrushSize,
    ensurePersistentToken,
    setColorYellow
} from '../functions';

import { Modal } from 'antd'; // why import this line? it is not used anywhere
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {Provider, defaultTheme} from '@adobe/react-spectrum';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { TextField } from '@adobe/react-spectrum'
import { red, yellow, blue } from '@material-ui/core/colors';
import Button from '@material-ui/core/Button';
import {Slider} from '@adobe/react-spectrum'
import { PhotoshopPicker } from 'react-color';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Scenes from "../components/Scenes.jsx";
import SvgIcon from '@material-ui/core/SvgIcon';
import Avatar from '@material-ui/core/Avatar';
import Badge from '@material-ui/core/Badge';
import Input from '@material-ui/core/Input';
const { confirm } = require("../lib/dialogs.js");



/*
local variables
*/

async function confirmReset() {
  /* we'll display a dialog here */
  const feedback = await confirm(
          "Reset your flatting result?", //[1]
          "If continue, this will reset all your works on this document", //[2]
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
};

async function confirmDelPalette(title) {
  /* we'll display a dialog here */
  const feedback = await confirm(
          `Remove Palette ${title}?`, //[1]
          `If continue, this will remove ${title} permanently`, //[2]
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
};

const scroll = { overflowY: 'scroll'};
const divSmall = { height:"20%" }
const divLarge = { height:"60%" };


// uxp photoshop api entrance
const app = photoshop.app

// theme 
const theme = createMuiTheme({
    palette: {
        // type: "dark",
        // primary: {main: "#ffffff"},
        // secondary: secondaryColor,
        text:{primary: "#ffffff"}

    },
    typography: {
    // In Chinese and Japanese the characters are usually larger,
    // so a smaller fontsize may be appropriate.
    fontSize: 10,
    },    
});

// https://www.w3schools.com/js/js_arrow_function.asp
// https://material-ui.com/styles/api/#makestyles-styles-options-hook
const useStyles = makeStyles((theme) => ({
    root: {
      minWidth: 300,
      height: '100vh',
      overflowY: "hidden"
    },
    scenes: {
        overflowY: 'scroll',
    },
}));

// Panle componments
// need to find the doc of withStyles
// seems like a function to warp the style definition into a html element (or an React componment)
// ToDO: replace these to the UXP UI componments
const StyledTabs = withStyles({
  indicator: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    '& > span': {
      //maxWidth: 40,
      width: '100%',
      backgroundColor: '#9AE42C',
    },
  },
})((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

const StyledTab = withStyles((theme) => ({
  root: {
    textTransform: 'none',
    color: '#fff',
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(7),
    marginRight: theme.spacing(1),
    scrollButtons: 'auto',
    '&:hover': {
      color: '#9DE42C',
      opacity: 1,
    },
    '&$selected': {
      color: '#9AE42C',
      fontWeight: theme.typography.fontWeightMedium,
    },
    '&:focus': {
      color: '#9DE42C',
    },
  },
  // this line is necessary, I don't know why
  selected:{}
}))((props) => <Tab  disableRipple {...props} />);

const RedRadio = withStyles({
    root: {
      color: red[400],
      
      '`&`$checked': {
        color: red[600],
      },
    },
    checked: {},
})((props) => <Radio {...props} />);

const YellowRadio = withStyles({
    root: {
        color: yellow[400],
        
        '&$checked': {
        color: yellow[600],
        },
    },
    checked: {},
})((props) => <Radio {...props} />);

const BluewRadio = withStyles({
    root: {
        color: blue[400],
        
        '&$checked': {
        color: blue[600],
        },
    },
    checked: {},
})((props) => <Radio {...props} />);

const TabDIV = {
      display: "block",
      height:"350px",
      width:"250px",
      overflowY: "hidden"};

const ButtonStyleSmall = {
            color:"#9AE42C", 
            fontSize: 2,
            border: '1px solid',
            width:90, 
            height:15};

const ButtonStyleExtraSmall = {
            color:"#9AE42C", 
            fontSize: 2,
            border: '1px solid',
            width:65, 
            height:15};

const ButtonStyleLarge = {
            color:"#9AE42C", 
            fontSize: 2,
            border: '1px solid',
            width:130, 
            height:15};


const AddButtonStyle = {
            fontSize: 2,
            width:70, 
            height:15};

const TwoStateButton = (props) => (
    <Button 
        disabled={props.isLoading && props.isFlatting}
        onClick={props.onClick}
        variant='outlined'
        style={ButtonStyleSmall}>
        {props.isLoading ? 'Loading...' : props.text}
    </Button>
);

const TwoStateButtonFlat = (props) => (
    <Button 
        onClick={props.onClick}
        variant='outlined'
        style={ButtonStyleExtraSmall}>
        {props.isLoading ? "Undo" : "Show"}
    </Button>
);

const OneStateRedoFlat = (props) => (
    <Button 
        onClick={props.onClick}
        variant='outlined'
        style={ButtonStyleExtraSmall}>
        Redo
    </Button>
);

const OneStateReorderFlat = (props) => (
    <Button 
        onClick={props.onClick}
        variant='outlined'
        style={ButtonStyleExtraSmall}>
        Reset
    </Button>
);

const ThreeStateButton = (props) => (
    <Button 
        disabled={props.isLoading === 0 ? true : false}
        onClick={props.onClick}
        variant='outlined'
        style={ButtonStyleSmall}>
        {props.isLoading === 2? "Show" : props.text}
    </Button>
);

// const colors_test = ['#4c69f6', "#4c94f6", "#f6db35", "#ffc510", "#ee5454"];
// const colors_test_map_1 = colors_test.map((c)=>{return {"label": "label a", "color":c}})
const ComicBook = [{"label": '#4c69f6', "color":'#4c69f6'}, {"label": "#4c94f6", "color":"#4c94f6"}, 
    {"label": "#f6db35", "color": "#f6db35"}, {"label": "#ffc510", "color": "#ffc510"}, 
    {"label": "#ee5454", "color": "#ee5454"}, {"label": "#ffffff", "color": "#ffffff"},
    {"label": 'Spring Green', "color":'#00ff66'}, {"label": "Lime", "color":"#c1ff00"},
    {"label": "#0f125d", "color": "#0f125d"}, {"label": "#ae7673", "color": "#ae7673"}, 
    {"label": "#bdb1c6", "color": "#bdb1c6"}, {"label": "#4e3d69", "color": "#4e3d69"},
    {"label": "#f3b364", "color":"#f3b364"},
    ];

let palette = [
                    {'name':'Comic', 'colors':ComicBook},

                ];

/*
Main framework
*/
// main function which constructe the panel
// why put everthing into a function? not a class?
var StartFlatting = false;
var scenesGlobal;
var flattingSubmission = 0;
var isFlattingGlobal = false;
var isShowing = false;
var mergeSize = 10;
// this option enables fast redo and undo in trade of much more layer spaces required in photoshop
// it will store 6*n layers for each document (n is number of the colorize and tweak times)
// disable this option will only maintain 6 layers for each document
var fastHistory = true; 
const getScenes = ()=>scenesGlobal;
function Panel() {
    const getFlatting = ()=> StartFlatting; // we have to the pass the function instead of variable
    const setFlatting = (set)=> StartFlatting = set;
    const classes = useStyles();
    const [scenes, setScenes] = useState([]);
    scenesGlobal = scenes;
    const [activeScene, setActiveScene] = useState(0);
    const [tab, setTab] = useState(0);
    const handleTabChange = (event, newValue) => {
        setTab(newValue);
        if (newValue===1){
            document.querySelector("#addFlatButton").disabled = false;
            if (fastHistory)
                handleFineSplitToolClickFast(3);
            else
                handleFineSplitToolClick(3);
        }
        else if (newValue===0){
            document.querySelector("#addFlatButton").disabled = false;
            if (fastHistory)
                handleMergeToolClickFast(mergeSize);
            else
                handleMergeToolClick(mergeSize);
        }
        else
            document.querySelector("#addFlatButton").disabled = true;
            
      };

    const [isMerging, setIsMerging] = useState(false);
    const [isSplitting, setIsSplitting] = useState(false);
    // const [isFlatting, setIsFlatting] = useState(1);
    const [isFlatting, setIsFlatting] = useState(false);
    const [isInitail, setIsInitail] = useState(true);
    const [flatClicked, setflatClicked] = useState(false);
    const [paletteChange, setPaletteChange] = React.useState(palette);
    const [selectedColor, setSelectedColor] = React.useState(null);
    const [colorLabel, setColorLabel] = React.useState("Please select one color");
    const [selectedPalette, setSelectedPalette] = React.useState(null);
    const [backEnd, setBackEnd] = React.useState("local");



    const [brushMode, setBrushMode] = useState('merge');
    const [brushSize, setBrushSize] = React.useState(10);
    
    const handleBrushModeChange = (event) => {
        setBrushMode(event.target.value);
    };

    const mergeInstructionText = 'Brush over different segments that need to be merged. When ready, click Merge.'
    const splitInstructionText = 'Connect unconnected green lines where you with to split. When ready, click Split.'    

   
    // useEffect is a hook to call after state variables updated
    useEffect(() => {
        ensurePersistentToken();
        // check if all scene have been flatted
        if (isFlattingGlobal === false && flattingSubmission > 0) {
            tryFlat();
        }
        if (scenes.length === 0)
            flattingSubmission = 0;
    }, [scenes]);


    const ColorizeButton = <TwoStateButton onClick={tryMerge} text="Colorize" isLoading={isMerging} isFlatting={isFlatting}/>
    const TuningButton = <TwoStateButton onClick={trySplitFine} text="Tuning" isLoading={isSplitting} isFlatting={isFlatting}/>
    // const MergeButton = <TwoStateButton onClick={tryMerge} text="Merge" isLoading={isMerging}/>
    // const SplitButtonFine = <TwoStateButton onClick={trySplitFine} text="Fine Split" isLoading={isSplitting}/>
    // const SplitButtonCoarse = <TwoStateButton onClick={trySplitCoarse} text="Coarse Split" isLoading={isSplitting}/>
    //const FlatButton = <ThreeStateButton onClick={tryFlat} isLoading={isFlatting} text={isFlatting === 0 ? "Loading" : "Flat"}/>
    const FlatButton = <TwoStateButtonFlat onClick={showFlat} isLoading={flatClicked}/>
    const RedoButton = <OneStateRedoFlat onClick={redoFlat}/>
    const ReorderButton = <OneStateReorderFlat onClick={reorderFlat}/>
    

    // palette functions
    const ExportPaletteButton = () => {
        return (
        <Button
            variant="outlined"
            style={ButtonStyleExtraSmall} 
            onClick={savePalette}>
        Export
        </Button>)
    };

    const ImportPaletteButton = () => {
        return (
        <Button 
            variant="outlined"
            style={ButtonStyleExtraSmall} 
            onClick={readPalette}>
        Import
        </Button>)
    };

    const DelPaletteButton = () => {
        return (
        <Button
            variant="outlined"
            style={ButtonStyleExtraSmall} 
            onClick={DelPalette}>
        Del
        </Button>)
    };

    // color editing functions
    const UpdateColorButton = () => {
        return (
        <Button
            variant="outlined"
            style={ButtonStyleExtraSmall} 
            onClick={UpdateColor}>
        Update
        </Button>)
    };
    const DelColorButton = () => {
        return (
        <Button
            variant="outlined"
            style={ButtonStyleExtraSmall} 
            onClick={DelColor}>
        Del
        </Button>)
    };
    const AddColorButton = () => {
        return (
        <Button
            variant="outlined"
            style={ButtonStyleExtraSmall} 
            onClick={AddColor}>
        Add
        </Button>)
    };

    const handleInputChange = () => {
        mergeSize = document.querySelector("#mergeSlider").value;
        if (fastHistory){
            handleMergeToolClickFast(mergeSize);
        }
        else{
            handleMergeToolClick(mergeSize);
        }
    };


    async function reorderFlat(){
        var layerGroup;
        const doc = app.activeDocument;
        var layers;
        if (fastHistory){
            layerGroup = getWorkingLayerGroup();
            layers = layerGroup.children;
        }
        else{
            layerGroup = doc.layers;
            layers = doc.layers;
        }
        // reorder the result layer
        
        try{
            var bottomLayer;
            
            let layerNeural = await getLayerByName("result_neural", layerGroup);
            bottomLayer = layers[layers.length - 1];
            if (fastHistory){
                if (layers.indexOf(bottomLayer) - layers.indexOf(layerNeural) !== 0)
                    // here we need to move to bottom
                    await moveBelowTo(layerNeural, bottomLayer);
            }
            else{
                if (layers.indexOf(bottomLayer) - layers.indexOf(layerNeural) !== 1)
                    await moveAboveTo(layerNeural, bottomLayer);
            }

            let layerArtist = await getLayerByName("line_artist", layerGroup);
            bottomLayer = layerNeural;
            if (layers.indexOf(bottomLayer) - layers.indexOf(layerArtist) !== 1)
                await moveAboveTo(layerArtist, bottomLayer);

            let layerLineHint = await getLayerByName("line_hint", layerGroup);
            bottomLayer = layerArtist;
            if (layers.indexOf(bottomLayer) - layers.indexOf(layerLineHint) !== 1)
                await moveAboveTo(layerLineHint, bottomLayer);

            let layerSimplified = await getLayerByName("line_simplified", layerGroup);
            bottomLayer = layerLineHint;
            if (layers.indexOf(bottomLayer) - layers.indexOf(layerSimplified) !== 1)
                await moveAboveTo(layerSimplified, bottomLayer);

            let unlockWhich;
            let layerMergeHint = await getLayerByName("merge-hint", layerGroup);
            if (layerMergeHint !== false){
                bottomLayer = layers[0];
                if (layers.indexOf(bottomLayer) - layers.indexOf(layerMergeHint) !== 1){
                    await moveAboveTo(layerMergeHint, bottomLayer, true);
                }
            }

            let layerSplitHint = await getLayerByName("split-hint", layerGroup);
            if (layerSplitHint !== false){
                bottomLayer = layers[0];
                if (layers.indexOf(bottomLayer) - layers.indexOf(layerSplitHint) !== 1){
                    await moveAboveTo(layerSplitHint, bottomLayer, true);
                }
                        
                
            }
            if (tab === 0)
                unlockWhich = layerMergeHint;
            else
                unlockWhich = layerSplitHint;
            if (fastHistory){
                // let's just unlock all group layers here
                doc.layerTree.forEach((layer)=>{
                                    if (layer.isGroupLayer){
                                        layer.locked = false;
                                        if (layer.locked){
                                            // only batch play could unlock the group layer
                                            forceUnlock(layer);
                                        }
                                    }
                                });

                // dirty fix
                doc.layerTree.forEach((l)=>{
                    if (l._id === layerGroup._id){
                        if (l.visible===false)
                            l.visible = true;
                    }
                    else{
                        if (l.visible===true)
                            l.visible = false;
                    }
                });

                // select merge or split layer
                doc.layers.forEach((layer)=>{
                    if (layer.selected === true)
                        layer.selected = false
                });

                layers.forEach((l)=>{
                    if (l.visible===false)
                        l.visible=true;
                })
                
                unlockWhich.selected = true;
                unlockWhich.locked = false;
                
            }
                    
        }
        catch(e){
            console.log(e)
        }
    }

    async function forceUnlock(layer){
        // so this function has a side issue
        // it will force show all layers eventhough I didn't ask to do it
        // but this is the only possible way to unlock layers
        // layer.locked = false will not work sometimes
        // so we need additional works for this
        const batchPlay = require("photoshop").action.batchPlay;
        const doc = app.activeDocument;
        
        // select the layer 
        doc.layers.forEach(l=>{
            if (l.selected === true)
                l.selected = false;
        });
        layer.selected = true;

        // force unlock the selected layer
        result = await batchPlay(
        [
           {
              "_obj": "applyLocking",
              "_target": [
                 {
                    "_ref": "layer",
                    "_enum": "ordinal",
                    "_value": "targetEnum"
                 }
              ],
              "layerLocking": {
                 "_obj": "layerLocking",
                 "protectNone": true
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

    async function readPalette(){
        // open a json palette
        const file = await fs.getFileForOpening({
            allowMultiple: false,
            types: st.fileTypes.text
        });
        let paletteText = await file.read();
        if (typeof paletteText !== undefined)
            setPaletteChange(JSON.parse(paletteText));
    };

    async function savePalette(){
        let paletteText = JSON.stringify(paletteChange);
        const file = await createNewFileDialog();
        if (!file) {
            // no file selected, or the user didn't want to overwrite one they did select
            return;
        }
        await file.write(paletteText);

    };

    async function DelPalette(){
        let c = await confirmDelPalette(selectedPalette);
        if (c){
            var paletteChangeNew = paletteChange.filter((p)=>p.name !== selectedPalette);
            setPaletteChange(paletteChangeNew);
            setSelectedPalette(null);
            setSelectedColor(null);
        }
    }
    async function AddColor(){
        let colorOld = selectedColor.substring(selectedColor.lastIndexOf("#"), selectedColor.length);
        let labelOld = colorLabel;
        let paletteOld = selectedPalette;

        // read new value of the color
        let paletteNew = document.querySelector("#paletteName").value;
        let labelNew = document.querySelector("#colorLabel").value;
        let colorNew = document.querySelector("#colorValue").value;

        let paletteChangeNew = paletteChange.map((p)=>{
            // update palette name
            if (p.name === paletteOld){
                
                p.colors.push({"label": labelNew, "color":colorNew})
            }
            return p;
            // update color 
        });

        setPaletteChange(paletteChangeNew);

    }

    async function UpdateColor(){
        // const colors_test = ['#4D4D4D', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF'];
        // const colors_test_map_1 = colors_test.map((c)=>{return {"label": "label a", "color":c}})
        // const colors_test_map_2 = colors_test.map((c)=>{return {"label": "label b", "color":c}})
        // let palette = [
        //                     {'name':'palette A', 'colors':colors_test_map_1}, 
        //                     {'name':'palette B','colors':colors_test_map_2}
        //                 ];

        // get selected color and palette information
        let colorOld = selectedColor.substring(selectedColor.lastIndexOf("#"), selectedColor.length);
        let labelOld = colorLabel;
        let paletteOld = selectedPalette;

        // read new value of the color
        let paletteNew = document.querySelector("#paletteName").value;
        let labelNew = document.querySelector("#colorLabel").value;
        let colorNew = document.querySelector("#colorValue").value;

        let paletteChangeNew = paletteChange.map((p)=>{
            // update palette name
            if (p.name === paletteOld){
                p.name = paletteNew;
                p.colors = p.colors.map((c)=>{
                    if (c.color === colorOld && c.label === labelOld){
                        c.color = colorNew;
                        c.label = labelNew;
                    }
                    return c;
                })
                
            }
            return p;
            // update color 
        });

        setPaletteChange(paletteChangeNew);

    }
    async function DelColor(){
        // get selected color and palette information
        let colorOld = selectedColor.substring(selectedColor.lastIndexOf("#"), selectedColor.length);
        let labelOld = colorLabel;
        let paletteOld = selectedPalette;

        // read new value of the color
        let paletteNew = document.querySelector("#paletteName").value;
        let labelNew = document.querySelector("#colorLabel").value;
        let colorNew = document.querySelector("#colorValue").value;

        let paletteChangeNew = paletteChange.map((p)=>{
            // update palette name
            if (p.name === paletteOld){
                p.colors = p.colors.filter((c)=>{
                    if (c.color !== colorOld || c.label !== labelOld) {
                        return c;
                    }
                })
            }
            return p;
            // update color 
        });

        setPaletteChange(paletteChangeNew);

    }

    async function showViewMode(){
        let i;
        let end;
        let layers;
        if (fastHistory){
            let layerGroup = getWorkingLayerGroup();    
            layers = layerGroup.children;
            end = layerGroup.children.length;
        }
        else{
            layers = app.activeDocument.layers;
            end = layers.length;
        }

        for (i=0; i < end; i++){
            if (fastHistory){
                if (layers[i].name === "result_neural"){
                    layers[i].visible = true;
                }
                else
                    layers[i].visible = false;
            }
            else{
                if (layers[i].name === "result_neural" || i == end - 1){
                    layers[i].visible = true;
                }
                else
                    layers[i].visible = false;
            }
        }
        var doc = app.activeDocument;
        if (doc.layers[doc.layers.length-1].visible === false){
            doc.layers[doc.layers.length-1].visible = true;    
        }
        
    };

    async function showEditMode(){
        let i;
        let end;
        let layers;
        if (fastHistory){
            let layerGroup = getWorkingLayerGroup();    
            layers = layerGroup.children;
            end = layerGroup.children.length;
        }
        else{
            layers = app.activeDocument.layers;
            end = layers.length;
        }
            
        for (i=0; i < end; i++){
            layers[i].visible = true;       
        }
    }

    async function showFlat(){
        setIsFlatting(true);
        isShowing = true;
        console.log("Display current flatting result...");
        try {
            await displayScene(0, false);
            setflatClicked(true);
        }
        catch (e) {
            console.log(e);
        }
        isShowing = false;
        setIsFlatting(false);
    };

    async function undoFlat(){
        setIsFlatting(true);
        isShowing = true;
        console.log("Undo flatting result...");
        try {
            await displayScene(-1);
        }
        catch (e) {
            console.log(e);
        }
        isShowing = false;
        setIsFlatting(false);
    };

    async function redoFlat(){
        setIsFlatting(true);
        isShowing = true;
        console.log("Redo flatting result...");
        try {
            await displayScene(1);
        }
        catch (e) {
            console.log(e);
        }
        isShowing = false;
        setIsFlatting(false);
    }

    async function tryFlat() {
        // get all docs
        const docs = photoshop.app.documents;
        // we need to make a deep copy
        let updatedScenes = JSON.parse(JSON.stringify(scenes))
        setIsFlatting(true);
        let haveNewSceneFlatted = false;
        isFlattingGlobal = true;
        console.log("Flatting all loaded images...");
        // await flatAllBackground(scenes);    
        // flat all images in the opened scenes
        // setFlatting(true);
        var i;
        var end = updatedScenes.length;
        let w_new;
        let h_new;
        for (i = 0; i < end; i++){
            console.log('Flatting image: ' + updatedScenes[i].fileName);
            try{
                if (updatedScenes[i].flatted === false){
                    haveNewSceneFlatted = true;
                    // resize the doc if necessary
                    let doc = docs.filter(d=>d._id === updatedScenes[i].documentID)[0];
                    if (updatedScenes[i].resize){
                        // get the new size of the doc
                        w_new = updatedScenes[i].newSize[0];
                        h_new = updatedScenes[i].newSize[1];
                        // save to new file and resize
                        const resizeFolderToken = await localStorage.getItem("resizeFolder");
                        const resizeFolder = await fs.getEntryForPersistentToken(resizeFolderToken);
                        const FileNameBP = doc.title.lastIndexOf(".");
                        const saveFileName = doc.title.substr(0, FileNameBP) + "_resized.psd";
                        const file = await resizeFolder.createFile(saveFileName, {overwrite: true});
                        doc.save(file);
                        doc.resizeImage(w_new, h_new);
                        console.log("resize file successed");
                    } 
                    const updatedScene = await flatSingleBackground(updatedScenes[i]);    
                    // here we need to merge to scene list, cause the scene could be updated
                    // by other place during the flatting
                    scenesGlobal = scenesGlobal.map((s)=>{
                        if (s.documentID == updatedScene.documentID)
                            return updatedScene;
                        else
                            return s;
                    })
                    if (i >= end - 1)
                        isFlattingGlobal = false;

                    setScenes(scenesGlobal);
                    if (app.activeDocument._id === updatedScenes[i].documentID){
                        setIsFlatting(false);
                    }
                }
                continue;
            }
            catch (e){
                console.log(e);
                setFlatting(false);
            }
        }
        console.log("Flatting finished")
        setIsFlatting(false);
        isFlattingGlobal = false;
        if (haveNewSceneFlatted)
            flattingSubmission--;
        
    }

    async function tryMerge() {
        setIsFlatting(true)
        try {
            await merge();
            
        }
        catch (e) {
            console.log(e)
        }
        setIsFlatting(false)
    }

    async function trySplitFine() {
        setIsFlatting(true)
        try {
            await splitfine()
        }
        catch (e) {
            console.log(e)
        }
        setIsFlatting(false)
    }

    async function trySplitCoarse() {
        setIsSplitting(true)
        try {
            await splitcoarse()
        }
        catch (e) {
            console.log(e)
        }
        setIsSplitting(false)
    }
    async function flatSingleBackground(targetScene, failed=0, backServer=backEnd){
        // read data from selected input
        // const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
        if (failed > 2){
            app.showAlert("Flatting failed on both local and remote back end, please check your network or make sure the local server is running");
            return targetScene;
        }
        try{
            const { fileName, documentID, base64String, resize } = targetScene;
            const doc = app.documents.filter((d)=>d._id===documentID)[0];
            // get the new size if the doc is resized
            let data;
            if (resize){
                data = {
                        image: base64String,
                        net: 512,
                        radius: 1,
                        preview: false,
                        resize,
                        newSize: [doc.width, doc.height]}
            }
            else {
                data = {
                        image: base64String,
                        net: 512,
                        radius: 1,
                        preview: false,
                        resize}
            }

            // construct the server API entrance
            // Todo: make this apprea on the panel, let is editable
            var url;
            if (backServer === "remote"){
                url = 'http://68.100.80.232:8080/flatsingle';    
            }
            else{
                url = 'http://127.0.0.1:8080/flatsingle';
            }
            

            // get return result
            const response = await fetch(url, {
                method: 'POST', 
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            const result = await response.json();
            const { line_artist, line_simplified, image, line_hint, fill_artist } = result;
            console.log('Flatting done!')

            targetScene["flatted"] = true;
            targetScene["line_artist"] = [null, line_artist];
            targetScene["line_simplified"] = [null, line_simplified];
            targetScene["image"].push(image);
            targetScene["fill_artist"] = [null, fill_artist];
            targetScene["line_hint"] = [null, line_hint];
            // these two layers also need to be added into the undo list
            targetScene["merge_hint"] = [null, null];
            targetScene["split_hint"] = [null, null];
            targetScene["historyIndex"]++;      
            
            return targetScene;
        }
        catch (e){
            let newBackServer;
            console.log("Flatting error, switching to different backend and retry");
            if (backEnd==="local")
                newBackServer = 'remote';
            else
                newBackServer = 'local';
            return await flatSingleBackground(targetScene, failed + 1, newBackServer);
        }
            
    }

    
    async function displayScene(offset, fix=true) {
        // display the selected content to photoshop
        console.log('loading flatting results...')
        setRGBMode();
        const doc = app.activeDocument;
        // reset all background layers
        if (doc.layers[doc.layers.length-1].name !== "original"){
            doc.layers[doc.layers.length-1].locked = false;
            doc.layers[doc.layers.length-1].name = "original";
            doc.layers[doc.layers.length-1].locked = true;
        }
            
        
        // read data from selected input
        var scene = scenesGlobal.filter(scene => scene.documentID === app.activeDocument._id)[0]
        try{
            if ((scene.historyIndex + offset) < 1){
                app.showAlert("This is the end of undo list");
                return null;
            }
            if ((scene.historyIndex + offset) > scene.image.length - 1){
                app.showAlert("This is the end of redo list");
                return null;
            }

            // load flatting results
            var line_artist;
            var line_simplified;
            var image;
            var line_hint;
            var merge_hint;
            var split_hint;
            let layerGroup;

            scene.historyIndex = scene.historyIndex + offset;
            scene.clicked = true;
            line_artist = scene.line_artist[scene.historyIndex];
            line_simplified = scene.line_simplified[scene.historyIndex];
            image = scene.image[scene.historyIndex];
            line_hint = scene.line_hint[scene.historyIndex];
            merge_hint = scene.merge_hint[scene.historyIndex];
            split_hint = scene.split_hint[scene.historyIndex];

            // create layers if they are not exist
            const batchPlay = photoshop.action.batchPlay;
            if (offset === 0){
                let len = 0;
                doc.layerTree.forEach((layer)=>{
                    if (layer.isGroupLayer)
                        len++;
                })
                if ((len+1) !== scene.historyIndex){
                    console.log("history index record is not correct!")
                    app.showAlert("Internal error, please restart the plugin")
                    return null;
                }
            }
                

            var layerGroupList = doc.layerTree.filter((layer)=>layer.name === `Flat ${scene.historyIndex}`)
            if (fastHistory === false || (fastHistory && offset === 0 && layerGroupList.length === 0)){
                
                console.log('Loading result');
                if (image !== null){
                    var layerNeural = await createLinkLayer("result_neural", image, true, true, false, app.activeDocument, fix);
                    if (layerNeural === null){
                       return null;
                    }    
                }
                else{
                    console.log('Loading result failed');
                    return null;
                }
                
                console.log('Loading line art');
                var layerArtist;
                if (line_artist !== null){
                    layerArtist = await createLinkLayer("line_artist", line_artist, true);
                    if (layerArtist === null){
                        return null;
                    }    
                }
                else{
                    // copy the layer in the last group
                    if (fastHistory){
                        let layerArtistPre = getLayerByName("line_artist");
                        if (layerArtistPre)
                            layerArtist = await layerArtistPre.duplicate(doc, "line_artist");
                        else{
                            console.log('Loading line art failed');
                            return null;
                        }
                    }
                    else
                        console.log('Loading line art failed');
                }
                
                console.log('Loading line hint');
                var layerLineHint;
                if (line_hint !== null){
                    layerLineHint = await createLinkLayer("line_hint", line_hint, true);
                    if ( layerLineHint=== null){
                    return null;
                    }    
                }
                else{
                    // copy the layer in the last group
                    if (fastHistory){
                        let layerLineHintPre = getLayerByName("line_hint");
                        if (layerLineHintPre)
                            layerLineHint = await layerLineHintPre.duplicate(doc, "line_hint");
                        else{
                            console.log('Loading line hint failed');
                            return null;
                        }
                    }
                    else
                        console.log('Loading line hint failed');
                        
                }
                       
                
                console.log('Loading line simple');
                var layerSimplified;
                if (line_simplified !== null){
                    layerSimplified = await createLinkLayer("line_simplified", line_simplified, true);
                    if ( layerSimplified === null){
                    return null;
                    }    
                }
                else{
                    if (fastHistory){
                        let layerSimplifiedPre = getLayerByName("line_simplified");
                        if (layerSimplifiedPre)
                            layerSimplified = layerSimplifiedPre.duplicate(doc, "line_simplified");
                        else{
                            console.log('Loading line simple failed');
                            return null;
                        }
                    }
                    else
                        console.log('Loading line simple failed');
                        
                }

                console.log('Loading merge hint');
                var layerMergeHint;
                if (merge_hint !== null){
                    layerMergeHint = await createLinkLayer("merge-hint", merge_hint, true, false, true);
                    if ( layerMergeHint === null){
                    return null;
                    }
                    else{
                        layerMergeHint.locked = false;
                        layerMergeHint.selected = true;
                        // we need to rasterize the selected layer
                        const result = await batchPlay(
                        [
                           {
                              "_obj": "rasterizeLayer",
                              "_target": [
                                 {
                                    "_ref": "layer",
                                    "_enum": "ordinal",
                                    "_value": "targetEnum"
                                 }
                              ],
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
                }
                else{
                    if (fastHistory){
                        layerGroup = getWorkingLayerGroup();
                        let layerMergeHintPre;
                        if (layerGroup)
                            layerMergeHintPre = getLayerByName("merge-hint", layerGroup);
                        else
                            layerMergeHintPre = getLayerByName("merge-hint");
                        if (layerMergeHintPre && tab !== 0)
                            layerMergeHint = await layerMergeHintPre.duplicate(doc, "merge-hint");
                        else
                            // the merge layer will not have failure case, we will create an empty one eventually
                            layerMergeHint = await doc.createLayer({name:"merge-hint"});
                    }
                    else
                        console.log('Loading merge hint layer failed');
                        
                }

                console.log('Loading split hint');
                var layerSplitHint;
                if (split_hint !== null){
                    layerSplitHint = await createLinkLayer("split-hint", split_hint, true, false, true);
                    if ( layerSplitHint === null){
                    return null;
                    }
                    else{            
                        layerSplitHint.locked = false;
                        layerSplitHint.selected = true;
                        const result = await batchPlay(
                        [
                           {
                              "_obj": "rasterizeLayer",
                              "_target": [
                                 {
                                    "_ref": "layer",
                                    "_enum": "ordinal",
                                    "_value": "targetEnum"
                                 }
                              ],
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
                }
                else{
                    if (fastHistory){
                        layerGroup = getWorkingLayerGroup();
                        let layerSplitHintPre;
                        if (layerGroup)
                            layerSplitHintPre = getLayerByName("split-hint", layerGroup);
                        else
                            layerSplitHintPre = getLayerByName("split-hint");
                        
                        if (layerSplitHintPre && tab !== 1)
                            layerSplitHint = await layerSplitHintPre.duplicate(doc, "split-hint");
                        else
                            layerSplitHint = await doc.createLayer({name:"split-hint"});
                        layerSplitHint.locked = true;
                    }
                    else
                        console.log('Loading split hint layer failed');
                }
            }
            
                
            
            // move all layers into new layer group
            if (fastHistory){
                // create group layer if not exists
                if (layerGroupList.length===0){
                    layerGroup = await doc.createLayerGroup(
                        {name:`Flat ${scene.historyIndex}`, 
                        fromLayers: [layerNeural, layerArtist, layerLineHint,
                                    layerSimplified, layerSplitHint, layerMergeHint]});
                }
                else
                    layerGroup = layerGroupList[0];
                // hide all other layergourps and show the selected one only
                doc.layers.forEach(l=>{
                    if (l.selected===true)
                        l.selected=false;
                });
                for (let i=0;i<doc.layerTree.length;i++){
                    if (doc.layerTree[i].name === `Flat ${scene.historyIndex}`){
                        doc.layerTree[i].visible = true;
                        doc.layerTree[i].children.forEach(l=>{
                            if (l.visible===false)
                                l.visible=true;
                            if (l.name==="merge-hint" && tab===0)
                                l.selected=true;
                            else if (l.name==="split-hint" && tab===1)
                                l.selected=true;
                        })
                    }
                    else
                        doc.layerTree[i].visible = false;
                }

                // reorder the layergroup
                if (offset===0)
                    await reorderFlat();
            }

            // update the scenes click state
            // but, of course, this is not need to repeated everytime
            scenesGlobal = scenesGlobal.map((s)=>{
                if (s.documentID === app.activeDocument._id){
                    return scene;
                }
                else
                    return s;
            })
            // setScenes(scenesGlobal);

        }
        catch (e){
            console.log(e)
            app.showAlert(String(e));
        }    
    }

    // Todo: try to add different brush color support
    // But put this task later, this is not important now
    function getWorkingLayerGroup(){
        const doc = app.activeDocument;
        const scene = scenesGlobal.filter(scene => scene.documentID === doc._id)[0];
        const layerGroup = doc.layerTree.filter(layer=>layer.name === `Flat ${scene.historyIndex}`)[0];
        return layerGroup;
    }

    async function merge() {
        console.log('Merging...')
        const doc = app.activeDocument;
        // select the active document
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
        const { fileName } = scene;
        
        // read the user input
        var layerGroup = false;
        var mergeLayer;
        if (fastHistory){
            layerGroup = doc.layerTree.filter(layer=>layer.name === `Flat ${scene.historyIndex}`)[0];
            mergeLayer = await saveMergeHintLayer(layerGroup);
        }
        else
            mergeLayer = await saveMergeHintLayer();
        if (mergeLayer === false){
            return false;
        }
        const stroke = await loadBase64('merge-hint.png');
        var fill_neural;
        var line_artist;        
        var fill_artist;

        fill_neural = scene.image[scene.historyIndex];
        if (scene.line_artist[scene.historyIndex] !== null && (scene.historyIndex) !== 1){
            // only the last element in the history list is not null means it is 
            // necessary to load the line art layer, otherwise
            // we could save some loading time
            line_artist = scene.line_artist[scene.historyIndex]
        }
        else
            line_artist = scene.line_artist[1];    
        if (scene.fill_artist[scene.historyIndex] !== null && (scene.historyIndex) !== 1){

            fill_artist = scene.fill_artist[scene.historyIndex];
        }
        else
            fill_artist = scene.fill_artist[1];
        

        // construct the merge input 
        const data = {
            line_artist: line_artist,
            fill_neural: fill_neural,
            fill_artist: fill_artist,
            stroke,
        }
        var url;
        if (backEnd === "remote"){
            url = 'http://68.100.80.232:8080/merge';    
        }
        else{
            url = 'http://127.0.0.1:8080/merge';
        }

        // send to backend for merge
        console.log('sending request...')
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        // get result 
        const result = await response.json();
        const { line_simplified, image} = result;
        
        console.log("update current scene and scene list");
        // remove all history that after current index
        scene["line_artist"].splice(scene.historyIndex + 1);
        scene["line_simplified"].splice(scene.historyIndex + 1);
        scene["image"].splice(scene.historyIndex + 1);
        scene["fill_artist"].splice(scene.historyIndex + 1);
        scene["line_hint"].splice(scene.historyIndex + 1);
        scene["merge_hint"].splice(scene.historyIndex + 1);
        scene["split_hint"].splice(scene.historyIndex + 1);

        // update current scene
        scene["line_artist"].push(null);
        scene["line_simplified"].push(line_simplified);
        scene["image"].push(image);
        scene["fill_artist"].push(null);
        scene["line_hint"].push(null);
        
        scene["merge_hint"][scene.merge_hint.length - 1] = stroke;
        scene["merge_hint"].push(null);
        scene["split_hint"].push(null);
        scene.historyIndex++;
        scenesGlobal = scenesGlobal.map(s => {
            if (s.documentID === app.activeDocument._id)
                return scene;
            else
                return s;
        })

        console.log('Loading result');
        if (fastHistory){
            // remove layer group that is above the current working layergroup
            let cutIndex = doc.layerTree.indexOf(layerGroup);
            if (cutIndex===-1){
                for (let i=0; i<doc.layerTree.length;i++){
                    if (doc.layerTree[i]._id === layerGroup._id)
                        cutIndex = i;
                }
            }
            for (let i = cutIndex - 1; i>=0; i--){
                if (doc.layerTree[i].children){
                    doc.layerTree[i].children.forEach((layer)=>{
                                         layer.locked = false;
                                         if (layer.locked){
                                            forceUnlock(layer);
                                         }
                                         layer.delete()
                                     });
                }
                    
                await doc.layerTree[i].delete();
            }
            await displayScene(0);
        }
        else{
            let newLayer1 = await createLinkLayer("result_neural", image);
            if (newLayer1 === null){
                return null;
            }
            await moveResultLayerBack(newLayer1);

            console.log('Loading line simplified');
            let newLayer2 = await createLinkLayer("line_simplified", line_simplified);
            if (newLayer2 === null){
                return null;
            }
            await moveSimplifiedLayerBack(newLayer2);
            mergeLayer.selected = true;
        }
        setScenes(scenesGlobal)
        console.log('scenes saved in React state')        
        
    }

    async function splitfine() {
        console.log('Fine Splitting...');
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0];
        const doc = app.activeDocument;
        let splitLayer;
        var layerGroup;
        if (fastHistory){
            layerGroup = doc.layerTree.filter(layer=>layer.name === `Flat ${scene.historyIndex}`)[0];
            splitLayer = await saveFineSplitHintLayer(layerGroup);
        }
        else
            splitLayer = await saveFineSplitHintLayer();
        
        if (splitLayer === false){
            return false;
        }
        const stroke = await loadBase64('split-hint-fine.png');

        // load the fill results
        const fill_neural_in = scene.image[scene.historyIndex];
        
        let line_artist_in;
        if (scene.line_artist[scene.historyIndex] !== null && (scene.historyIndex) !== 1){

            line_artist_in = scene.line_artist[scene.historyIndex];
        }
        else
            line_artist_in = scene.line_artist[1];

        let fill_artist_in;
        if (scene.fill_artist[scene.historyIndex] !== null && (scene.historyIndex) !== 1){

            fill_artist_in = scene.fill_artist[scene.historyIndex];
        }
        else
            fill_artist_in = scene.fill_artist[1];
        
        const data = {
            line_artist: line_artist_in,
            fill_neural: fill_neural_in,
            fill_artist: fill_artist_in,
            stroke,
        };
        
        console.log('sending request...');
        var url
        if (backEnd === "remote"){
            url = 'http://68.100.80.232:8080/splitmanual';    
        }
        else{
            url = 'http://127.0.0.1:8080/splitmanual';
        }
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        console.log('got response');
        console.log(response);
        
        const result = await response.json();
        console.log('got result');
        
        const { line_artist, line_simplified, image, fill_artist, line_hint } = result;
        console.log('Splitting done!');


        // remove all history that after current index
        scene["line_artist"].splice(scene.historyIndex + 1);
        scene["line_simplified"].splice(scene.historyIndex + 1);
        scene["image"].splice(scene.historyIndex + 1);
        scene["fill_artist"].splice(scene.historyIndex + 1);
        scene["line_hint"].splice(scene.historyIndex + 1);
        scene["merge_hint"].splice(scene.historyIndex + 1);
        scene["split_hint"].splice(scene.historyIndex + 1);

        // update the current scene
        scene["line_artist"].push(line_artist);
        scene["line_simplified"].push(line_simplified);
        scene["image"].push(image);
        scene["fill_artist"].push(fill_artist);
        scene["line_hint"].push(line_hint);

        scene["merge_hint"].push(null);
        scene["split_hint"][scene.split_hint.length - 1] = stroke;
        scene["split_hint"].push(null);
        scene.historyIndex = scene.image.length - 1;

        // set results to scenes in React, so it can update the UI correspondingly
        scenesGlobal = scenesGlobal.map(s => {
            if (s.documentID === app.activeDocument._id)
                return scene
            else
                return s
        })

        console.log('Loading result');
        if (fastHistory){
            // remove layer group that is above the current working layergroup
            let cutIndex = doc.layerTree.indexOf(layerGroup);
            // a dirty fix for windows, the indexOf seems not work on windows
            if (cutIndex===-1){
                for (let i=0; i<doc.layerTree.length;i++){
                    if (doc.layerTree[i]._id === layerGroup._id)
                        cutIndex = i;
                }
            }
            for (let i = cutIndex - 1; i>=0; i--){
                if (doc.layerTree[i].children){
                    doc.layerTree[i].children.forEach((layer)=>{
                                         layer.locked = false;
                                         if (layer.locked){
                                            forceUnlock(layer);
                                         }
                                         layer.delete()
                                     });
                }
                    
                await doc.layerTree[i].delete();
            }
            await displayScene(0);
        }
        else{
            let newLayer1 = await createLinkLayer("result_neural", image);
            if (newLayer1 === null){
                return null;
            }
            await moveResultLayerBack(newLayer1);

            console.log('Loading line artist');
            let newLayer2 = await createLinkLayer("line_artist", line_artist);
            if (newLayer2 === null){
                return null;
            }
            await moveArtistLayerBack(newLayer2);

            console.log('Loading line hint');
            let newLayer4 = await createLinkLayer("line_hint", line_hint);
            if (newLayer4 === null){
                return null;
            }
            await moveLineHintLayerBack(newLayer4);

            console.log('Loading line simplified');
            let newLayer3 = await createLinkLayer("line_simplified", line_simplified);
            if (newLayer3 === null){
                return null;
            }
            await moveSimplifiedLayerBack(newLayer3);
        }
            
        splitLayer.selected = true;
        setScenes(scenesGlobal);
        console.log('scenes saved in React state');

    }

    async function loadNewScenes() {
        const newScenes = await readFiles();
        if (newScenes.length===0)
            return null;
        if (flattingSubmission < 0){
            flattingSubmission = 0;
            flattingSubmission++;
        }
        else
            flattingSubmission++;
        setIsFlatting(false);
        setScenes([...scenesGlobal, ...newScenes]);
        
        // StartFlatting = false;
        // tryFlat();
    }

    async function listener(event, descriptor){
        if (event === 'close') {
            const { documentID } = descriptor;
            removeSceneByID(documentID);
        }
        if (event === 'open'){
            // is it necessary to do this?
            console.log('we are here!');
        }
        if (event === 'select'){
            setActiveScene(app.activeDocument._id);
            // console.log("some doc is seleted!");
        }

     }

    function removeSceneByID(docID){
        // we can't access scenes in this function, why?
        // still don't know how to sovle this problem
        let s = getScenes();
        const newScenes = s.filter(scene => scene.documentID !== docID);
        setScenes(newScenes);
    }

    useEffect(() => {        
        photoshop.action.addNotificationListener([
            {
                event: "close"
            },
            {
                event: "open"
            }, // any other events...
            {
                event: "select"
            },
        ], listener);
    }, [])

    const brush = () =>{
            if (brushMode === 'merge' ){
                return MergeButton;
            }
            else if (brushMode === 'splitfine'){
                return SplitButtonFine;
            } 
            else if (brushMode ===  'splitcoarse'){
                return SplitButtonCoarse; 
            }}

    async function handleFineSplitToolClickFast(brushSize) {
        const doc = app.activeDocument;
        const scene = scenesGlobal.filter((s)=>s.documentID===app.activeDocument._id)[0];
        const layerGroup = doc.layerTree.filter(layer=>layer.name === `Flat ${scene.historyIndex}`)[0];
        let splitHintLayer = await getLayerByName("split-hint", layerGroup);
        let layerMergeHint = await getLayerByName("merge-hint", layerGroup);
        
        // unselect other layers 
        doc.layers.forEach((layer)=>{
                    if (layer.selected === true)
                        layer.selected = false
                });

        if (splitHintLayer){
            if (layerGroup.locked)
                layerGroup.locked = false;
            if (splitHintLayer.selected===false)
                splitHintLayer.selected = true;
            if (splitHintLayer.locked===true)
                splitHintLayer.locked=false;
        };

        if (layerMergeHint.visible)
            layerMergeHint.visible = false;

        if (photoshop.app.currentTool.id !== "pencilTool")
            await activatePencil();
        
        const batchPlay = photoshop.action.batchPlay;
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
                    "_value": brushSize
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

        // await setColor(color);
        await setColorYellow();
}

    async function handleMergeToolClickFast(brushSize) {
        // find current working layergroup
        if (isFlatting || isInitail){
            return null;
        }
        else
        {
            const doc = app.activeDocument;
            const scene = scenesGlobal.filter((s)=>s.documentID===app.activeDocument._id)[0];
            const layerGroup = doc.layerTree.filter(layer=>layer.name === `Flat ${scene.historyIndex}`)[0];
            let layerMergeHint = await getLayerByName("merge-hint", layerGroup);
            let layerSplitHint = await getLayerByName("split-hint", layerGroup);
            
            // unselect other layers 
            doc.layers.forEach((layer)=>{
                        if (layer.selected === true)
                            layer.selected = false
                    });

            if (layerMergeHint){
                layerGroup.locked = false;
                layerGroup.selected = false
                layerMergeHint.selected = true;
                layerMergeHint.locked = false;
            };

            if (layerSplitHint.visible)
                layerSplitHint.visible = false;

            if (photoshop.app.currentTool.id !== "pencilTool")
                await activatePencil();

            // this is wired, the batch play must be runed in the same jsx file
            // otherwise it will not work
            const batchPlay = photoshop.action.batchPlay;
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
                        "_value": brushSize
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

    }

    const handleColorBlobClick = async(name, color) => {
        if (isFlatting || isInitail)
            return null;
        else
        {
            setSelectedColor(name+color);
            await setColor(color);
            if (fastHistory){
                await handleMergeToolClickFast(document.querySelector("#mergeSlider").value);
            }
            else{
                await handleMergeToolClick(document.querySelector("#mergeSlider").value);
            }
        }
            
    }
 
    const ColorBlob = ({name, color, selected, label }) => {
        if (selected === name+color){
            setColorLabel(label);
            setSelectedPalette(name);
            return (
                <Badge color="primary" variant="dot" invisible={false}>
                    <Grid 
                        disabled = {isFlatting}
                        onClick={() => handleColorBlobClick(name, color)} 
                        style={{ backgroundColor: color, width: 20, height: 20, margin: 2}}/>
                </Badge>
            );}
        else
            return <Grid 
                        disabled = {isFlatting}
                        onClick={() => handleColorBlobClick(name, color)} 
                        style={{ backgroundColor: color, width: 20, height: 20, margin: 2}}/>;
    }
    
    const PaletteGrid = ({p})=>{
        return (
        <>
            {p.name}: {selectedPalette === p.name? colorLabel:""}
            <Grid item xs={12} style={{ display: 'flex' }}>
                <Grid container justify="flex-start" spacing={1}>
                    {p.colors.map(color => <ColorBlob key={color.color} color={color.color} selected={selectedColor} name={p.name} label={color.label}/>)}
                </Grid>
            </Grid>
        </>
        )
    }

    const InitailTab = ()=>{
        return (<sp-detail>
                   1. Click "Add" on the left to add scenes.<br />
                   2. Select one scene to start.
                </sp-detail>)
    };

    const WorkingTab = ()=>{
        return (<sp-detail>
                   Preparing for flatting...
                </sp-detail>)
    };

    const ReadyTab = (props)=>{
        return (<>
                   <sp-action-button label="Undo" onClick={undoFlat}>
                        <div slot="icon" class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
                                <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" />
                                <path class="a" d="M15.3315,6.271A5.19551,5.19551,0,0,0,11.8355,5H5.5V2.4A.4.4,0,0,0,5.1,2a.39352.39352,0,0,0-.2635.1L1.072,5.8245a.25.25,0,0,0,0,.35L4.834,9.9a.39352.39352,0,0,0,.2635.1.4.4,0,0,0,.4-.4V7h6.441A3.06949,3.06949,0,0,1,15.05,9.9a2.9445,2.9445,0,0,1-2.78274,3.09783Q12.13375,13.005,12,13H8.5a.5.5,0,0,0-.5.5v1a.5.5,0,0,0,.5.5h3.263a5.16751,5.16751,0,0,0,5.213-4.5065A4.97351,4.97351,0,0,0,15.3315,6.271Z" />
                            </svg>
                        </div>
                        
                    </sp-action-button>
                    <sp-action-button label="Redo" onClick={redoFlat}>
                        <div slot="icon" class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
                                <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" />
                                <path class="a" d="M2.6685,6.271A5.19551,5.19551,0,0,1,6.1645,5H12.5V2.4a.4.4,0,0,1,.4-.4.39352.39352,0,0,1,.2635.1l3.762,3.7225a.25.25,0,0,1,0,.35L13.166,9.9a.39352.39352,0,0,1-.2635.1.4.4,0,0,1-.4-.4V7H6.0615A3.06949,3.06949,0,0,0,2.95,9.9a2.9445,2.9445,0,0,0,2.78274,3.09783Q5.86626,13.005,6,13H9.5a.5.5,0,0,1,.5.5v1a.5.5,0,0,1-.5.5H6.237a5.16751,5.16751,0,0,1-5.213-4.5065A4.97349,4.97349,0,0,1,2.6685,6.271Z" />
                            </svg>
                        </div>
                        
                    </sp-action-button>
                    <sp-action-button label="Flat" onClick={props.action}>
                        <div slot="icon" class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
                              <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" /><path class="a" d="M17.489.1885A17.36351,17.36351,0,0,0,4.793,10.995a.261.261,0,0,0,.0625.2725l1.876,1.8755a.261.261,0,0,0,.2705.0635A17.214,17.214,0,0,0,17.8095.509.272.272,0,0,0,17.489.1885Z" />
                              <path d="M3.9,9.574H.45a.262.262,0,0,1-.23-.3915C1.0105,7.8045,3.96,3.26,8.424,3.26,7.388,4.2955,3.981,8.7845,3.9,9.574Z" />
                              <path d="M8.424,14.1v3.454a.262.262,0,0,0,.3895.2305c1.376-.777,5.9245-3.688,5.9245-8.2095C13.7,10.61,9.213,14.017,8.424,14.1Z" />
                            </svg>
                        </div>
                        {props.text}
                    </sp-action-button>
                    <sp-action-button label="Refresh" onClick={()=>{reorderFlat(app.activeDocument.layers)}}>
                        <div slot="icon" class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
                              <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" />
                              <path class="a" d="M16.337,10H15.39a.6075.6075,0,0,0-.581.469A5.7235,5.7235,0,0,1,5.25,13.006l-.346-.3465L6.8815,10.682A.392.392,0,0,0,7,10.4a.4.4,0,0,0-.377-.4H1.25a.25.25,0,0,0-.25.25v5.375A.4.4,0,0,0,1.4,16a.3905.3905,0,0,0,.28-.118l1.8085-1.8085.178.1785a8.09048,8.09048,0,0,0,3.642,2.1655,7.715,7.715,0,0,0,9.4379-5.47434q.04733-.178.0861-.35816A.5.5,0,0,0,16.337,10Z" />
                              <path class="a" d="M16.6,2a.3905.3905,0,0,0-.28.118L14.5095,3.9265l-.178-.1765a8.09048,8.09048,0,0,0-3.642-2.1655A7.715,7.715,0,0,0,1.25269,7.06072q-.04677.17612-.08519.35428A.5.5,0,0,0,1.663,8H2.61a.6075.6075,0,0,0,.581-.469A5.7235,5.7235,0,0,1,12.75,4.994l.346.3465L11.1185,7.318A.392.392,0,0,0,11,7.6a.4.4,0,0,0,.377.4H16.75A.25.25,0,0,0,17,7.75V2.377A.4.4,0,0,0,16.6,2Z" />
                            </svg>
                        </div>
                    </sp-action-button>
                </>)

    };

    const ActionGroup = (props)=>{
        return(
            <div class="group" 
                     style={{    
                        display: "block",
                        height:"75px"}}>
                    <sp-label>Actions</sp-label>
                    <sp-body>
                        {isInitail? <InitailTab/> : (isFlatting ? <WorkingTab/> : <ReadyTab action={props.action} text={props.text}/>)}
                    </sp-body>
            </div>)
    }

    const FlattingTab = (      
        //https://www.reactenlightenment.com/react-jsx/5.1.html
        // JSX allows us to put HTML into JavaScript.
        // https://reactjs.org/docs/introducing-jsx.html 
        <div style={TabDIV}>
            <div class="group">
            <sp-label>Palette</sp-label>
            <sp-body size="XS" 
                    style={{    display: "block",
                                height:"150px",
                                overflowY:"scroll",
                                overflowX: "hidden"}}>
                {paletteChange.map((p)=> <PaletteGrid key={p.name} p={p}/>)}
                <sp-slider
                    id="mergeSlider"
                    type="range" 
                    min="1" 
                    max="100"
                    step="1"
                    value={brushSize}
                    onMouseUp={handleInputChange}
                    style={{width:"80%"}}>
                    <sp-label slot="label">Size</sp-label>
                </sp-slider>
                <sp-radio-group name="view">
                    <sp-radio value="first" checked onClick={showEditMode}>Edit</sp-radio>
                    <sp-radio value="second" onClick={showViewMode}>Check Result</sp-radio>
                </sp-radio-group> 
            </sp-body>
            </div>
            <ActionGroup action={tryMerge} text="Colorize"></ActionGroup>
        </div>
        
    );
    
    // TODO: try to make this function connect to API, or just remove this function
    const ColoringTab = (
        <div style={TabDIV}>
            <div class="group" ><sp-label>Instruction</sp-label>
                <sp-body size="XS"
                         style={{    
                                display: "block",
                                height:"150px",
                                overflowY:"scroll"}}>
                   Should we put some illuastration here?

                </sp-body>
            </div> 
            <ActionGroup action={trySplitFine} text="Tweak"></ActionGroup>
        </div>
    )

    // We need a new tab to edit palette
    const PaletteTab = (
    <div style={{display: "block", height:"130vh",  overflowY: "scroll"}}>
        <div class="group"><sp-label>Choosing backend</sp-label>
                <sp-radio-group selected={backEnd} name="backend">
                    <sp-radio value="local" checked onClick={()=>setBackEnd("local")}>Local</sp-radio>
                    <sp-radio value="remote"  onClick={()=>setBackEnd("remote")}>Remote</sp-radio>
                </sp-radio-group>
        </div>

       {/* <div class="group" ><sp-label>Select color</sp-label>
            <sp-body size="XS" >
                <div xs={12} style={scroll}>
                {paletteChange.map((p)=> <PaletteGrid key={p.name} p={p}/>)}
                </div>
                
                <br/>
            </sp-body>
        </div>

        <div class="group" ><sp-label>Edit Color</sp-label>
            <sp-body size="XS" >
                <Grid container justify="flex-start">
                    <Grid item xs={12}>
                        <sp-textfield 
                            placeholder="Palette name" 
                            value={selectedPalette===null? '' : selectedPalette}
                            id="paletteName">
                            <sp-label isrequired="false" slot="label">Palette name</sp-label>
                        </sp-textfield>
                    </Grid>
                    <Grid item xs={12}>
                        <sp-textfield 
                            placeholder="Color label" 
                            value={colorLabel===null? '' : colorLabel}
                            id="colorLabel"
                            xs={12}>
                            <sp-label isrequired="false" slot="label">Color label</sp-label>
                        </sp-textfield>
                    </Grid>
                    <Grid item xs={12}>
                        <sp-textfield 
                            placeholder="Color value" 
                            value={selectedColor===null? '' : selectedColor.substring(selectedColor.lastIndexOf("#"), selectedColor.length)}
                            id="colorValue"
                            xs={12}>
                            <sp-label isrequired="false" slot="label">Color value</sp-label>
                        </sp-textfield>
                    </Grid>
                </Grid>
                <Grid container justify="flex-start">
                    <Grid item xs={4}>
                        <UpdateColorButton/>    
                    </Grid>
                    <Grid item xs={4}>
                        <DelColorButton/>    
                    </Grid>
                    <Grid item xs={2}>
                        <AddColorButton/>
                    </Grid>
                </Grid>
            </sp-body>
        </div>*/}

        <div class="group" ><sp-label>Edit Palette</sp-label>
            <sp-body size="XS" >
                <Grid container justify="flex-start"> 
                    <Grid item xs={4}>
                        <ImportPaletteButton/>
                    </Grid>
                    <Grid item xs={4}>
                        <ExportPaletteButton/>
                    </Grid>
                </Grid>
            </sp-body>
        </div>
        
    </div>
    )
    // the code that construct the panel
    return (
        <Grid container className={classes.root} style={{overflowY: "hidden"}}>
            
            <Grid item xs={5} className={classes.scenes}>
                <Scenes scenes={scenes}
                        activeScene={activeScene}
                        setActiveScene={setActiveScene}
                        setIsFlatting={setIsFlatting}
                        startFlatting={getFlatting}
                        setIsInitail={setIsInitail}
                        setScenes={setScenes}
                        getScenes={getScenes}
                        setflatClicked={setflatClicked}
                        isShowing={isShowing}
                        showFlat={showFlat}/>
                <sp-action-button id="addFlatButton" onClick={loadNewScenes}>
                    <div slot="icon" class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
                          <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" />
                          <path class="a" d="M9,1a8,8,0,1,0,8,8A8,8,0,0,0,9,1Zm5,8.5a.5.5,0,0,1-.5.5H10v3.5a.5.5,0,0,1-.5.5h-1a.5.5,0,0,1-.5-.5V10H4.5A.5.5,0,0,1,4,9.5v-1A.5.5,0,0,1,4.5,8H8V4.5A.5.5,0,0,1,8.5,4h1a.5.5,0,0,1,.5.5V8h3.5a.5.5,0,0,1,.5.5Z" />
                        </svg>
                    </div>
                    Add
                </sp-action-button>
            </Grid>

            {/*<Grid item container xs={6} style={{ padding: 10 }}>*/}
            <Grid item container xs={7}>
                <Grid>
                    <StyledTabs
                        value={tab}
                        onChange={handleTabChange}
                        variant='fullWidth'
                        disabled={isFlatting}>
                        <StyledTab label="Flat" />
                        <StyledTab label="Tweak" />
                        <StyledTab label="Settings" />
                    </StyledTabs>
                    { tab === 0 ? FlattingTab : (tab === 1? ColoringTab : PaletteTab) }
                </Grid>
            </Grid>
        </Grid>
    );
}

// Icon for tab is not work
const FlatIcon = ()=>{
    return (
        <SvgIcon xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
          <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" />
          <path class="a" d="M9,1a8,8,0,1,0,8,8A8,8,0,0,0,9,1Zm5,8.5a.5.5,0,0,1-.5.5H10v3.5a.5.5,0,0,1-.5.5h-1a.5.5,0,0,1-.5-.5V10H4.5A.5.5,0,0,1,4,9.5v-1A.5.5,0,0,1,4.5,8H8V4.5A.5.5,0,0,1,8.5,4h1a.5.5,0,0,1,.5.5V8h3.5a.5.5,0,0,1,.5.5Z" />
        </SvgIcon>)
}
export default function ThemedPanel() {
    return (
        <ThemeProvider theme={theme}>
            <Panel />
        </ThemeProvider>
    )
}

// export default function ThemedPanel() {
//     return (
//         <Provider theme={defaultTheme}>
//             <Panel />
//         </Provider>
//     )
// }
//  