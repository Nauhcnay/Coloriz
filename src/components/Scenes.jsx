import React, { useEffect } from "react";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
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


function Scene({ fileName, id, image, activeScene, setActiveScene }) {

    const classes = useStyles();
    const setActiveDocument = () => {
        const activeDoc = app.documents.filter(doc => doc._id === id)[0]
        app.activeDocument = activeDoc;
        setActiveScene(id)
    }

    const fileURL = `data:image/png;base64, ${image}`;
    return (
        <ListItem button divider onClick={setActiveDocument}>
            <img
                className={id === activeScene ? classes.activeDoc : '' }
                width="48"
                height="56"
                alt="Scene Thumbnail"
                src={fileURL}
            />
            <ListItemText primary={fileName} />
        </ListItem>
    )
}

export default function Scenes({ scenes, activeScene, setActiveScene }) {
    const classes = useStyles();
    return (
        <List component="nav" className={classes.root} aria-label="mailbox folders">
            {scenes.map(scene => <Scene activeScene={activeScene} setActiveScene={setActiveScene} key={scene.documentID} image={scene.image} id={scene.documentID} fileName={scene.fileName}/>)}
        </List>
      );
}