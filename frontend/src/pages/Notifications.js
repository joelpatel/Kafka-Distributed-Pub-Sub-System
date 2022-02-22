import React, { Component } from "react";
import { io } from "socket.io-client"

import AuthContext from "../context/auth-context";
import "./Notifications.css";

class Notifications extends Component {
  static contextType = AuthContext;
  constructor() {
    super();
    this.eventSource = null;
    this.socket = null;
  }

  state = {
    data: [],
    issData: null,
    peopleData: null,
    apodData: null,
  };

  componentDidMount() {


    this.socket = io("http://localhost:33334", {
      query: {
        "userId": this.context.userId
      }
    });

    this.socket.on(String(this.context.userId)+"_MESSAGE", (data, callback) => {
      console.log("onmessage received");
      let message = data
      console.log("message: " + message)
      this.updateMethodOnNewDataArrival(message);
    })

  }

  componentWillUnmount() {
    this.socket.disconnect();
    console.log("Terminating Socket.io Connection");
    this.setState({
      data: [],
    });
  }

  updateMethodOnNewDataArrival(incomingMessage) {
    let row = JSON.parse(incomingMessage);
    console.log(row);
    
      if (row.name) {
        this.setState({
          issData: row,
        });
      }
      if (row.url) {
        this.setState({
          apodData: row,
        });
      }
      if (row.number) {
        this.setState({
          peopleData: row,
        });
      }
      this.setState({
        data: row,
      });
      return 0;
    
  }
  render() {
    return (
      <div className="">
        {this.state.issData && (
          <div>
            <h2>ISS Current Location</h2>
            <ul className="notifications__item">
              <div>
                <li className="notifications__list">
                  <strong>Date</strong> :{" "}
                  <em>{this.state.issData.timestamp}</em>
                </li>

                <li className="notifications__list">
                  <strong>Latitude</strong> :{" "}
                  <em>{this.state.issData.latitude}</em>
                </li>
                <li className="notifications__list">
                  <strong>Longitude</strong> :{" "}
                  <em>{this.state.issData.longitude}</em>
                </li>
                <li className="notifications__list">
                  <strong>Velocity</strong> :{" "}
                  <em>{this.state.issData.velocity}</em> <em>km/h</em>
                </li>
                <li className="notifications__list">
                  <strong>Visibility</strong> :{" "}
                  <em>{this.state.issData.visibility}</em>
                </li>
              </div>
            </ul>
          </div>
        )}

        {this.state.peopleData && (
          <div>
            <h2>People Orbiting in Low Earth Orbit</h2>
            <ul className="notifications__item">
              <div>
                <li>
                  Number of People in Space = {this.state.peopleData.number}
                </li>
                {this.state.peopleData.people.map((personObject) => {
                  return (
                    <div>
                      <li className="notifications__list">
                        <strong>Craft</strong> = <em>{personObject.craft}</em> -{" "}
                        <strong>Astronaut</strong> ={" "}
                        <em>{personObject.name}</em>
                      </li>
                    </div>
                  );
                })}
              </div>
            </ul>
          </div>
        )}

        {this.state.apodData && (
          <div>
            <h2>Astronomy Picture of the Day</h2>
            <p>It'll update once each day.</p>
            <ul className="notifications__item">
              <div>
                <li className="notifications__list">
                  <strong>Date</strong> : <em>{this.state.apodData.date}</em>
                </li>

                <li className="notifications__list">
                  <strong>Explanation</strong> :{" "}
                  <em>{this.state.apodData.explanation}</em>
                </li>
                <li className="notifications__list">
                  <img
                    src={this.state.apodData.url}
                    alt=""
                    width="100%"
                    height="100%"
                  />
                </li>
              </div>
            </ul>
          </div>
        )}

        <h6>
          Please check console where make/docker commands where ran for
          information regarding data passed to client.
        </h6>
      </div>
    );
  }
}

export default Notifications;
