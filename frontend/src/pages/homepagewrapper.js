// Generic imports
// import { OpenSeaPort, Network } from 'opensea';

// React imports
import React, { useContext, useState, useEffect, useCallback } from "react";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// React related imports
import { HomePage } from "./homepage";
import { UnityPage } from "./unitypage";

// Context imports
import { LoginContext, NFTContext } from "../contexts"

// Component imports

// --------------------------------------------------------------------------------

export function HomePageWrapper(props) {
    const { user, metamask, canFetch, jwtFetch, refreshUser } = useContext(LoginContext);
    const { displayAsset } = useContext(NFTContext);
    const [alert, setAlert] = useState(null);

    console.log("HomePageWrapper", displayAsset)

    useEffect(() => {
        console.log("alert (effect)");
        if (alert) {
            setTimeout(() => {
                setAlert(null);
            }, 5000);
        }
    }, [alert]);

    const [metamaskBlock, setMetamaskBlock] = useState(null);

    const ethConnect = useCallback(() => {
        console.log("ethConnect (callback)");
        if (metamask.state !== 'found') return;
        console.log("connect to metamask...")
        window.ethereum
            .request({ method: 'eth_requestAccounts' })
            .then((address) => {
                console.log("address", address);
                if (!canFetch) {
                    setAlert({ sev: "error", title: "Error", text: "Not logged in to backend." })
                }
                else {
                    jwtFetch({ cmd: "change.profile", values: { metamask: address } }, (resp) => {
                        if (!resp) {
                            setAlert({ sev: "error", title: "Error", text: "Could not update metamask address" })
                        } else if (resp.error) {
                            setAlert({ sev: "error", title: "Error", text: "Could not update metamask address: " + resp.error })
                        } else {
                            setAlert({ sev: "success", title: "Submit", text: "Changes have been saved." })
                            refreshUser();
                        }
                    });
                }
            })
            .catch((error) => {
                if (error.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    console.log("connection to metamask was denied by user");
                } else {
                    console.error("connection to metamask failed", error);
                }
            });
    }, [metamask.state, jwtFetch, canFetch, refreshUser]);

    useEffect(() => {
        console.log("metaBlock (effect)");
        switch (metamask.state) {
            case 'init':
                setMetamaskBlock(<Typography variant="caption" display="block" gutterBottom>
                    Looking for metamask...
                </Typography>);
                break;
            case 'found':
                setMetamaskBlock(<Button fullWidth color="secondary" variant="contained" onClick={() => { ethConnect() }}>
                    Connect Metamask
                </Button>);
                break;
            case 'none':
                setMetamaskBlock(<Typography variant="caption" display="block" gutterBottom>
                    Please <a href="https://metamask.io/" target="_blank" rel="noreferrer">install metamask</a> to access crypto features.
                </Typography>);
                break;
            case 'connected':
                setMetamaskBlock(<Typography variant="caption" display="block" gutterBottom>
                    Metamask connected.
                </Typography>);
                break;
            default:
                setMetamaskBlock(<Typography variant="caption" display="block" gutterBottom>
                    Metamask is a mystery.
                </Typography>);
        }
    }, [metamask.state, ethConnect])

    return (
        <>
            <UnityPage
                zIndex={40}
                top={props.top}
                displayAsset={displayAsset}
            />
            <HomePage
                zIndex={80}
                top={props.top}
                user={user}
                metamaskBlock={metamaskBlock}
            />
        </>
    )
}