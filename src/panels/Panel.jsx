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
    moveAboveTo
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
      // width: '100%',
      // maxWidth: 360,
    },

    // scenes: {
    //     overflowY: 'scroll',
    // },

    radioGroup: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    input: {
        width: 100,
        height: 100,
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
      width:"250px"};

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

const colors_test = ['#4D4D4D', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF'];
const colors_test_map_1 = colors_test.map((c)=>{return {"label": "label a", "color":c}})
const colors_test_map_2 = colors_test.map((c)=>{return {"label": "label b", "color":c}})
let palette = [
                    {'name':'palette A', 'colors':colors_test_map_1}, 
                    {'name':'palette B','colors':colors_test_map_2}
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
var fastHistory = false; 
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
        if (newValue===1)
            handleFineSplitToolClick(3);
        if (newValue===0)
            handleMergeToolClick(mergeSize);
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
    const [backEnd, setBackEnd] = React.useState("remote");



    const [brushMode, setBrushMode] = useState('merge');
    const [brushSize, setBrushSize] = React.useState(10);
    
    const handleBrushModeChange = (event) => {
        setBrushMode(event.target.value);
    };

    const mergeInstructionText = 'Brush over different segments that need to be merged. When ready, click Merge.'
    const splitInstructionText = 'Connect unconnected green lines where you with to split. When ready, click Split.'    

   
    // useEffect is a hook to call after state variables updated
    useEffect(() => {
        // check if all scene have been flatted
        if (isFlattingGlobal === false && flattingSubmission > 0) {
            tryFlat();
        }
        if (scenes.length === 0)
            flattingSubmission = 0;
    }, [scenes]);

    const BrushRadioGroup = (
        <FormControl component="fieldset">
            <FormLabel component="legend">Brush Mode</FormLabel>
            <RadioGroup className={classes.radioGroup} aria-label="brush" name="brush" value={brushMode} onChange={handleBrushModeChange}>
                <FormControlLabel value="merge" control={<RedRadio />} label={<p style={{color: red[800]}}>Merge</p>} />
                <FormControlLabel value="splitfine" control={<YellowRadio />} label={<p style={{color: yellow[400]}}>Fine Split</p>} />
                <FormControlLabel value="splitcoarse" control={<BluewRadio />} label={<p style={{color: blue[400]}}>Coarse Split</p>} />
            </RadioGroup>
        </FormControl>
    )

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
        setBrushSize(document.querySelector("#mergeSlider").value);
        handleMergeToolClick(document.querySelector("#mergeSlider").value);
        mergeSize = document.querySelector("#mergeSlider").value;
    };


    async function reorderFlat(){
        setIsFlatting(true);
        // reorder the result layer
        try{
            var bottomLayer;
            let layerNeural = await getLayerByName("result_neural");
            if (layerNeural===false){
                app.showAlert("can't find the flatting layer, start to reset current document");
                await displayScene(0);
            }
            else{
                bottomLayer = app.activeDocument.layers[app.activeDocument.layers.length - 1];
                await moveAboveTo(layerNeural, bottomLayer);
            }

            let layerArtist = await getLayerByName("line_artist");
            bottomLayer = layerNeural;
            await moveAboveTo(layerArtist, bottomLayer);

            let layerLineHint = await getLayerByName("line_hint");
            bottomLayer = layerArtist;
            await moveAboveTo(layerLineHint, bottomLayer);

            let layerSimplified = await getLayerByName("line_simplified");
            bottomLayer = layerArtist;
            await moveAboveTo(layerSimplified, bottomLayer);

            let layerMergeHint = await getLayerByName("merge-hint");
            if (layerMergeHint !== false){
                if (layerMergeHint.locked === true){
                    bottomLayer = layerSimplified;
                    await moveAboveTo(layerMergeHint, bottomLayer);        
                }
                else
                    await moveLayerToTop(layerMergeHint, true)
            }

            let layerSplitHint = await getLayerByName("split-hint");
            if (layerSplitHint !== false){
                if (layerSplitHint.locked === true){
                    bottomLayer = layerSimplified;
                    await moveAboveTo(layerSplitHint, bottomLayer);        
                }
                else
                    await moveLayerToTop(layerSplitHint, true)
            }    
        }
        catch(e){
            console.log(e)
        }
            
        setIsFlatting(false);
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
        let end = app.activeDocument.layers.length;
        for (i=0; i < end; i++){    
            if (app.activeDocument.layers[i].name === "result_neural" || i == end - 1){
                app.activeDocument.layers[i].visible = true;
            }
            else
                app.activeDocument.layers[i].visible = false;
        }
    };

    async function showEditMode(){
        let i;
        let end = app.activeDocument.layers.length;
        for (i=0; i < end; i++){
            app.activeDocument.layers[i].visible = true;       
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
        for (i = 0; i < end; i++){
            console.log('Flatting image: ' + updatedScenes[i].fileName);
            try{
                if (updatedScenes[i].flatted === false){
                    haveNewSceneFlatted = true;
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
    async function flatSingleBackground(targetScene){
        // read data from selected input
        // const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
        const { fileName, documentID, base64String, resize } = targetScene;
        
        // convert readed data to the input format of API
        const data = {
            image: base64String,
            net: 512,
            radius: 1,
            preview: false,
            resize
        }

        // construct the server API entrance
        // Todo: make this apprea on the panel, let is editable
        var url;
        if (backEnd === "remote"){
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

        if (fastHistory){
            // in fast history mode, we don't need to waste memory to save a large scene
            targetScene["flatted"] = true;
            targetScene["line_artist"] = line_artist;
            targetScene["line_simplified"] = line_simplified;
            targetScene["image"] = image;
            targetScene["fill_artist"] = fill_artist;
            targetScene["line_hint"] = line_hint;
            // these two layers also need to be added into the undo list
            targetScene["merge_hint"] = null;
            targetScene["split_hint"] = null;
            targetScene["historyIndex"]++;
        }
        else{
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
        }
        
        return targetScene;
    }

    
    async function displayScene(offset, fix=true) {
        // display the selected content to photoshop
        console.log('loading flatting results...')
        setRGBMode();
        // read data from selected input
        const scene = scenesGlobal.filter(scene => scene.documentID === app.activeDocument._id)[0]
        try{
            if ((scene.historyIndex + offset) < 1){
                app.showAlert("This is the end of undo list");
                return null;
            }
            if ((scene.historyIndex + offset) > scene.image.length - 1){
                app.showAlert("This is the end of redo list");
                return null;
            }
            // the offset means the moving the 
            scene.historyIndex = scene.historyIndex + offset;
            const line_artist = scene.line_artist[scene.historyIndex];
            const line_simplified = scene.line_simplified[scene.historyIndex];
            const image = scene.image[scene.historyIndex];
            const line_hint = scene.line_hint[scene.historyIndex];
            const merge_hint = scene.merge_hint[scene.historyIndex];
            const split_hint = scene.split_hint[scene.historyIndex];
            const batchPlay = photoshop.action.batchPlay;

            // const { line_artist, line_simplified, image, line_hint } = scene;
        
                 
            console.log('Loading result');
            if (image !== null){
                if (await createLinkLayer("result_neural", image, true, true, false, app.activeDocument, fix) === null){
                   return null;
                }    
            }
            else
                console.log('Loading result failed');
            
            console.log('Loading line art');
            if (line_artist !== null){
                if (await createLinkLayer("line_artist", line_artist, true) === null){
                return null;
                }    
            }
            else
                console.log('Loading line art failed');
            
            console.log('Loading line hint');
            if (line_hint !== null){
                if (await createLinkLayer("line_hint", line_hint, true) === null){
                return null;
                }    
            }
            else
                console.log('Loading line hint failed');
            
            console.log('Loading line simple');
            if (line_simplified !== null){
                if (await createLinkLayer("line_simplified", line_simplified, true) === null){
                return null;
                }    
            }
            else
                console.log('Loading line simple failed');

            console.log('Loading merge hint');
            if (merge_hint !== null){
                let mergeLayer = await createLinkLayer("merge-hint", merge_hint, true, false, true);
                if ( mergeLayer === null){
                return null;
                }
                else{
                    mergeLayer.locked = false;
                    mergeLayer.selected = true;
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
            else
                console.log('Loading merge hint failed');

            console.log('Loading split hint');
            if (split_hint !== null){
                let splitLayer = await createLinkLayer("split-hint", split_hint, true, false, true);
                if ( splitLayer === null){
                return null;
                }
                else{            
                    splitLayer.locked = false;
                    splitLayer.selected = true;
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
            else
                console.log('Loading split hint failed');
            
            // update the scenes click state
            scenesGlobal = scenesGlobal.map(scene=>{
                if (scene.clicked === false && scene.documentID === app.activeDocument._id){
                    scene.clicked = true;
                    return scene;
                }
                else
                    return scene;
            })
            setScenes(scenesGlobal);
        }
        catch (e){
            app.showAlert("Flatting error, please reload this image to retry")
        }    
    }

    // Todo: try to add different brush color support
    // But put this task later, this is not important now
    async function merge() {
        console.log('Merging...')

        // select the active document
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
        const { fileName } = scene;
        
        // read the user input
        let mergeLayer = await saveMergeHintLayer();
        if (mergeLayer === false){
            return false;
        }
        const stroke = await loadBase64('merge-hint.png');

        // load the fill results
        // await saveFillNeuralLayer();
        // const fill_neural = await loadBase64('fill-neural.png');
        
        const fill_neural = scene.image[scene.historyIndex];


        let line_artist;
        if (scene.line_artist[scene.historyIndex] !== null && (scene.historyIndex) !== 1){
            // only the last element in the history list is not null means it is 
            // necessary to load the line art layer, otherwise
            // we could save some loading time

            // await saveLineArtistLayer();
            // const line_artist = await loadBase64('line-artist.png');    
            
            // or ... should we just load the last line artist in the history list?
            line_artist = scene.line_artist[scene.historyIndex]
        }
        else
            line_artist = scene.line_artist[1];

        let fill_artist;
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
        console.log('Merging done!')

        console.log('Loading result');
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
        scene.historyIndex = scene.image.length - 1;

        /*
        Old codes
        */
        // console.log('Saving images...')
        // await saveBase64Image(image, `${fileName}-result.png`)
        // await saveBase64Image(line_simplified, `${fileName}-line_simplified.png`) 
        // layers.forEach(async(layer, index) => {
        //     await saveBase64Image(layer, `${fileName}-segment-${index}.png`)
        // })

        
        // console.log('Loading images....')
        // await loadResult(fileName, true)          
        // await loadLineSimplified(fileName, true)
        // await selectLayerByName("merge-hint")
                
        scenesGlobal = scenesGlobal.map(s => {
            if (s.documentID === app.activeDocument._id)
                return scene;
            else
                return s;
        })
        setScenes(scenesGlobal)
        console.log('scenes saved in React state')
    }

    // async function splitcoarse() {
    //     console.log('Coarse Splitting...')
    //     const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
    //     const { fileName } = scene;
        
    //     let splitLayer = await saveCoarseSplitHintLayer();
    //     const stroke = await loadBase64('split-hint-coarse.png')

    //     // load the fill results
    //     await saveFillNeuralLayer();
    //     const fill_neural = await loadBase64('fill-neural.png');
        
    //     await saveLineArtistLayer();
    //     const line_artist = await loadBase64('line-artist.png');
        
    //     const data = {
    //         line_artist: line_artist,
    //         fill_neural: fill_neural,
    //         fill_artist: scene.fill_artist,
    //         stroke,
    //     }
    //     console.log('sending request...')
    //     var url;
    //     if (backEnd === "remote"){
    //         url = 'http://68.100.80.232:8080/splitauto';    
    //     }
    //     else{
    //         url = 'http://127.0.0.1:8080/splitauto';
    //     }

    //     const response = await fetch(url, {
    //         method: 'POST', 
    //         headers: {
    //           'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(data)
    //     })
    //     console.log('got response')
    //     console.log(response)
        
    //     const result = await response.json();
    //     console.log('got result')
    //     console.log(result)

    //     const { line_simplified, image} = result;
    //     console.log('Splitting done!')

    //     console.log('Loading result');
    //     let newLayer = await createLinkLayer("result_neural", image);
    //     if (newLayer === null){
    //         return null;
    //     }
    //     await moveResultLayerBack(newLayer);

    //     console.log('Loading line simplified');
    //     newLayer = await createLinkLayer("line_simplified", line_simplified);
    //     if (newLayer === null){
    //         return null;
    //     }
    //     await moveSimplifiedLayerBack(newLayer);

    //     splitLayer.selected = true;
    //     /*
    //     Old codes
    //     */
    //     // console.log('Saving images...')
    //     // await saveBase64Image(image, `${fileName}-result.png`)
    //     // await saveBase64Image(line_simplified, `${fileName}-line_simplified.png`)
    //     // layers.forEach(async(layer, index) => {
    //     //     await saveBase64Image(layer, `${fileName}-segment-${index}.png`)
    //     // })
        
    //     // console.log('Loading image....')
    //     // await loadResult(fileName, true)
    //     // await loadLineSimplified(fileName, true)
    //     // await selectLayerByName('split-hint')

    //     const newScenes = scenes.map(scene => {
    //         if (scene.documentID === app.activeDocument._id) {
    //             return {
    //                 ...scene,
    //                 fill_neural,
    //                 image,
    //             }
    //         }
    //         return scene
    //     })
    //     setScenes(newScenes)
    //     console.log('scenes saved in React state')
    // }

    async function splitfine() {
        console.log('Fine Splitting...');
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0];
        
        
        let splitLayer = await saveFineSplitHintLayer();
        if (splitLayer === false){
            return false;
        }
        const stroke = await loadBase64('split-hint-fine.png');

        // load the fill results
        // await saveFillNeuralLayer();
        // const fill_neural_in = await loadBase64('fill-neural.png');
        const fill_neural_in = scene.image[scene.historyIndex];
        
        // await saveLineArtistLayer();
        // const line_artist_in = await loadBase64('line-artist.png');
        
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

        console.log('Loading result');
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

        splitLayer.selected = true;

        /*
        Old way of loading layers 
        */
        // console.log('Saving images...');
        // const { fileName } = scene;
        // await saveBase64Image(image, `${fileName}-result.png`);
        // await saveBase64Image(line_simplified, `${fileName}-line_simplified.png`);
        // await saveBase64Image(line_artist, `${fileName}-line_artist.png`)
        // layers.forEach(async(layer, index) => {
        //     await saveBase64Image(layer, `${fileName}-segment-${index}.png`)
        // });
        
        // console.log('Loading image....');
        // await loadLineArtist(fileName, true);
        // await loadResult(fileName, true);
        // await loadLineSimplified(fileName, true); 
        // await selectLayerByName('split-hint')

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
        scene["line_hint"].push(null);

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
        setScenes(scenesGlobal);
        console.log('scenes saved in React state');

    }
    // till now are functions working with my API
    // then the following should about the colorizing part
    async function loadSegments() {
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
        // destructuring assignment
        const { fileName, layers } = scene;
        await loadLayers(fileName, layers.length)       
    }

    async function loadNewScenes() {
        const newScenes = await readFiles();
        if (flattingSubmission < 0){
            flattingSubmission = 0;
            flattingSubmission++;
        }
        else
            flattingSubmission++;
        setIsFlatting(false);
        setScenes([...scenes, ...newScenes]);
        
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
    
    const handleColorBlobClick = async(name, color) => {
        setSelectedColor(name+color);
        await activatePaintBucket();
        await setColor(color);
        handleMergeToolClick(document.querySelector("#mergeSlider").value);

    }
 
    const ColorBlob = ({name, color, selected, label }) => {
        if (selected === name+color){
            setColorLabel(label);
            setSelectedPalette(name);
            return (
                <Badge color="primary" variant="dot" invisible={false}>
                    <Grid 
                        // disabled = {isFlatting || isMerging}
                        onClick={() => handleColorBlobClick(name, color)} 
                        style={{ backgroundColor: color, width: 20, height: 20, margin: 2}}/>
                </Badge>
            );}
        else
            return <Grid 
                        // disabled = {isFlatting || isMerging}
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
                    <sp-action-button label="Refresh" onClick={reorderFlat}>
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
                                overflowY:"scroll"}}>
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
                         style={{    display: "block",
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
    <>
        <div class="group"><sp-label>Choosing backend</sp-label>
                <sp-radio-group selected={backEnd} name="backend">
                    <sp-radio value="local" onClick={()=>setBackEnd("local")}>Local</sp-radio>
                    <sp-radio value="remote" checked onClick={()=>setBackEnd("remote")}>Remote</sp-radio>
                </sp-radio-group>
        </div>

        <div class="group" ><sp-label>Select color</sp-label>
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
        </div>

        <div class="group" ><sp-label>Edit Palette</sp-label>
            <sp-body size="XS" >
                <Grid container justify="flex-start"> 
                    <Grid item xs={4}>
                        <ImportPaletteButton/>
                    </Grid>
                    <Grid item xs={4}>
                        <ExportPaletteButton/>
                    </Grid>
                    <Grid item xs={2}>
                        <DelPaletteButton/>
                    </Grid>
                </Grid>
            </sp-body>
        </div>
        
    </>
    )
    // the code that construct the panel
    return (
        <Grid container className={classes.root}>
            
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
                <sp-action-button label="Flat" onClick={loadNewScenes}>
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
                        variant='fullWidth'>
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