// Generic imports
// import { OpenSeaPort, Network } from 'opensea';

// React imports
import React, { useState, useEffect } from "react";

// React related imports
import { Link } from "react-router-dom";
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

// Context imports

// Component imports
import { TwitterFeed } from "../components/twitter";
import { Layer } from "../components/layer";

// --------------------------------------------------------------------------------

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary,
    elevation: 3,
}));

export function HomePage(props) {
    const [alert, setAlert] = useState(null);
    const metamaskBlock = props.metamaskBlock;
    const user = props.user;

    console.log("HomePage")

    useEffect(() => {
        console.log("alert (effect)");
        if (alert) {
            setTimeout(() => {
                setAlert(null);
            }, 5000);
        }
    }, [alert]);


    return (
        <Layer zIndex={props.zIndex} top={props.top} name="HomePage">
            <Grid container spacing={2}>
                {alert ? <Grid item xs={12}><Alert severity={alert.sev}>
                    <AlertTitle>{alert.title}</AlertTitle>
                    {alert.text}
                </Alert></Grid> : <></>}
                <Grid item xs={4}>
                    <Item>Social
                        <TwitterFeed handle='nasih_test' />
                    </Item>
                </Grid>
                <Grid item xs={5}>
                    <Item>
                        NFT


                    </Item>
                </Grid>
                <Grid item xs={3}>
                    <Item>
                        <Grid container sx={{ flexGrow: 1 }} spacing={2}>
                            <Grid item>
                                Functions
                            </Grid>
                            <Grid item xs={12}>
                                {user.oncyber ?
                                    <Button fullWidth color="primary" variant="contained" onClick={() => {
                                        var win = window.open(user.oncyber, '_blank');
                                        win.focus();
                                    }}>OnCyber</Button> :
                                    <Typography variant="caption" display="block" gutterBottom>
                                        Have oncyber? Set it up in your <Link to="/profile/">Profile</Link>
                                    </Typography>}
                            </Grid>

                            <Grid item xs={12}>
                                {user.opensea ?
                                    <Button fullWidth color="primary" variant="contained" onClick={() => {
                                        var win = window.open(user.opensea, '_blank');
                                        win.focus();
                                    }}>OpenSea</Button> :
                                    <Typography variant="caption" display="block" gutterBottom>
                                        Have opensea? Set it up in your <Link to="/profile/">Profile</Link>
                                    </Typography>}
                            </Grid>
                            <Grid item xs={12}>
                                <Link to="/profile" style={{ textDecoration: 'none' }}>
                                    <Button fullWidth color="secondary" variant="contained">Edit Profile</Button>
                                </Link>
                            </Grid>
                            <Grid item xs={12}>
                                {metamaskBlock}
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
            </Grid>
        </Layer>
    )
}