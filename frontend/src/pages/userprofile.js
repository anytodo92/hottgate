// Generic imports

// React imports
import React, { useContext, useState, useEffect, useCallback } from "react";

// React related imports
import { Link } from "react-router-dom";
import Grid from '@mui/material/Grid';
// import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// Context imports
import { LoginContext } from "../contexts"

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

export function UserProfile(props) {
    const { canFetch, jwtFetch } = useContext(LoginContext);
    const profile = props.userProfile;
    const profileId = props.userProfileId;
    const [houses, setHouses] = useState(null);

    console.log("UserProfile");

    var findHouses = useCallback(() => {
        console.log("findHouses (callback)");
        jwtFetch({ cmd: "find.house", values: { userName: profileId } }, (resp) => {
            console.log("find.house", resp);
            if (!resp || resp.error) {
                setHouses({
                    ok: false,
                });
            } else {
                setHouses({
                    ok: true,
                    list: resp,
                });
            }
        });
    }, [profileId, jwtFetch]);

    useEffect(() => {
        console.log("findHouses (effect)");
        if (canFetch) {
            findHouses();
        }
    }, [findHouses, canFetch]);

    return (
        <Layer zIndex={props.zIndex} top={props.top} name="UserProfile">
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Item>Social
                        <TwitterFeed handle='TwitterDev' />
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
                                Houses
                            </Grid>
                            <Grid item xs={12}>
                                {houses ?
                                    houses.ok ?
                                        houses.list.length ?
                                            <List>
                                                {houses.list.map((v, i) =>
                                                    <ListItem key={'houses-' + i.toString()}
                                                        component={Link} to={"/house/" + profile.displaynamelower + "/" + v.namelower}>
                                                        <ListItemButton color="secondary" variant="contained">
                                                            <ListItemText primary={v.name} />
                                                        </ListItemButton>
                                                    </ListItem>
                                                )}
                                            </List>
                                            : <Typography>No houses</Typography>
                                        : <Typography>Could not retrieve houses</Typography>
                                    : <Typography>Loading...</Typography>
                                }
                            </Grid>
                            <Grid item>
                                Functions
                            </Grid>
                            <Grid item xs={12}>
                                What functions do we put on the profile page of other people?
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
            </Grid>
        </Layer>
    );
}