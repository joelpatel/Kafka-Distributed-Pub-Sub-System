import React, { Component } from "react";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";

import AuthPage from "./pages/Auth";
import SubscriptionsPage from "./pages/Subscriptions";
import TopicsPage from "./pages/Topics";
import NotificationsPage from "./pages/Notifications"
import MainNavigation from "./components/Navigation/MainNavigation";
import AuthContext from "./context/auth-context";

import "./App.css";

class App extends Component {

  state = {
    token: null,
    userId: null,
    isAdmin: null,
  };

  login = (token, userId, tokenExpiration, isAdmin) => {
    this.setState({ token: token, userId: userId, isAdmin: isAdmin });
  };

  logout = () => {
    this.setState({ token: null, userId: null });
  };

  render() {
    return (
      <BrowserRouter>
        {/* <React.Fragment> */}
        <AuthContext.Provider
          value={{
            token: this.state.token,
            userId: this.state.userId,
            isAdmin: this.state.isAdmin,
            login: this.login,
            logout: this.logout,
          }}
        >
          <MainNavigation />
          <main className="main-content">
            <Switch>
              {this.state.token && <Redirect from="/" to="/topics" exact />} {/* to="/events" */}
              {this.state.token && <Redirect from="/auth" to="/topics" exact />} {/* to="/events" */}
              {!this.state.token && <Route path="/auth" component={AuthPage} />}
              <Route path="/topics" component={TopicsPage} />
              {this.state.token && (
                <Route path="/subscriptions" component={SubscriptionsPage} />
              )}
              {this.state.token && (
                <Route path="/notifications" component={NotificationsPage} />
              )}
              {!this.state.token && <Redirect to="/auth" exact />}
            </Switch>
          </main>
        </AuthContext.Provider>
        {/* </React.Fragment> */}
      </BrowserRouter>
    );
  }
}

export default App;
