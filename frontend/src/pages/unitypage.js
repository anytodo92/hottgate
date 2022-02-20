// Generic imports

// React imports
import React, { useContext, useState, useEffect } from "react";

// React related imports
import { Loading } from "../components/loading"

import Unity, { UnityContext } from "react-unity-webgl";

// Context imports
import { ViewportContext } from "../contexts"

// Component imports
import { Layer } from "../components/layer";

// --------------------------------------------------------------------------------

const unityContext = new UnityContext({
    loaderUrl: "/res/Test1.loader.js",
    dataUrl: "/res/Test1.data",
    frameworkUrl: "/res/Test1.framework.js",
    codeUrl: "/res/Test1.wasm",
});

export function UnityPage(props) {
    const { viewportwidth, viewportheight } = useContext(ViewportContext);

    const [isUnityLoaded, setIsUnityLoaded] = useState(false);

    const displayAsset = props.displayAsset;

    console.log("UnityPage", { viewportheight: viewportheight, viewportwidth: viewportwidth }, displayAsset)

    const setImageUrl = (unity, url) => {
        console.log("sending setimageurl", url);
        unity.send("CanvasCube", "SetImageUrl", url);
    }

    useEffect(() => {
        console.log("onUnityLoaded (effect)");
        unityContext.on("loaded", () => {
            setIsUnityLoaded(true);
        });
    });

    useEffect(() => {
        console.log("SETUP: RequestImageUrl")
        unityContext.on("RequestImageUrl", () => {
            console.log("RECEIVED: RequestImageUrl")
            if (displayAsset) {
                setImageUrl(unityContext, displayAsset.image_url);
            } else {
                console.log("no displayAsset");
            }
        });
    }, [displayAsset])

    return (
        <Layer name="Unity" zIndex={props.zIndex} top={props.top}>
            {
                (viewportheight && viewportwidth) ?
                    <>
                        <Unity
                            unityContext={unityContext}
                            style={{
                                visibility: isUnityLoaded ? "visible" : "hidden",
                                height: viewportheight - (props.top ? props.top : 0),
                                width: viewportwidth,
                            }}
                        />

                        {
                            isUnityLoaded ?
                                <></>
                                : <Loading />
                        }
                        {/* displayAsset.image_url */}
                    </>
                    :
                    <>No dimensions.</>
            }
        </Layer>
    )
}