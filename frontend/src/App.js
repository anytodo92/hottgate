// Generic imports
import jwt_decode from "jwt-decode";
import deepEqual from 'deep-equal';
import detectEthereumProvider from '@metamask/detect-provider'

// React imports
import { useState, useEffect, useCallback } from "react";

// React related imports
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth0 } from "@auth0/auth0-react";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Context imports
import { LoginContext, NFTContext, AgoraContext, ViewportContext } from "./contexts";

//Component imports
import { HomePageWrapper } from "./pages/homepagewrapper";
import { TestPage } from "./pages/testpage";
import { ProfilePage } from "./pages/profilepage";
import { UserProfileWrapper } from "./pages/userprofilewrapper";
import { HousePage } from "./pages/housepage";

import { Loading } from "./components/loading";

const apiUrl = process.env.REACT_APP_API_URL;
const userRefreshSecs = 17;
const metamaskRefreshSecs = 120;
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});
const fetchAssets = require('./lib').fetchAssets;

function getViewportDimensions() {
  console.log("getViewportDimensions (function)");
  var viewportwidth;
  var viewportheight;

  if (typeof window.innerWidth != 'undefined') {
    viewportwidth = window.innerWidth;
    viewportheight = window.innerHeight;
  }
  else if (typeof document.documentElement != 'undefined'
    && typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0) {
    viewportwidth = document.documentElement.clientWidth;
    viewportheight = document.documentElement.clientHeight;
  }
  else {
    viewportwidth = document.getElementsByTagName('body')[0].clientWidth;
    viewportheight = document.getElementsByTagName('body')[0].clientHeight;
  }
  return {
    viewportwidth: viewportwidth,
    viewportheight: viewportheight,
  }
}

const vpd = getViewportDimensions();

// --------------------------------------------------------------------------------

