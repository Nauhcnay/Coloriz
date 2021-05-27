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


function Scene({ fileName, id, image, activeScene, setActiveScene, setIsFlatting, flatted, startFlatting }) {

    const classes = useStyles();
    let isLoading = "";
    if (startFlatting())
        isLoading = "Working";
    else
        isLoading = "Loaded";
   

    const setActiveDocument = () => {
        const activeDoc = app.documents.filter(doc => doc._id === id)[0]
        app.activeDocument = activeDoc;
        setActiveScene(id);
        if (flatted){
            setIsFlatting(2); //set button to "show flatted"
            // console.log("case 1");
        }
        else if (startFlatting() && flatted === false){
            setIsFlatting(0); // set button to "show flatted" and disable it
            // console.log("case 2");
        }
        else{
            setIsFlatting(1) // set button to "flat"
        }
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
                <Avatar>
                  <img
                    //className={id === activeScene ? classes.activeDoc : '' }
                    // Todo: keep the aspect ratio of thumbnail 
                    //width="48"
                    height="56"
                    alt="Scene Thumbnail"
                    src={fileURL}/>
                </Avatar>
            </ListItemAvatar>
            {/*<StatedItemText text={isLoading? "Loaded" : "Working"}>
            </StatedItemText>*/}
             <ListItemText primary={flatted ? fileName : isLoading} style={{color:"#fff"}}/>
            
           {/* <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>*/}

        </ListItem>
    )
}

export default function Scenes({ scenes, activeScene, setActiveScene, setIsFlatting, startFlatting}) {
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
                                        startFlatting={startFlatting}/>)}
        </List>
      );
}