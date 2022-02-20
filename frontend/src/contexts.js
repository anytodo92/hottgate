// Generic imports

// React imports
import React from "react";

// React related imports

// Context imports

//Component imports

// --------------------------------------------------------------------------------

export const LoginContext = React.createContext({
    user: null,
    canFetch: false,
    jwtFetch: () => { },
    metamask: { needSetup: true, provider: null, address: null, seaport: null, state: 'init' },
    setMetaMask: () => { },
    refreshUser: () => { },
})

export const NFTContext = React.createContext({
    assets: [],
    displayasset: null,
    updateAssets: () => { },
})

export const AgoraContext = React.createContext({
    live: false,
    client: null,
    uid: null,
    localAudioTrack: null,
    localVideoTrack: null,
    setAgoraContext: () => { },
})

export const ViewportContext = React.createContext({
    viewportwidth: 0,
    viewportheight: 0,
})