function App(props) {
  // console.log("App '", process.env.PUBLIC_URL, "'", window.location.href)
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [jwt, setJWT] = useState(null);
  const [user, setUser] = useState(null);
  const [userRefresh, setUserRefresh] = useState(false);
  const [metamask, setMetaMask] = useState({ needSetup: true, provider: null, seaport: null, address: null, state: 'init' });
  const [nftAssets, setNftAssets] = useState(null);
  const [displayAsset, setDisplayAsset] = useState(null);
  const [agoraContext, setAgoraContext] = useState({ live: false });
  const [viewport, setViewport] = useState(vpd);
  // const setAgoraContextFunc = useCallback((rtc) => {
  //   setAgoraContext(rtc);
  // });
  // setAgoraContext({ setAgoraContext: setAgoraContextFunc });

  const unixTime = Math.floor(Date.now() / 1000);
  console.log("App", viewport);

  // *************** Window Size
  const updateWindowSize = () => {
    console.log("updateWindowSize (function)");
    var vpd = getViewportDimensions();
    setViewport({
      viewportwidth: vpd.viewportwidth,
      viewportheight: vpd.viewportheight,
    });
  }

  useEffect(() => {
    console.log("addWindowSizeListener (effect)");
    window.addEventListener('resize', updateWindowSize);
    return () => {
      window.removeEventListener('resize', updateWindowSize);
    }
  });

  // *************** JWT
  useEffect(() => {
    console.log("getToken (effect)");
    if (isAuthenticated) {
      getAccessTokenSilently()
        .then((token) => {
          // console.log("jwt expires in", moment.duration(jwt_decode(token).exp - unixTime).humanize())
          setJWT(token)
        })
        .catch((error) => {
          console.log("could not get jwt", error)
        })
    }
  })

  // *************** AUTHENTICATED API ACCESS
  const jwtFetch = useCallback((body, f) => {
    console.log("jwtFetch (callback)");
    if (!jwt) {
      return null;
    }
    var params = {
      headers: new Headers({
        Authorization: "Bearer " + jwt,
        Accept: "application/json",
      }),
      method: 'GET',
    }
    if (body) {
      params.headers.append("Content-Type", "application/json");
      params.body = JSON.stringify(body);
      params.method = 'POST';
    }
    fetch(apiUrl, params)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          console.log("jwtFetch Error:", response.status, response.statusText);
          return null;
        }
      })
      .then((json) => {
        if (json) {
          // console.log(json)
          f(json);
        }
      })
      .catch((error) => {
        console.log("jwtFetch Error:", error);
        f(null);
      })
  }, [jwt]);

  // *************** USER REFRESH
  useEffect(() => {
    console.log("userRefresh (effect)");
    if (jwt && (!user || userRefresh)) {
      jwtFetch({ cmd: "hello" }, (res) => {
        if (!res) {
          console.log("error getting user details, no response")
        } else if (res.error) {
          console.log("error getting user details", res.error)
        } else {
          if (!deepEqual(user, res.user)) setUser(res.user);
          setUserRefresh(false);
          // setTimeout(() => {
          //   // console.log("refresh user details")
          //   setUserRefresh(true);
          // }, userRefreshSecs * 1000);
        }
      });
    }
  }, [jwt, user, userRefresh, jwtFetch])

  // *************** METAMASK
  const checkMetamask = () => {
    console.log("metamask detect");
    detectEthereumProvider()
      .then((provider) => {
        if (provider) {
          console.log("found ethereum provider");
          setMetaMask({
            needSetup: false,
            provider: provider,
            state: 'found',
          })
        } else {
          console.log("no ethereum provider found");
          setMetaMask({
            needSetup: false,
            provider: null,
            state: 'none',
          })
          setTimeout(() => {
            // console.log("refresh user details")
            checkMetamask();
          }, metamaskRefreshSecs * 1000);
        }
      })
      .catch((e) => {
        console.log(e);
      })
  }
  useEffect(() => {
    console.log("checkMetamask (effect)");
    if (metamask.needSetup) {
      checkMetamask();
    }
  })

  // *************** OPENSEA
  useEffect(() => {
    console.log("getOpenSea (effect)");
    if (user && user.metamask && !nftAssets) {
      fetchAssets(user.metamask, (res) => {
        setNftAssets(res.assets);
        if (res.assets && res.assets.length) {
          console.log("loaded displayAsset", res.assets[0])
          setDisplayAsset(res.assets[0]);
        } else {
          console.log("no display asset")
          setDisplayAsset(null);
        }
      });
    }
  }, [user, nftAssets]);

  console.log("App agora connection", (agoraContext.live ? "live" : "not live"));


  // *************** TRIGGER USER REFRESH
  const refreshUser = () => {
    console.log("refreshUser (function)");
    setUserRefresh(true);
  }

  if (isAuthenticated) {
    if (!user) {
      return <Loading />;
    }
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ViewportContext.Provider value={{
          viewportwidth: viewport.viewportwidth,
          viewportheight: viewport.viewportheight,
        }}>
          <LoginContext.Provider value={{
            user: user,
            canFetch: (jwt && jwt_decode(jwt).exp - unixTime > 2),
            jwtFetch: jwtFetch,
            refreshUser: refreshUser,
            metamask: metamask,
            setMetaMask: (changes) => { setMetaMask(changes) },
          }}>
            <NFTContext.Provider value={{
              assets: nftAssets,
              displayAsset: displayAsset,
              updateAssets: (assets) => { setNftAssets(assets) },
            }}>
              <AgoraContext.Provider value={{
                live: agoraContext.live,
                client: agoraContext.client,
                uid: agoraContext.uid,
                localAudioTrack: agoraContext.localAudioTrack,
                localVideoTrack: agoraContext.localVideoTrack,
                setAgoraContext: (rtc) => {
                  console.log("agoraContext update", (rtc ? rtc.live : "rtc is null"));
                  setAgoraContext(rtc);
                },
              }}>
                <BrowserRouter basename={(process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "")}>
                  <Box sx={{ flexGrow: 1, padding: '20px' }}>
                    <Grid item xs={12} style={{ marginBottom: '15px' }}>
                      <ButtonGroup variant="contained">
                        <Typography style={{ marginTop: '7px' }}> {user.displayname}&nbsp; </Typography>
                        <Link to="/"><Button>Home</Button></Link>
                        <Link to="/t/"><Button>Test</Button></Link>
                        <Link to="/profile/"><Button>Profile</Button></Link>
                        <Link to="/user/asdf"><Button>Invalid User</Button></Link>
                        <Link to="/user/anmar"><Button>Anmar</Button></Link>
                        <Link to="/user/thomas"><Button>Thomas</Button></Link>
                      </ButtonGroup>
                    </Grid>
                    <Grid item container xs={12} spacing={2}>
                      <Switch>
                        <Route path="/user/:profile" component={
                          (props) => <UserProfileWrapper top={65} routeProps={props} />
                        } />
                        <Route path="/house/:username/:housename" component={HousePage} />
                        <Route path="/profile/">
                          <ProfilePage />
                        </Route>
                        <Route path="/t/">
                          <TestPage />
                        </Route>
                        <Route path="/">
                          <HomePageWrapper top={65} />
                        </Route>
                      </Switch>
                    </Grid>
                  </Box>
                </BrowserRouter>
              </AgoraContext.Provider>
            </NFTContext.Provider>
          </LoginContext.Provider>
        </ViewportContext.Provider>
      </ThemeProvider>
    );
  } else if (isLoading) {
    return <Loading />;
  } else {
    console.log("redirect for login");
    loginWithRedirect();
  }


}

export default App;
