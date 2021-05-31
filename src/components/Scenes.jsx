import React, { useEffect } from "react";
// import React, { useState, useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import photoshop from 'photoshop';
import uxp from "uxp";
import btoa from "btoa";
const app = photoshop.app;
const { confirm } = require("../lib/dialogs.js");


const useStyles = makeStyles((theme) => ({
  root: {
    // width: '100%',
    // maxWidth: 360,
    // backgroundColor: theme.palette.background.paper,
  },
  activeDoc: {
    border: '5px solid #9AE42C'
  }
}));

function showResizeConfirm(){
    document.querySelector("#dlgExample").uxpShowModal({
    title: "Continue to close?",
    resize: "none", // "both", "horizontal", "vertical",
    size: {
      width: 480,
      height: 240
    }
  });
}

async function removeScene(id, getScenes, setScenes){
    const feedback = await confirm(
          "Close this work?", //[1]
          `Please makesure you have saved all works before continue`, //[2]
          ["Cancel", "Continue"] /*[3]*/
        );
      switch (feedback.which) {
      case 0:
        /* User canceled */
        break;
      case 1:
        /* User clicked Enable */
        const selectedDoc = app.documents.filter(doc => doc._id === id)[0];
        selectedDoc.closeWithoutSaving();
        const scenes = getScenes();
        const newScenes = scenes.filter(scene => scene.documentID !== id);
        setScenes(newScenes);
    }
    
}


function Scene({ fileName, id, image, activeScene, setActiveScene, setIsFlatting, flatted, startFlatting, setIsInitail, getScenes, setScenes, setflatClicked }) {

    const classes = useStyles();
   
    const setActiveDocument = () => {
        setIsInitail(false);
        const activeDoc = app.documents.filter(doc => doc._id === id)[0]
        app.activeDocument = activeDoc;
        setActiveScene(id);
        const scenes = getScenes();
        const selectedScene = scenes.filter((s)=>s.documentID === id)[0]
        if (flatted){
            setIsFlatting(false);
            if (selectedScene.clicked)
                setflatClicked(true);
            else
                setflatClicked(false);
        }
        else
            setIsFlatting(true);
        // below is the old version of this function, which is the three state button version
        // if (flatted){
        //     setIsFlatting(2); //set button to "show flatted"
        //     // console.log("case 1");
        // }
        // else if (startFlatting() && flatted === false){
        //     setIsFlatting(0); // set button to "show flatted" and disable it
        //     // console.log("case 2");
        // }
        // else{
        //     setIsFlatting(1) // set button to "flat"
        // }
    }
    const fileURL = `data:image/png;base64, ${image}`;
    

    // const StatedItemText = (props)=>{
    //     <ListItemText primary={flatted ? fileName : props.text} style={{color:"#fff"}}/>
    // };
    return (
        <ListItem 
            button
            selected={id === activeScene ? true : false}
            divider 
            onClick={setActiveDocument}>
            <ListItemAvatar>
                <Avatar variant="rounded">
                  <img
                    //className={id === activeScene ? classes.activeDoc : '' }
                    // Todo: keep the aspect ratio of thumbnail 
                    //width="48"
                    height="56"
                    alt="Scene Thumbnail"
                    src={fileURL}/>
                </Avatar>
            </ListItemAvatar>
            
             <ListItemText primary={flatted ? fileName : "Working"} style={{color:"#fff"}}/>
            
           <ListItemSecondaryAction>
                <IconButton 
                    edge="end" 
                    aria-label="delete" 
                    size="small" 
                    style={{width: 30, height: 20, padding: 0, color:"#fff"}}
                    onClick={()=>removeScene(id, getScenes, setScenes)}>
                  x
                </IconButton>
            </ListItemSecondaryAction>

        </ListItem>
    )
}

export default function Scenes({ scenes, activeScene, setActiveScene, setIsFlatting, startFlatting, setIsInitail, getScenes, setScenes, setflatClicked}) {
    const classes = useStyles();
    return (
        <List component="nav" className={classes.root} aria-label="mailbox folders">
            {scenes.map((scene) => <Scene activeScene={activeScene}
                                        setActiveScene={setActiveScene}
                                        key={scene.documentID}
                                        image={scene.image}
                                        id={scene.documentID}
                                        fileName={scene.fileName}
                                        setIsFlatting={setIsFlatting}
                                        flatted={scene.flatted}
                                        startFlatting={startFlatting}
                                        setIsInitail={setIsInitail}
                                        getScenes={getScenes}
                                        setScenes={setScenes}
                                        setflatClicked={setflatClicked}/>)}
        </List>
      );
}