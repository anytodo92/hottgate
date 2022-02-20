// Generic imports

// React imports
import React, { useContext, useState, useEffect, useCallback } from "react";

// React related imports
import { Link } from "react-router-dom";
import { useFormik } from 'formik';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';


// Context imports
import { LoginContext } from "../contexts";

// Component imports
import { Loading } from "../components/loading";

// --------------------------------------------------------------------------------
const profileValidationSchema = require("../jslib/profileValidation").profileValidationSchema;
const houseValidationSchema = require("../jslib/houseValidation").houseValidationSchema;
// const setDetailedLogs = require("../jslib/profileValidation").setDetailedLogs;
// setDetailedLogs(true);

export function ProfilePage() {
    const { user, canFetch, jwtFetch, refreshUser } = useContext(LoginContext);
    const [alert, setAlert] = useState(null);
    const [houses, setHouses] = useState(null);
    const [needHouseRefresh, setNeedHouseRefresh] = useState(true);

    useEffect(() => {
        if (alert) {
            setTimeout(() => {
                setAlert(null);
            }, 5000);
        }
    }, [alert]);

    var refreshHouses = useCallback(() => {
        jwtFetch({
            cmd: "get.house",
            values: {},
        }, (resp) => {
            if (!resp) {
                setAlert({ sev: "error", title: "Error", text: "Could not get houses" });
                setHouses({
                    ok: false,
                });
            } else if (resp.error) {
                setAlert({ sev: "error", title: "Error", text: "Could not get houses: " + resp.error });
                setHouses({
                    ok: false,
                });
            } else {
                // console.log("houses:", resp);
                setHouses({
                    ok: true,
                    list: resp,
                });
            }
        });
        setNeedHouseRefresh(false);
    }, [jwtFetch]);

    useEffect(() => {
        if (needHouseRefresh) {
            refreshHouses();
        }
    }, [needHouseRefresh, refreshHouses]);


    const formik = useFormik({
        initialValues: (user ? {
            email: user.email,
            nickname: user.nickname,
            displayname: (user.displayname ? user.displayname : (user.nickname ? user.nickname : user.email)),
            oncyber: user.oncyber,
            opensea: user.opensea,
            metamask: user.metamask,
        } : {}),
        validationSchema: profileValidationSchema,
        onSubmit: (values) => {
            if (!canFetch) {
                setAlert({ sev: "error", title: "Error", text: "Not logged in to backend." });
            }
            else {
                jwtFetch({
                    cmd: "change.profile",
                    values: values,
                }, (resp) => {
                    if (!resp) {
                        setAlert({ sev: "error", title: "Error", text: "Could not update profile" });
                    } else if (resp.error) {
                        setAlert({ sev: "error", title: "Error", text: "Could not update profile: " + resp.error });
                    } else {
                        setAlert({ sev: "success", title: "Submit", text: "Changes have been saved." });
                        refreshUser();
                    }
                })
            }
        },
    });

    const formik_newhouse = useFormik({
        initialValues: ({}),
        validationSchema: houseValidationSchema,
        onSubmit: (values) => {
            for (var i = 0; i < values.name; i++) {
                console.log(values.name.charCodeAt(i));
            }
            if (!canFetch) {
                setAlert({ sev: "error", title: "Error", text: "Not logged in to backend." });
            }
            else {
                jwtFetch({
                    cmd: "add.house",
                    values: values,
                }, (resp) => {
                    if (!resp) {
                        setAlert({ sev: "error", title: "Error", text: "Could not add house" });
                    } else if (resp.error) {
                        setAlert({ sev: "error", title: "Error", text: "Could not add house: " + resp.error });
                    } else {
                        setAlert({ sev: "success", title: "Submit", text: "House has been added." });
                        setNeedHouseRefresh(true);
                    }
                })
            }
        },
    });

    if (!user) {
        return <Loading />;
    }

    return (
        <>
            {alert ? <Grid xs={12}><Alert severity={alert.sev}>
                <AlertTitle>{alert.title}</AlertTitle>
                {alert.text}
            </Alert></Grid> : <></>}
            <Grid xs={6} item sx={{ padding: '10px' }}>
                <Paper variant="outlined" sx={{ padding: '10px' }}>
                    <Typography variant="h3">Profile</Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <Typography variant="caption">Important settings (required)</Typography>
                        <TextField
                            fullWidth
                            id="displayname"
                            name="displayname"
                            label="Name to display"
                            value={formik.values.displayname}
                            onChange={formik.handleChange}
                            error={formik.touched.displayname && Boolean(formik.errors.displayname)}
                            helperText={formik.touched.displayname && formik.errors.displayname}
                            style={{ marginBottom: '12px', marginTop: '12px' }}
                        />
                        <Typography variant="caption">Additional settings</Typography>
                        <TextField
                            fullWidth
                            id="oncyber"
                            name="oncyber"
                            label="OnCyber Page"
                            value={formik.values.oncyber}
                            onChange={formik.handleChange}
                            error={formik.touched.oncyber && Boolean(formik.errors.oncyber)}
                            helperText={formik.touched.oncyber && formik.errors.oncyber}
                            style={{ marginBottom: '12px', marginTop: '12px' }}
                        />
                        <TextField
                            fullWidth
                            id="opensea"
                            name="opensea"
                            label="OpenSea Page"
                            value={formik.values.opensea}
                            onChange={formik.handleChange}
                            error={formik.touched.opensea && Boolean(formik.errors.opensea)}
                            helperText={formik.touched.opensea && formik.errors.opensea}
                            style={{ marginBottom: '12px', marginTop: '12px' }}
                        />
                        <Button color="primary" variant="contained" fullWidth type="submit" style={{ marginBottom: '12px', marginTop: '12px' }}>
                            Save
                        </Button>
                        <Typography variant="caption">From your authentication and metamask profiles (fixed)</Typography>
                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            disabled={true}
                            style={{ marginBottom: '12px', marginTop: '12px' }}
                        />
                        <TextField
                            fullWidth
                            id="nickname"
                            name="nickname"
                            label="Nickname"
                            value={formik.values.nickname}
                            onChange={formik.handleChange}
                            error={formik.touched.nickname && Boolean(formik.errors.nickname)}
                            helperText={formik.touched.nickname && formik.errors.nickname}
                            disabled={true}
                            style={{ marginBottom: '12px' }}
                        />
                        <TextField
                            fullWidth
                            id="metamask"
                            name="metamask"
                            label="Metamask address"
                            value={formik.values.metamask}
                            onChange={formik.handleChange}
                            error={formik.touched.metamask && Boolean(formik.errors.metamask)}
                            helperText={formik.touched.metamask && formik.errors.metamask}
                            disabled={true}
                            style={{ marginBottom: '12px' }}
                        />
                    </form>
                </Paper>
            </Grid>
            <Grid xs={6} item sx={{ padding: '10px' }}>
                <Paper variant="outlined" sx={{ padding: '10px' }}>
                    <Typography variant="h3">Houses</Typography>
                    <Typography variant="caption">Your houses</Typography>
                    <>
                        {houses ? // {"/houses/" + user.displaynamelowe + "/" + v.namelower}
                            houses.ok ?
                                houses.list.length ?
                                    <List>
                                        {houses.list.map((v, i) =>
                                            <ListItem key={'houses-' + i.toString()}
                                                component={Link} to={"/house/" + user.displaynamelower + "/" + v.namelower}>
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
                    </>
                    <Divider sx={{ marginTop: '8px', marginBottom: '8px' }} />
                    <form onSubmit={formik_newhouse.handleSubmit}>
                        <Typography variant="caption">Add a new house</Typography>
                        <TextField
                            fullWidth
                            id="name"
                            name="name"
                            label="Name to display"
                            value={formik_newhouse.values.name}
                            onChange={formik_newhouse.handleChange}
                            error={formik_newhouse.touched.name && Boolean(formik_newhouse.errors.name)}
                            helperText={formik_newhouse.touched.name && formik_newhouse.errors.name}
                            style={{ marginBottom: '12px', marginTop: '12px' }}
                        />
                        {/*<TextField
                            fullWidth
                            id="nftAddress"
                            name="nftAddress"
                            label="NFT Address"
                            value={formik_newhouse.values.nftAddress}
                            onChange={formik_newhouse.handleChange}
                            error={formik_newhouse.touched.nftAddress && Boolean(formik_newhouse.errors.nftAddress)}
                            helperText={formik_newhouse.touched.nftAddress && formik_newhouse.errors.nftAddress}
                            style={{ marginBottom: '12px', marginTop: '12px' }}
                        />*/}
                        <Button color="primary" variant="contained" fullWidth type="submit" style={{ marginBottom: '12px', marginTop: '12px' }}>
                            Add
                        </Button>
                    </form>
                </Paper>
            </Grid>


        </>
    )
}