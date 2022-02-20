// Generic imports

// React imports
import React, { useRef, useLayoutEffect, useState, useEffect } from "react";

// React related imports
import { Timeline } from 'react-twitter-widgets'

// Context imports

// Component imports

// --------------------------------------------------------------------------------

export function TwitterFeed(props) {
    console.log("TwitterFeed", "'" + props.handle + "'")
    const targetRef = useRef();
    const [dimensions, setDimensions] = useState(null);

    useLayoutEffect(() => {
        if (targetRef.current) {
            setDimensions({
                divWidth: targetRef.current.offsetWidth,
                winHeight: window.innerHeight,
            });
        }
    }, []);

    useEffect(() => {
        if ((typeof window.twttr !== 'undefined') &&
            (typeof window.twttr.widgets !== 'undefined')) {
            window.twttr.widgets.load(document.getElementById(targetRef));
        }
    })


    if (dimensions) {
        var height = Math.round(Math.max(
            dimensions.divWidth * 1.25,
            dimensions.winHeight * 0.8
        ));
        return (<>
            <Timeline
                dataSource={{
                    sourceType: 'profile',
                    screenName: props.handle,
                }}
                options={{
                    height: height,
                    width: dimensions.divWidth,
                    theme: 'dark',
                }}
            /></>);
    } else {
        return (<div ref={targetRef} style={{ flexGrow: 1 }}>
            Twitter...
        </div>);
    }
};
