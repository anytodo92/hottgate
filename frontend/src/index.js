import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN}
    clientId={process.env.REACT_APP_AUTH0_CLIENTID}
    redirectUri={window.location.origin + process.env.PUBLIC_URL}
    audience={process.env.REACT_APP_AUTH0_AUDIENCE}
  >
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Auth0Provider>,
  document.getElementById("root")
);
