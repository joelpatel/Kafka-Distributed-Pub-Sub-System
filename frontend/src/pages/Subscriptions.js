import React, { Component } from "react";

import AuthContext from "../context/auth-context";
import SubscriptionsControls from "../components/Subscriptions/SubscriptionsControls/SubscriptionsControls";
import SubscriptionList from "../components/Subscriptions/SubscriptionList/SubscriptionList";
import Spinner from "../components/Spinner/Spinner";


class SubscriptionsPage extends Component {
  state = {
    isLoading: false,
    subscriptions: [],
    outputType: "list",
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchSubscriptions();
  }

  fetchSubscriptions = () => {
    this.setState({ isLoading: true });

    const requestBody = {
      query: `
        query {
          subscriptions {
            _id
            createdAt
            topic {
              _id
              title
              date
            }
          }
        }
      `,
    };

    fetch("http://localhost:5000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.context.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          return;
        }
        return res.json();
      })
      .then((resData) => {
        const subscriptions = resData.data.subscriptions;
        this.setState({ subscriptions: subscriptions, isLoading: false });
        // TODO store subscriptions to localstorage
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  deleteSubscriptionHandler = (subscriptionId) => {
    this.setState({ isLoading: true });

    const requestBody = {
      query: `
        mutation CancelSubscription($id: ID!) {
         cancelSubscription(subscriptionID: $id) {
            _id
            title
          }
        }
      `,
      variables: {
        id: subscriptionId,
      },
    };

    fetch("http://localhost:5000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.context.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          return;
        }
        return res.json();
      })
      .then((resData) => {
        this.setState((prevState) => {
          const updatedSubscriptions = prevState.subscriptions.filter((subscription) => {
            return subscription._id !== subscriptionId;
          });
          return { subscriptions: updatedSubscriptions, isLoading: false };
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  changeOutputTypeHandler = (outputType) => {
    if (outputType === "list") {
      this.setState({ outputType: "list" });
    } else {
      this.setState({ outputType: "list" });
    }
  };

  render() {
    let content = <Spinner />;
    if (!this.state.isLoading) {
      content = (
        <React.Fragment>
          <SubscriptionsControls
            activeButton={this.state.outputType}
            changeOutputTypeHandler={this.changeOutputTypeHandler}
          />
          <div>
            {this.state.outputType === "list" && (
              <SubscriptionList
                subscriptions={this.state.subscriptions}
                onDelete={this.deleteSubscriptionHandler}
              />
            )}
          </div>
        </React.Fragment>
      );
    }
    return <React.Fragment>{content}</React.Fragment>;
  }
}

export default SubscriptionsPage;
