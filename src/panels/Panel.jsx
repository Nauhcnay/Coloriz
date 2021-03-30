// https://reactjs.org/
import React, { useState, useEffect } from "react";
import photoshop from 'photoshop';

// load resource
import mergeInstruction from '../assets/merge-instruction.png'
import splitInstruction from '../assets/split-instruction.png'

// load from own scripts
import {
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
    loadLineHint
} from '../functions';

// where these model come from?
// I guess they are all from node.js
import { Modal } from 'antd';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { TextField } from '@adobe/react-spectrum'
import { red, yellow, blue } from '@material-ui/core/colors';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
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

// seems to be a entrance of using photo
const app = photoshop.app;

const theme = createMuiTheme({
    palette: {
        type: "dark",
        // primary: primaryColor,
        // secondary: secondaryColor,
    }
});

// https://www.w3schools.com/js/js_arrow_function.asp
// pass a call back function to maskeStyles
// but what the const variable used for?
const useStyles = makeStyles((theme) => ({
    root: {
      minWidth: 240,
      height: '100vh'
      // width: '100%',
      // maxWidth: 360,
      // backgroundColor: theme.palette.background.pax`per,
    },
    scenes: {
        overflowY: 'scroll'
    },
    radioGroup: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
}));

// then what this does? what dose with styles returned?
// ah, a function, so again props is a callback function right?
// this seems like insert a code block into the html page frame
const RedRadio = withStyles({
    root: {
      color: red[400],
      
      '&$checked': {
        color: red[600],
      },
    },
    checked: {},
    // but what this means?
    // is this html code or ccs code?
    // is it ok to 
})((props) => <Radio color="default" {...props} />);

const YellowRadio = withStyles({
    root: {
        color: yellow[400],
        
        '&$checked': {
        color: yellow[600],
        },
    },
    checked: {},
})((props) => <Radio color="default" {...props} />);

const BluewRadio = withStyles({
    root: {
        color: blue[400],
        
        '&$checked': {
        color: blue[600],
        },
    },
    checked: {},
})((props) => <Radio color="default" {...props} />);


// Ah I see, so this is the button for both split and merge
const StateFulButton = (props) => (
    // what this code block is?
    // is that html?
    <Button style={{width: '80%', height: 30 }}
        variant="contained"
        disabled={props.isLoading}
        onClick={props.onClick}>
        {props.isLoading ? 'Loading...' : props.text}
    </Button>
);

