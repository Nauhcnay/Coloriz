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

/*
local variables
*/

const scroll = { overflowY: 'scroll'};
const divSmall = { height:"20%" }
const divLarge = { height:"60%" };

// icons 
// this is not work on sandbox
const colorIcon = (props) => (
  <SvgIcon {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" width="12.748" height="10.736" viewBox="0 0 12.748 10.736">
      <g id="Group_2715" data-name="Group 2715" transform="translate(-237.496 -204.624)">
        <path id="Path_1630" data-name="Path 1630" d="M249.579,211.2a.776.776,0,0,0,.32-.963l-.919-2.22a.776.776,0,0,0-.717-.479.512.512,0,1,1-.263-.988l-1.7-1.7a.776.776,0,0,0-1.1,0l-7.481,7.484a.776.776,0,0,0,0,1.1l1.7,1.7a.775.775,0,0,0,1.08.016h8.966a.776.776,0,0,0,.776-.776v-2.4A.776.776,0,0,0,249.579,211.2Zm-9.533,2.331a.512.512,0,1,1,0-.725A.512.512,0,0,1,240.047,213.533ZM248.132,208a.344.344,0,0,1,.45.187l.919,2.22a.345.345,0,0,1-.186.451l-7.711,3.193,5.71-5.712Zm-3.186-1.672a1.119,1.119,0,1,1,0,1.583A1.119,1.119,0,0,1,244.946,206.324ZM243,208.27h0a1.119,1.119,0,0,1,1.582,1.583h0a1.119,1.119,0,0,1-1.582,0h0A1.12,1.12,0,0,1,243,208.27Zm-1.945,1.945a1.119,1.119,0,1,1,0,1.583A1.118,1.118,0,0,1,241.057,210.215Zm8.756,4.157a.345.345,0,0,1-.345.345h-8.353l7.467-3.092h.886a.345.345,0,0,1,.345.345Z" transform="translate(0 0)" fill="#9ae42c"/>
      </g>
    </svg>
  </SvgIcon>
);
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

    scenes: {
        overflowY: 'scroll',
    },

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


const ButtonStyleSmall = {
            color:"#9AE42C", 
            fontSize: 2,
            border: '1px solid',
            width:90, 
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
        disabled={props.isLoading}
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
        style={ButtonStyleLarge}>
        {props.isLoading ? "Reset Result" : "Show Result"}
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
let palette = [
                    {'name':'palette A', 'colors':colors_test}, 
                    {'name':'palette B','colors':colors_test}
                ];


// const StyledTabs = withStyles({
//   indicator: {
//     display: 'flex',
//     justifyContent: 'center',
//     backgroundColor: 'transparent',
//     '& > span': {
//       maxWidth: 40,
//       width: '100%',
//       backgroundColor: '#635ee7',
//     },
//   },
// })((props) => <Tabs {...props} TabIndicatorProps={{ children: <span /> }} />);

// const StyledTab = withStyles((theme) => ({
//   root: {
//     textTransform: 'none',
//     color: '#fff',
//     fontWeight: theme.typography.fontWeightRegular,
//     //fontSize: theme.typography.pxToRem(1),
//     fontSize: '5px',
//     marginRight: theme.spacing(1),
//     '&:focus': {
//       opacity: 1,
//     },
//   },
// }))((props) => <Tab disableRipple {...props} />);



/*
Main framework
*/
// main function which constructe the panel
// why put everthing into a function? not a class?
var StartFlatting = false;
var scenesGlobal;
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
      };

    const [isMerging, setIsMerging] = useState(false);
    const [isSplitting, setIsSplitting] = useState(false);
    // const [isFlatting, setIsFlatting] = useState(1);
    const [isFlatting, setIsFlatting] = useState(false);
    const [isInitail, setIsInitail] = useState(true);
    const [flatClicked, setflatClicked] = useState(false);
    const [paletteChange, setPaletteChange] = React.useState(palette);
    const [selectedColor, setSelectedColor] = React.useState(null);


    const [brushMode, setBrushMode] = useState('merge');
    // const [brushSize, setBrushSize] = React.useState(20);
    
    const handleBrushModeChange = (event) => {
        setBrushMode(event.target.value);
    };
    const [mergeBrushSize, setMergeBrushSize] = useState(20); // unused
    const [splitBrushSize, setSplitBrushSize] = useState(3); // unused

    const mergeInstructionText = 'Brush over different segments that need to be merged. When ready, click Merge.'
    const splitInstructionText = 'Connect unconnected green lines where you with to split. When ready, click Split.'    

    // useEffect(() => {
    //     if (brushMode === 'merge') {
    //         handleMergeToolClick(mergeBrushSize)
    //     }
    //     else if (brushMode === 'splitfine') {
    //         handleFineSplitToolClick(splitBrushSize)
    //     }
    //     else if (brushMode === 'splitcoarse') {
    //         handleCoarseSplitToolClick(mergeBrushSize)
    //     }
    // }, [brushMode]);
    
    // useEffect is a hook to call after state variables updated
    useEffect(() => {
        if (scenes.length > 0)
            tryFlat();
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

    const ColorizeButton = <TwoStateButton onClick={tryMerge} text="Colorize" isLoading={isMerging}/>
    const TuningButton = <TwoStateButton onClick={trySplitFine} text="Tuning" isLoading={isSplitting}/>
    // const MergeButton = <TwoStateButton onClick={tryMerge} text="Merge" isLoading={isMerging}/>
    // const SplitButtonFine = <TwoStateButton onClick={trySplitFine} text="Fine Split" isLoading={isSplitting}/>
    // const SplitButtonCoarse = <TwoStateButton onClick={trySplitCoarse} text="Coarse Split" isLoading={isSplitting}/>
    //const FlatButton = <ThreeStateButton onClick={tryFlat} isLoading={isFlatting} text={isFlatting === 0 ? "Loading" : "Flat"}/>
    const FlatButton = <TwoStateButtonFlat onClick={showFlat} isLoading={flatClicked}/>
    
    const SavePaletteButton = () => {
        return (
        <Button
            variant="outlined"
            style={ButtonStyleSmall} 
            onClick={savePalette}>
        Save
        </Button>)
    };

    const LoadPaletteButton = () => {
        return (
        <Button 
            variant="outlined"
            style={ButtonStyleSmall} 
            onClick={readPalette}>
        Load
        </Button>)
    };

    const StartTuningButtom = () => {
        return (
        <Button 
            variant="outlined"
            style={ButtonStyleSmall} 
            onClick={()=>handleFineSplitToolClick(3)}>
        Start
        </Button>)
    };
    const handleBrushSizeChange = (event) => {
        document.querySelector("#mergeSlider").value = Number(event.target.value);
        document.querySelector("#mergeText").value = Number(event.target.value);
    };

    const handleInputChange = () => {

        handleMergeToolClick(document.querySelector("#mergeSlider").value);
    };

    const handleBlur = () => {
        handleMergeToolClick(document.querySelector("#mergeSlider").value);
    };

    async function readPalette(){
        // open a json palette
        const file = await fs.getFileForOpening({
            allowMultiple: false,
            types: st.fileTypes.text
        });
        let paletteText = await file.read();
        if (typeof paletteText !== undefined)
            setPaletteChange(JSON.parse(paletteText));
    }

    async function savePalette(){
        let paletteText = JSON.stringify(paletteChange);
        const file = await createNewFileDialog();
        if (!file) {
            // no file selected, or the user didn't want to overwrite one they did select
            return;
        }
        await file.write(paletteText);

    }
    async function showFlat(){
        // setIsFlatting(0)
        console.log("Display current flatting result...")
        try {
            await flatSingle();
            setflatClicked(true);
        }
        catch (e) {
            console.log(e)
        }
        // setIsFlatting(2)
    };

    async function tryFlat() {
        let updatedScenes = scenes;
        setIsFlatting(true);
        console.log("Flatting all loaded images...");
        // await flatAllBackground(scenes);    
        // flat all images in the opened scenes
        // setFlatting(true);
        var i;
        for (i = 0; i < updatedScenes.length; i++){
            console.log('Flatting image: ' + updatedScenes[i].fileName);
            try{
                if (updatedScenes[i].flatted === false){
                    updatedScenes = await flatSingleBackground(i, updatedScenes);
                    setScenes(updatedScenes);
                    scenesGlobal = updatedScenes;
                    if (app.activeDocument._id == updatedScenes[i].documentID){
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

    }

    async function tryMerge() {
        setIsMerging(true)
        try {
            await merge();
            
        }
        catch (e) {
            console.log(e)
        }
        setIsMerging(false)
    }

    async function trySplitFine() {
        setIsSplitting(true)
        try {
            await splitfine()
        }
        catch (e) {
            console.log(e)
        }
        setIsSplitting(false)
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
    async function flatSingleBackground(index, updatedScenes){
        // read data from selected input
        // const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
        const { fileName, documentID, base64String } = updatedScenes[index];
        
        // convert readed data to the input format of API
        const data = {
            image: base64String,
            net: 512,
            radius: 1,
            preview: false
        }

        // construct the server API entrance
        // Todo: make this apprea on the panel, let is editable
        const url = 'http://68.100.80.232:8080/flatsingle'

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

        const newScenes = updatedScenes.map(scene => {
            if (scene.documentID === documentID) {
                return {
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
                    // spread syntax
                    ...scene,
                    line_artist,
                    line_simplified,
                    image,
                    fill_artist,
                    line_hint,
                    flatted: true,
                }
            }
            
            return scene;
        })  
        return newScenes;
    }

    async function flatAllBackground(newScenes){
        // flat all images in the opened scenes
        var i;
        for (i = 0; i < newScenes.length; i++){
            console.log('Flatting image: ' + newScenes[i].fileName);
            try{
                if (newScenes[i].flatted === false){
                    let updatedScenes = await flatSingleBackground(newScenes[i]);
                    setScenes(updatedScenes);
                }
                continue;
            }
            catch (e){
                console.log(e);
            }
        }
        
    }

    async function flatSingle() {
        console.log('loading flatting results...')
        setRGBMode();
        // read data from selected input
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
        try{
            const { line_artist, line_simplified, image, line_hint } = scene;
            console.log('Flatting done!')
            
            console.log('Loading result');
            if (await createLinkLayer("result_neural", image, true) === null){
                return null;
            }
            console.log('Loading line art');
            if (await createLinkLayer("line_artist", line_artist, true) === null){
                return null;
            }
            console.log('Loading line hint');
            if (await createLinkLayer("line_hint", line_hint, true) === null){
                return null;
            }
            console.log('Loading line simple');
            if (await createLinkLayer("line_simplified", line_simplified, true) === null){
                return null;
            }
            // update the scenes click state
            let sceneNew = scenes.map(scene=>{
                if (scene.clicked === false){
                    scene.clicked = true;
                    return scene;
                }
                else
                    return scene;
            })
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
        const stroke = await loadBase64('merge-hint.png');

        // load the fill results
        await saveFillNeuralLayer();
        const fill_neural = await loadBase64('fill-neural.png');
        
        await saveLineArtistLayer();
        const line_artist = await loadBase64('line-artist.png');

        // construct the merge input 
        const data = {
            line_artist: line_artist,
            fill_neural: fill_neural,
            fill_artist: scene.fill_artist,
            stroke,
        }
        const url = 'http://68.100.80.232:8080/merge'
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
        let newLayer = await createLinkLayer("result_neural", image);
        if (newLayer === null){
            return null;
        }
        await moveResultLayerBack(newLayer);

        console.log('Loading line simplified');
        newLayer = await createLinkLayer("line_simplified", line_simplified);
        if (newLayer === null){
            return null;
        }
        await moveSimplifiedLayerBack(newLayer);
        mergeLayer.selected = true;
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
                
        const newScenes = scenes.map(scene => {
            if (scene.documentID === app.activeDocument._id) {
                return {
                    ...scene,
                    fill_neural,
                    image,
                }
            }
            return scene
        })
        setScenes(newScenes)
        console.log('scenes saved in React state')
    }

    async function splitcoarse() {
        console.log('Coarse Splitting...')
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
        const { fileName } = scene;
        
        let splitLayer = await saveCoarseSplitHintLayer();
        const stroke = await loadBase64('split-hint-coarse.png')

        // load the fill results
        await saveFillNeuralLayer();
        const fill_neural = await loadBase64('fill-neural.png');
        
        await saveLineArtistLayer();
        const line_artist = await loadBase64('line-artist.png');
        
        const data = {
            line_artist: line_artist,
            fill_neural: fill_neural,
            fill_artist: scene.fill_artist,
            stroke,
        }
        console.log('sending request...')
        const url = 'http://68.100.80.232:8080/splitauto'
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        console.log('got response')
        console.log(response)
        
        const result = await response.json();
        console.log('got result')
        console.log(result)

        const { line_simplified, image} = result;
        console.log('Splitting done!')

        console.log('Loading result');
        let newLayer = await createLinkLayer("result_neural", image);
        if (newLayer === null){
            return null;
        }
        await moveResultLayerBack(newLayer);

        console.log('Loading line simplified');
        newLayer = await createLinkLayer("line_simplified", line_simplified);
        if (newLayer === null){
            return null;
        }
        await moveSimplifiedLayerBack(newLayer);

        splitLayer.selected = true;
        /*
        Old codes
        */
        // console.log('Saving images...')
        // await saveBase64Image(image, `${fileName}-result.png`)
        // await saveBase64Image(line_simplified, `${fileName}-line_simplified.png`)
        // layers.forEach(async(layer, index) => {
        //     await saveBase64Image(layer, `${fileName}-segment-${index}.png`)
        // })
        
        // console.log('Loading image....')
        // await loadResult(fileName, true)
        // await loadLineSimplified(fileName, true)
        // await selectLayerByName('split-hint')

        const newScenes = scenes.map(scene => {
            if (scene.documentID === app.activeDocument._id) {
                return {
                    ...scene,
                    fill_neural,
                    image,
                }
            }
            return scene
        })
        setScenes(newScenes)
        console.log('scenes saved in React state')
    }

    async function splitfine() {
        console.log('Fine Splitting...');
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0];
        const { fileName } = scene;
        
        let splitLayer = await saveFineSplitHintLayer();
        const stroke = await loadBase64('split-hint-fine.png');

        // load the fill results
        await saveFillNeuralLayer();
        const fill_neural_in = await loadBase64('fill-neural.png');
        
        await saveLineArtistLayer();
        const line_artist_in = await loadBase64('line-artist.png');
        
        const data = {
            line_artist: line_artist_in,
            fill_neural: fill_neural_in,
            fill_artist: scene.fill_artist,
            stroke,
        };
        
        console.log('sending request...');
        const url = 'http://68.100.80.232:8080/splitmanual';
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
        console.log(result);
        const { line_artist, line_simplified, image } = result;
        console.log('Splitting done!');

        console.log('Loading result');
        let newLayer = await createLinkLayer("result_neural", image);
        if (newLayer === null){
            return null;
        }
        await moveResultLayerBack(newLayer);

        console.log('Loading line artist');
        newLayer = await createLinkLayer("line_artist", line_artist);
        if (newLayer === null){
            return null;
        }
        await moveArtistLayerBack(newLayer);

        console.log('Loading line simplified');
        newLayer = await createLinkLayer("line_simplified", line_simplified);
        if (newLayer === null){
            return null;
        }
        await moveSimplifiedLayerBack(newLayer);

        splitLayer.selected = true;
        /*
        Old way of loading layers 
        */
        // console.log('Saving images...');
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

        // set results to scenes in React, so it can update the UI correspondingly
        const newScenes = scenes.map(scene => {
            if (scene.documentID === app.activeDocument._id) {
                return {
                    ...scene,
                    line_simplified,
                    image,
                    line_artist
                }
            }
            return scene
        })
        setScenes(newScenes)
        console.log('scenes saved in React state')

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
            // if we can't 
            console.log('we are here!');
        }
        if (event === 'select'){
            console.log("some doc is seleted!");
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
    
    const handleColorBlobClick = async(name, hex) => {
        setSelectedColor(name+hex);
        await activatePaintBucket()
        await setColor(hex)
        handleMergeToolClick(document.querySelector("#mergeSlider").value);
    }

    const ColorBlob = ({name, hex, selected }) => {
        if (selected === name+hex)
            return (
                <Badge color="primary" variant="dot" invisible={false}>
                    <Grid onClick={() => handleColorBlobClick(name, hex)} style={{ backgroundColor: hex, width: 20, height: 20, margin: 2}}/>
                </Badge>
            );
        else
            return <Grid onClick={() => handleColorBlobClick(name, hex)} style={{ backgroundColor: hex, width: 20, height: 20, margin: 2}}/>;
    }
    
    const PaletteGrid = ({p})=>{
        return (
        <>
            <br/>{p.name}
            <Grid item xs={12} style={{ display: 'flex' }}>
                <Grid container justify="flex-start" spacing={1}>
                    {p.colors.map(hex => <ColorBlob key={hex} hex={hex} selected={selectedColor} name={p.name}/>)}
                </Grid>
            </Grid>
        </>
        )
    }

    const InitailTab = ()=>{
        return (<sp-body size="XS">
                   1. Click "Add" on the left to add scenes.<br />
                   2. Select one scene to start.
                </sp-body>)
    };

    const WorkingTab = ()=>{
        return (<sp-body size="XS">
                   1. Click "Add" on the left to add scenes.<br />
                   2. Preparing for flatting...
                </sp-body>)
    };

    const ReadyTab = ()=>{
        return (<sp-body size="XS">
                   1. Click "Add" on the left to add scenes.<br />
                   2. This scene is ready to flat. { FlatButton }<br />
                   3. Pick a color from a palette and brush over segments. Once ready, press { ColorizeButton }
                </sp-body>)
    };

    const FlattingTab = (      
        //https://www.reactenlightenment.com/react-jsx/5.1.html
        // JSX allows us to put HTML into JavaScript.
        // https://reactjs.org/docs/introducing-jsx.html 
        <>
            <div class="group"><sp-label>Instruction</sp-label>
                {isInitail? <InitailTab/> : (isFlatting ? <WorkingTab/> : <ReadyTab/>)}
            </div>
            <div class="group"><sp-label>Palette</sp-label>
            <sp-body size="XS" >
                <div xs={12} style={scroll}>
                {paletteChange.map((p)=> <PaletteGrid key={p.name} p={p}/>)}
                </div>
                <div xs={12} align="left">
                   <LoadPaletteButton/> <SavePaletteButton/>
                </div>
                <br/>
            </sp-body>
            </div>
            <div class="group"><sp-label>Brush</sp-label>
            <sp-body>
                {/*<Slider
                    labelPosition="side"
                    label="Size"
                    minValue={50}
                    maxValue={150}
                    value={typeof mergeBrushSize === 'number' ? mergeBrushSize : 20}
                    onChange={handleSliderChange}
                    showValueLabel={true}>
                </Slider> */}
                
                    
                    {/*<input
                        id="mergeText"
                        type="number"
                        //value={0}
                        
                        onChange={handleBrushSizeChange}
                        style={{width:"15%"}}
                        onBlur={handleBlur}/>*/}
                        
               
                    <sp-slider
                        id="mergeSlider"
                        type="range" 
                        min="1" 
                        max="100"
                        step="1"
                        //value={20}
                        onMouseUp={handleInputChange}
                        
                        style={{width:"100%"}}>
                        <sp-label slot="label">Size</sp-label> 
                    </sp-slider>
            </sp-body>
            </div>
            
            {/*<Grid item xs={12}>
                { BrushRadioGroup }
            </Grid>
            
            {<Grid item xs={12}>
                <Typography variant="h6" component="div">
                    Instruction:
                </Typography>
                <Typography variant="body2" component="div">
                    { brushMode === 'merge' ? mergeInstructionText : splitInstructionText }
                </Typography>
            </Grid>}

            <Grid item xs={12}>
                <img
                    src={brushMode === 'merge' ? mergeInstruction : splitInstruction}
                    alt="split-instruction"
                    width="100%"
                    height="93"
                />
            </Grid>
            
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center'}}>
                {brush()}
            </Grid>*/}
        </>
        
    );

    const colorInsturctionText = 'Select the color in the palette that you want to apply to the selected layer, and use the bucket fill tool to change the color.'
    
    // what these function does?
    // const characterDummy = {
    //     id: 0,
    //     characterName: '',
    //     colors: ['red']
    // }
    // const [characters, setCharacters] = useState([characterDummy])
    // const addCharacter = () => {
    //     const newCharacters = [
    //         ...characters,
    //         {
    //             id: characters.length,
    //             characterName: '',
    //             colors: []
    //         }
    //     ]
    //     setCharacters(newCharacters)
    // }
    // const handleCharacterNameChange = (newName, id) => {
    //     const newCharacters = characters.map(character => {
    //         if (character.id === id) {
    //             return {
    //                 ...character,
    //                 characterName: newName
    //             }
    //         }
    //         return character
    //     })
    //     setCharacters(newCharacters)
    // }
    
    

    // const Palette = ({ id, characterName, colors, handleChange }) => (
    //     <div>
    //         <TextField
    //             label="Name"
    //             value={characterName}
    //             onChange={(value) => handleChange(value, id)}
    //          />
    //         <div style={{ display: 'flex' }}>
    //             {colors.map(color => <handleColorBlobClick key={id+color} color={color}/>)}
    //             <Button style={{width:20, height:20, margin: 0, padding: 0}}>+</Button>
    //         </div>
    //     </div>
    // )
    // const [activeColor, setActiveColor] = useState('#fff')
    // const [colorPickerVisible, setColorPickerVisible] = useState(true)
    /**
     * Color picker 
     */
    // const handleColorChangeComplete = (color) => {
    //     setActiveColor(color.hex);
    // };

    // const handleColorAccept = () => {
    //     console.log('color accept')
    //     // let index;
    //     // let IS_LAST = false;
    //     // this.setState(state => {
    //     // const { activeCharacter, color, activeColorButton } = state;
    //     // this.updateSceneCharacter(activeCharacter);

    //     // // activeColorButton = `${activeCharacter} - Color ${index}`
    //     // index = parseInt(activeColorButton.substr(activeColorButton.lastIndexOf(' ') + 1), 10) - 1;
    //     // const characters = state.characters.map((character) => {
    //     //     if (character.name === activeCharacter) {
    //     //     let colors;
    //     //     if (character.colors.length === index) {
    //     //         colors = [...character.colors, color];
    //     //         IS_LAST = true;
    //     //     }
    //     //     else {
    //     //         colors = character.colors.map((c, i) => {
    //     //         if (i === index) {
    //     //             return color;
    //     //         }
    //     //         else {
    //     //             return c;
    //     //         }
    //     //         });  
    //     //     }
    //     //     return {
    //     //         colors,
    //     //         name: character.name,
    //     //     };
    //     //     }
    //     //     else {
    //     //     return character;
    //     //     }
    //     // })
    //     // return { 
    //     //     characters,
    //     //     colorPickerVisible: false,
    //     //     activeColorButton: `${activeCharacter} - Color ${index + 1}`,      
    //     // }
    //     // }, () => {
    //     // const { activeCharacter, color } = this.state;
    //     // this.handleColorSingleClick(activeCharacter, color, index);
    //     // if (!IS_LAST) {
    //     //     const characterName = activeCharacter;
    //     //     const segmentNum = index + 1;
    //     //     const args = JSON.stringify({ characterName, segmentNum, color })
    //     //     evalExtendscript(`updateSegmentColor(${args})`);
    //     // }
    //     // });
    // }

    // const handleColorCancel = () => {
    //     setColorPickerVisible(false);
    // }

    
    
    
    // TODO: try to make this function connect to API, or just remove this function
    const LoadSegmentsButton = <twoStateButton onClick={loadSegments} text="Load Segments" isLoading={false}/>
    const ColoringTab = (
        <>
            <div class="group" ><sp-label>Instruction</sp-label>
                <sp-body size="XS">
                    if some lines don't accurately separate segments, redarw for boundary tuning.
                    <img
                        src={splitInstruction}
                        alt="split-instruction"
                        width="100%"
                        height="93"
                    />
                <Grid container justify="flex-start">
                    <Grid item xs={6}>
                        <StartTuningButtom></StartTuningButtom>
                    </Grid>
                    <Grid item xs={6}>
                        {TuningButton}
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
                        setflatClicked={setflatClicked}/>
                <Button 
                    onClick={loadNewScenes}
                    style={AddButtonStyle}>
                        + Add
                </Button>
            </Grid>

            {/*<Grid item container xs={6} style={{ padding: 10 }}>*/}
            <Grid item container xs={7}>
                <Grid>
                    <StyledTabs
                        value={tab}
                        onChange={handleTabChange}
                        variant='fullWidth'>
                        <StyledTab label="Coloring" />
                        <StyledTab label="Tuning" />
                    </StyledTabs>
                    { tab === 0 ? FlattingTab : ColoringTab }
                </Grid>
            </Grid>
        </Grid>
    );
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