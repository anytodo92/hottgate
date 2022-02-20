// Generic imports
import AgoraRTC from "agora-rtc-sdk-ng"

// React imports
import React, { useContext, useState, useEffect, useCallback } from "react";
import { Prompt } from "react-router-dom";

// React related imports
import Grid from '@mui/material/Grid';
// import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// Context imports
import { LoginContext, AgoraContext } from "../contexts"

// Component imports
import { Loading } from "../components/loading"
import { Error } from "../components/error"


// --------------------------------------------------------------------------------

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    color: theme.palette.text.secondary,
    elevation: 3,
}));

export function HousePage(props) {
    const { canFetch, jwtFetch } = useContext(LoginContext);
    const { setAgoraContext, live, uid, client, localAudioTrack } = useContext(AgoraContext);
    const [houseData, setHouseData] = useState(null);
    const [token, setToken] = useState(null);
    const [connection, setConnection] = useState({ live: false });

    const [isUnityLoaded, setIsUnityLoaded] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    var userName = props.match.params.username;
    var houseName = props.match.params.housename;

    console.log("HousePage", userName, houseName);

    var getHouseData = useCallback(() => {
        jwtFetch({ cmd: "enter.house", values: { userName: userName, houseName: houseName } }, (resp) => {
            console.log("enter.house", resp);
            if (!resp || resp.error) {
                setHouseData('not found');
            } else {
                setHouseData(resp);
            }
        });
    }, [userName, houseName, jwtFetch]);

    useEffect(() => {
        if (canFetch) {
            getHouseData();
        }
    }, [canFetch, getHouseData]);

    var getToken = useCallback(() => {
        if (houseData && houseData.hid) {
            console.log("get token for", houseData.hid);
            jwtFetch({ cmd: "agls.profile", values: { channel: houseData.hid } }, (resp) => {
                console.log("agls.profile", resp);
                if (!resp || resp.error) {
                    setToken(null);
                } else {
                    setToken(resp);
                }
            });
        }
    }, [houseData, jwtFetch]);

    useEffect(() => {
        if (canFetch) {
            getToken();
        }
    }, [canFetch, getToken]);

    const autoSubscribe = async (client, newUser, mediaType) => {
        console.log("autoSubscribe", newUser, mediaType);
        if (!client) {
            console.log("ERROR autoSubscribe client is null");
            return;
        }
        if (mediaType === "audio") {
            try {
                await client.subscribe(newUser, mediaType);
                newUser.audioTrack.play();
            } catch (err) {
                console.log("ERROR autoSubscribe", err);
            }

        }
    }

    const connectAgora = async () => {
        const rtc = {
            live: true,
            client: null,
            uid: null,
            localAudioTrack: null,
            localVideoTrack: null,
        };
        try {
            rtc.client = AgoraRTC.createClient({ mode: "live", codec: "vp8" })
            rtc.client.setClientRole(token.role);
            rtc.uid = await rtc.client.join(token.appId, token.channel, token.token, null /* token.uint32.toString() */);
            console.log("agora uid", rtc.uid);
            rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            await rtc.client.publish([rtc.localAudioTrack]);
            console.log("agora connected", rtc);
            if (rtc.client.remoteUsers.length) {
                console.log("agora channel has existing users")
                for (var host of rtc.client.remoteUsers) {
                    if (host && host.hasAudio) {
                        await rtc.client.subscribe(host, "audio");
                        host.audioTrack.play();
                        console.log("subscribed to channel user", host.uid);
                    }
                }
            }
            setAgoraContext(rtc);
        } catch (err) {
            console.log("agora connection error", err);
        }
    }
    console.log("connection is", (live ? "live" : "not live"));

    useEffect(() => {
        if (token && token.token) {
            connectAgora()
                .then(() => {
                    console.log("connectAgora then");
                })
        }
    }, [token]);

    const closeAgoraConnection = async (client, setAgoraContext) => {
        console.log("*********** exit page with agora connection", (client ? "have client" : "don't have client"));
        if (!client) return;
        // if (live) {
        //     console.log("live connection... closing");
        try {
            // await client.unpublish([localAudioTrack]);
            // localAudioTrack.close();
            await client.leave();
            console.log("closed agora connection");
            setAgoraContext({
                live: false,
                client: null,
                uid: null,
                localAudioTrack: null,
                localVideoTrack: null,
            });
        } catch (err) {
            console.log("ERROR closing agora connection", err);
        }
        // } else {
        //     console.log("no connection");
        // }
        window.removeEventListener('beforeunload', alertUser);
        window.removeEventListener('unload', closeAgoraConnection);
    }

    const alertUser = e => {
        e.preventDefault();
        e.returnValue = '';
    }
    useEffect(() => {
        if (client) {
            console.log("************* have client")
            window.addEventListener('beforeunload', alertUser);
            window.addEventListener('unload', closeAgoraConnection);
            client.on("user-published", (newUser, mediaType) => autoSubscribe(client, newUser, mediaType));
            return async () => {
                await closeAgoraConnection(client, setAgoraContext);
            }
        } else {
            console.log("************* no client, yet")
            return;
        }
    }, [client]);

    if (!houseData) {
        return (
            <Loading />
        );
    }

    if (houseData === 'not found') {
        return (
            <Error />
        );
    }

    return (
        <>
            <Grid xs={6} item sx={{ padding: '10px' }}>
                <Prompt
                    message={() => 'Are you sure you want to leave this house?'}
                />
                <Paper variant="outlined" sx={{ padding: '10px' }}>
                    <Typography variant="h3">{houseData.name}</Typography>
                    <Item>
                        <Typography>{houseData.hid}</Typography>
                        {token ?
                            <Typography>{token.appID} / {token.channel} : {token.token}</Typography>
                            : <Typography>No token</Typography>
                        }
                        {live ?
                            <Typography>Live</Typography>
                            : <Typography>Not live</Typography>
                        }
                    </Item>
                </Paper>
            </Grid>
        </>
    )
}