// then what this function does?
function Panel() {
    const classes = useStyles();
    const [scenes, setScenes] = useState([]);
    const [activeScene, setActiveScene] = useState(0);

    const [tab, setTab] = useState(0);
    const handleTabChange = (event, newValue) => {
        setTab(newValue);
      };

    const [isMerging, setIsMerging] = useState(false);
    const [isSplitting, setIsSplitting] = useState(false);
    const [isFlatting, setIsFlatting] = useState(false);

    const [brushMode, setBrushMode] = useState('merge');
    const handleBrushModeChange = (event) => {
        setBrushMode(event.target.value);
    };
    const [mergeBrushSize, setMergeBrushSize] = useState(20); // unused
    const [splitBrushSize, setSplitBrushSize] = useState(3); // unused

    const mergeInstructionText = 'Brush over different segments that need to be merged. When ready, click Merge.'
    const splitInstructionText = 'Connect unconnected green lines where you with to split. When ready, click Split.'    

    // so this inline function could also be so complex?
    useEffect(() => {
        if (brushMode === 'merge') {
            handleMergeToolClick(mergeBrushSize)
        }
        else if (brushMode === 'splitfine') {
            handleFineSplitToolClick(splitBrushSize)
        }
        else if (brushMode === 'splitcoarse') {
            handleCoarseSplitToolClick(mergeBrushSize)
        }
    }, [brushMode])

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

    const MergeButton = <StateFulButton onClick={tryMerge} text="Merge" isLoading={isMerging}/>
    const SplitButtonFine = <StateFulButton onClick={trySplitFine} text="Fine Split" isLoading={isSplitting}/>
    const SplitButtonCoarse = <StateFulButton onClick={trySplitCoarse} text="Coarse Split" isLoading={isSplitting}/>
    const FlatButton = <StateFulButton onClick={tryFlat} text="Flat" isLoading={isFlatting}/>

    async function tryFlat() {
        setIsFlatting(true)
        try {
            await flatSingle()
        }
        catch (e) {
            console.log(e)
        }
        setIsFlatting(false)
    }

    async function tryMerge() {
        setIsMerging(true)
        try {
            await merge()
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

    async function flatSingle() {
        console.log('Flatting image...')
        
        // I guess this is for multi input? so each scene represents one input opened in the photoshop
        
        // read data from selected input
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
        const { fileName, documentID, base64String } = scene;
        
        // convert readed data to the input format of API
        const data = {
            image: base64String,
            net: 512,
            radius: 1,
            preview: false
        }
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
        const { line_artist, line_simplified, image, fillmap, fillmap_c, palette, line_hint } = result;

        console.log('Flatting done!')
        
        console.log('Saving images...')
        await saveBase64Image(image, `${fileName}-result.png`)
        await saveBase64Image(line_artist, `${fileName}-line_artist.png`) 
        await saveBase64Image(line_simplified, `${fileName}-line_simplified.png`) 
        await saveBase64Image(line_hint, `${fileName}-line_hint.png`) 
        
        console.log('Loading images....')
        await unlockLayer(documentID);
        await loadLineArtist(fileName, true)
        await loadResult(fileName, true)
        await loadLineHint(fileName, true)
        await loadLineSimplified(fileName, true)

        const newScenes = scenes.map(scene => {
            if (scene.documentID === documentID) {
                return {
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
                    // spread syntax
                    ...scene,
                    line_artist,
                    line_simplified,
                    image,
                    fillmap,
                    fillmap_artist: fillmap_c,
                    palette
                }
            }
            // so if the ID is differnet, then just return the same scene (nonthing changed)
            return scene
        })
        setScenes(newScenes)
        console.log('scenes saved in React state')
    }

    async function merge() {
        console.log('Merging...')
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0]
        const { fileName } = scene;
        
        await saveMergeHintLayer();
        const stroke = await loadBase64('merge-hint.png')
        
        const data = {
            line_artist: scene.line_artist,
            fillmap: scene.fillmap,
            stroke,
            palette: scene.palette,
        }
        const url = 'http://68.100.80.232:8080/merge'
        console.log('sending request...')
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
                
        const result = await response.json();
        const { line_simplified, image, fillmap, layers, palette } = result;

        console.log('Merging done!')

        console.log('Saving images...')
        await saveBase64Image(image, `${fileName}-result.png`)
        await saveBase64Image(line_simplified, `${fileName}-line_simplified.png`) 
        
        // layers.forEach(async(layer, index) => {
        //     await saveBase64Image(layer, `${fileName}-segment-${index}.png`)
        // })

        
        console.log('Loading images....')
        await loadResult(fileName, true)          
        await loadLineSimplified(fileName, true)
        await selectLayerByName("merge-hint")

        console.log('Cleanup merge strokes...')


                
        const newScenes = scenes.map(scene => {
            if (scene.documentID === app.activeDocument._id) {
                return {
                    ...scene,
                    fillmap,
                    palette,
                    image,
                    // layers
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
        
        await saveCoarseSplitHintLayer();
        const stroke = await loadBase64('split-hint-coarse.png')
        
        const data = {
            line_artist: scene.line_artist,
            line_simplified: scene.line_simplified,
            fillmap: scene.fillmap,
            fillmap_artist: scene.fillmap_artist,
            stroke,
            palette: scene.palette,
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

        const { line_simplified, image, fillmap, layers, palette } = result;
        console.log('Splitting done!')

        
        console.log('Saving images...')
        await saveBase64Image(image, `${fileName}-result.png`)
        await saveBase64Image(line_simplified, `${fileName}-line_simplified.png`)

        //最好之后把这步跳过去
        // layers.forEach(async(layer, index) => {
        //     await saveBase64Image(layer, `${fileName}-segment-${index}.png`)
        // })
        
        console.log('Loading image....')
        await loadResult(fileName, true)
        await loadLineSimplified(fileName, true)
        await selectLayerByName('split-hint')

        const newScenes = scenes.map(scene => {
            if (scene.documentID === app.activeDocument._id) {
                return {
                    ...scene,
                    fillmap,
                    palette,
                    image,
                    // layers,
                }
            }
            return scene
        })
        setScenes(newScenes)
        console.log('scenes saved in React state')
    }

    async function splitfine() {
        // 从scense中读取必要的信息
        // 但相关的定义和借口都不是很清楚，因此需要之后进一步搞清楚
        console.log('Fine Splitting...');
        const scene = scenes.filter(scene => scene.documentID === app.activeDocument._id)[0];
        const { fileName } = scene;
        
        await saveFineSplitHintLayer();
        const stroke = await loadBase64('split-hint-fine.png');
        
        const data = {
            line_artist: scene.line_artist,
            // line_simplified: scene.line_simplified,
            fillmap: scene.fillmap,
            fillmap_artist: scene.fillmap_artist,
            stroke,
            palette: scene.palette,
        };
        
        // 发送请求
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

        // 读取回复，并显示
        const { line_artist, line_simplified, image, fillmap, layers, palette } = result;
        console.log('Splitting done!');

        
        console.log('Saving images...');
        await saveBase64Image(image, `${fileName}-result.png`);
        await saveBase64Image(line_simplified, `${fileName}-line_simplified.png`);
        await saveBase64Image(line_artist, `${fileName}-line_artist.png`)
        

        // // we really don't need to save layers everytime, then we can save lots of time
        // layers.forEach(async(layer, index) => {
        //     await saveBase64Image(layer, `${fileName}-segment-${index}.png`)
        // });
        
        console.log('Loading image....');
        // 这里应该增加一个函数
        // 去除输入的锁定，并且重命名整个layer
        // 还需要再入服务器端返回的增加了alhpha通道的line art
        await loadLineArtist(fileName, true);
        await loadResult(fileName, true);
        await loadLineSimplified(fileName, true); 
        await selectLayerByName('split-hint')

        // 重设ps中的显示内容，这部分又是和ps打交道，因此需要额外的控制接口
        // 也是我应该尽快搞懂的内容
        // 
        const newScenes = scenes.map(scene => {
            if (scene.documentID === app.activeDocument._id) {
                return {
                    ...scene,
                    fillmap,
                    palette,
                    image,
                    // layers,
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
        setScenes([...scenes, ...newScenes])
    }

    // what this function does?
    // I really don't understand why don't just declar a function?
    const listener = (event, descriptor) => {
        if (event === 'close') {
            const { documentID } = descriptor
            const newScenes = scenes.filter(scene => scene.documentID !== documentID);
            setScenes(newScenes);
        }
     }

    useEffect(() => {        
        photoshop.action.addNotificationListener([
            {
                event: "close"
            },
            {
                event: "open"
            } // any other events...
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

    const FlattingTab = (
       
        //https://www.reactenlightenment.com/react-jsx/5.1.html
        // JSX allows us to put HTML into JavaScript.
        // https://reactjs.org/docs/introducing-jsx.html
        
        <>
            <Grid item xs={12} style={{ height: 40, display: 'flex', justifyContent: 'center'}}>
                { FlatButton }
            </Grid> 
            
            <Grid item xs={12}>
                { BrushRadioGroup }
            </Grid>
            
            <Grid item xs={12}>
                <Typography variant="h6" component="div">
                    Instruction:
                </Typography>
                <Typography variant="body2" component="div">
                    { brushMode === 'merge' ? mergeInstructionText : splitInstructionText }
                </Typography>
            </Grid>

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
            </Grid>
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
    
    const handleColorBlobClick = async(hex) => {
        await activatePaintBucket()
        await setColor(hex)
    }
    const ColorBlob = ({ hex }) => {
        return (
            <div onClick={() => handleColorBlobClick(hex)} style={{ backgroundColor: hex, width: 20, height: 20, margin: 2}}/>
        )
    }
    // const Palette = ({ id, characterName, colors, handleChange }) => (
    //     <div>
    //         <TextField
    //             label="Name"
    //             value={characterName}
    //             onChange={(value) => handleChange(value, id)}
    //          />
    //         <div style={{ display: 'flex' }}>
    //             {colors.map(color => <ColorBlob key={id+color} color={color}/>)}
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

    const colors = ['#4D4D4D', '#999999', '#FFFFFF', '#F44E3B', '#FE9200', '#FCDC00', '#DBDF00', '#A4DD00', '#68CCCA', '#73D8FF', '#AEA1FF', '#FDA1FF']
    const colors2 = ['#333333', '#808080', '#CCCCCC', '#D33115', '#E27300', '#FCC400', '#B0BC00', '#68BC00', '#16A5A5', '#009CE0', '#7B64FF', '#FA28FF']
    const colors3 = ['#000000', '#666666', '#B3B3B3', '#9F0500', '#C45100', '#FB9E00', '#808900', '#194D33', '#0C797D', '#0062B1', '#653294', '#AB149E']
    
    
    // TODO: try to make this function connect to API, or just remove this function
    const LoadSegmentsButton = <StateFulButton onClick={loadSegments} text="Load Segments" isLoading={false}/>
    const ColoringTab = (
        <>
            <Grid item xs={12}>
                {LoadSegmentsButton}
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h6" component="div">
                    Instruction:
                </Typography>
                <Typography variant="body2" component="div">
                    { colorInsturctionText }
                </Typography>
            </Grid>
            <Grid item xs={12} style={{ display: 'flex' }}>
                {colors.map(hex => <ColorBlob key={hex} hex={hex}/>)}
            </Grid>
            <Grid item xs={12} style={{ display: 'flex' }}>
                {colors2.map(hex => <ColorBlob key={hex} hex={hex}/>)}
            </Grid>
            <Grid item xs={12} style={{ display: 'flex' }}>
                {colors3.map(hex => <ColorBlob key={hex} hex={hex}/>)}
            </Grid>
            {/* {characters.map(c => (
                <Grid key={c.id} item xs={12}>
                    <Palette 
                        id={c.id}
                        characterName={c.characterName}
                        colors={c.colors}
                        handleChange={handleCharacterNameChange}
                    />
                    <Button onClick={addCharacter} style={{width:160, height:30, marginTop: 30}}>+ Add Character</Button>
                </Grid>
            ))} */}
            {/* { colorPickerVisible && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
                    <PhotoshopPicker 
                        color={ activeColor }
                        onChange={ handleColorChangeComplete }
                        header={ 'activeColorButton' }
                        onAccept={ handleColorAccept }
                        onCancel={ handleColorCancel }
                    />
                </div>                
            )} */}
        </>
    )

    
    return (
        <Grid container className={classes.root}>
            <Grid item xs={5} className={classes.scenes}>
                <Scenes scenes={scenes} activeScene={activeScene} setActiveScene={setActiveScene}/>
                <Button onClick={loadNewScenes}>+ Add More Scenes...</Button>
            </Grid>

            <Grid item container xs={7} style={{ padding: 10 }}>
            <div>
                <Tabs
                    value={tab}
                    style={{ marginBottom: 10 }}
                    // indicatorColor="primary"
                    // textColor="primary"
                    onChange={handleTabChange}
                    aria-label="disabled tabs example"
                >
                    <Tab label="Flatting" />
                    <Tab label="Base Coloring" />
                </Tabs>
                { tab === 0 ? FlattingTab : ColoringTab }
            </div>
            </Grid>

        </Grid>
    );
}

// to understand export and import 
// https://zhuanlan.zhihu.com/p/144475026
export default function ThemedPanel() {
    return (
        // <ThemeProvider theme={theme}>
            <Panel />
        // </ThemeProvider>
    )
}
