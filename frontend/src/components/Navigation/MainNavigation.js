import React from "react";
import { NavLink } from "react-router-dom";

import AuthContext from "../../context/auth-context";
import "./MainNavigation.css";

const mainNavigation = (props) => (
  <AuthContext.Consumer>
    {(context) => {
      return (
        <header className="main-navigation">
          <div className="main-navigation__logo">
            <h1>Kafka Distributed Pub/Sub System</h1>
          </div>
          <nav className="main-navigation__items">
            <ul>
              {!context.token && (
                <li>
                  <NavLink to="/auth">Authenticate</NavLink>
                </li>
              )}
              <li>
                <NavLink to="/topics">Topics</NavLink>  {/* /events */}
              </li>
              {context.token && (
                <React.Fragment>
                  <li>
                    <NavLink to="/subscriptions">Subscriptions</NavLink> {/* /bookings */}
                  </li>
                  <li>
                    <NavLink to="/notifications">Notifications</NavLink> {/* new insert element */}
                  </li>
                  <li>
                    <button onClick={context.logout}>Logout</button>
                  </li>
                </React.Fragment>
              )}
            </ul>
          </nav>
        </header>
      );
    }}
  </AuthContext.Consumer>
);

export default mainNavigation;
