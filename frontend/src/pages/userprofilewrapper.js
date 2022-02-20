// Generic imports
import deepEqual from "deep-equal";

// React imports
import React, { useContext, useState, useEffect, useCallback } from "react";

// React related imports
import { UserProfile } from "./userprofile";
import { UnityPage } from "./unitypage";

// Context imports
import { LoginContext } from "../contexts"

// Component imports
import { Loading } from "../components/loading"

const fetchAssets = require('../lib').fetchAssets;

// --------------------------------------------------------------------------------

export function UserProfileWrapper(props) {
    const { canFetch, jwtFetch } = useContext(LoginContext);
    const [profile, setProfile] = useState(null);
    const [displayAsset, setDisplayAsset] = useState(null);

    var profileId = props.routeProps.match.params.profile;

    console.log("UserProfileWrapper", profileId);

    var getProfile = useCallback(() => {
        console.log("getProfile (callback)");
        jwtFetch({ cmd: "get.profile", values: { profileId: profileId } }, (resp) => {
            console.log("get.profile", resp);
            if (!resp || resp.error) {
                setProfile('not found');
            } else {
                if (!deepEqual(resp, profile)) setProfile(resp);
            }
        });
    }, [profileId, jwtFetch]);

    useEffect(() => {
        console.log("getProfile (effect)");
        if (canFetch) {
            getProfile();
        }
    }, [getProfile, canFetch]);

    useEffect(() => {
        console.log("getAssets (effect)");
        if (profile === 'not found') {
            setTimeout(() => {
                props.history.push('/');
            }, 5000);
        } else if (profile && profile.metamask) {
            fetchAssets(profile.metamask, (res) => {
                if (res.assets && res.assets.length) {
                    console.log("loaded displayAsset", res.assets[0])
                    setDisplayAsset(res.assets[0]);
                } else {
                    console.log("no display asset")
                    setDisplayAsset(null);
                }
            });
        }
    }, [profile, props.history]);

    if (profile === 'not found') {
        return (
            <p>Can't find {profileId}</p>
        );
    }

    if (!profile) {
        return (
            <Loading />
        );
    }

    return (
        <>
            <UnityPage
                zIndex={40}
                top={props.top}
                displayAsset={displayAsset}
            />
            <UserProfile
                zIndex={80}
                top={props.top}
                userProfile={profile}
                userProfileId={profileId}
            />
        </>
    );
}