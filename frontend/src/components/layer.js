// Generic imports

// React imports
import React, { useContext } from "react";

// React related imports

// Context imports
import { ViewportContext } from "../contexts";

// Component imports

// --------------------------------------------------------------------------------

export function Layer(props) {
    const { viewportwidth, viewportheight } = useContext(ViewportContext);
    if (!viewportwidth || !viewportheight) {
        console.log("Layer no viewportcontext", viewportwidth, viewportheight, props.name);
        return (<></>);
    }
    var zidx = props.zIndex;
    if (!zidx) zidx = 10;
    var style = {
        position: "absolute",
        top: props.top ? props.top : 0,
        left: props.left ? props.left : 0,
        // flexGrow: 1,
        width: viewportwidth,
        height: viewportheight - (props.top ? props.top : 0),
        zIndex: zidx,
    };
    console.log("Layer", props.name, style);
    return (
        <div style={style}>
            {props.children}
        </div>
    )
}