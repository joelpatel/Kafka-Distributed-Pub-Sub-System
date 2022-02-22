import React, { Component } from "react";

import Spinner from "../components/Spinner/Spinner";
import TopicList from "../components/Topics/TopicList/TopicList";
import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import AuthContext from "../context/auth-context";
import "./Topics.css";

class TopicsPage extends Component {
  state = {
    creating: false,
    topics: [],
    isLoading: false,
    selectedTopic: null,
  };

  isActive = true;

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleElRef = React.createRef();
    this.dateElRef = React.createRef();
    this.descriptionElRef = React.createRef();
  }

  componentDidMount() {
    this.fetchTopics();
  }

  startCreateTopicHandler = () => {
    this.setState({ creating: true });
  };

  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = this.titleElRef.current.value;
    const date = this.dateElRef.current.value;
    const description = this.descriptionElRef.current.value;

    if (
      title.trim().length === 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const topic = { title, date, description };
    console.log(topic);

    const requestBody = {
      query: `
        mutation CreateTopic($title: String!, $description: String!, $date: String!) {
          createTopic(topicInput: {
            title: $title,
            description: $description,
            date: $date
          }) {
            _id
            title
            description
            date
          }
        }
      `,
      variables: {
        title: title,
        description: description,
        date: date,
      },
    };

    const token = this.context.token;

    fetch("http://localhost:5000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed");
        }
        return res.json();
      })
      .then((resData) => {
        this.setState((prevState) => {
          const updatedTopics = [...prevState.topics];
          updatedTopics.push({
            _id: resData.data.createTopic._id,
            title: resData.data.createTopic.title,
            description: resData.data.createTopic.description,
            date: resData.data.createTopic.date,
          });
          return { topics: updatedTopics };
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  modalCancelHandler = () => {
    this.setState({ creating: false, selectedTopic: null });
  };

  fetchTopics() {
    this.setState({ isLoading: true });

    // fetch("http://localhost:5000/testingrest", {
    //   method: "GET",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })
    // .then((res) => {
    //   console.log(res.json())
    // })
    // .catch((err) => {
    //   console.log(err)
    // })

    const requestBody = {
      query: `
        query {
         topics {
            _id
            title
            description
            date
          }
        }
      `,
    };

    fetch("http://localhost:5000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          return;
        }
        return res.json();
      })
      .then((resData) => {
        const topics = resData.data.topics;
        if (this.isActive) {
          this.setState({ topics: topics, isLoading: false });
        }
      })
      .catch((err) => {
        console.log(err);
        console.log("error while fetching topics from server")
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  }

  showDetailHandler = (topicId) => {
    this.setState((prevState) => {
      const selectedTopic = prevState.topics.find((t) => t._id === topicId);
      return { selectedTopic: selectedTopic };
    });
  };

  subscribeTopicHandler = () => {
    if (!this.context.token) {
      this.setState({ selectedTopic: null });
      return;
    }
    const requestBody = {
      query: `
        mutation Subscribe($selectedTopicId: ID!) {
          subscribe(topicID: $selectedTopicId) {
            _id
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        selectedTopicId: this.state.selectedTopic._id,
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
        console.log(resData);
        this.setState({ selectedTopic: null });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedTopic) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Topic"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText="Confirm"
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input type="datetime-local" id="date" ref={this.dateElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="4"
                  ref={this.descriptionElRef}
                />
              </div>
            </form>
          </Modal>
        )}
        {this.state.selectedTopic && (
          <Modal
            title={this.state.selectedTopic.title}
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.subscribeTopicHandler}
            confirmText={this.context.token ? "Subscribe Topic" : "Confirm"}
          >
            <p>{this.state.selectedTopic.description}</p>
          </Modal>
        )}
        {(this.context.token && this.context.isAdmin) && (
          <div className="topics-control">
            <p>Add a new Topic!</p>
            <button className="btn" onClick={this.startCreateTopicHandler}>
              Create Topic
            </button>
          </div>
        )}

        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <TopicList
            topics={this.state.topics}
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler}
          />
        )}
      </React.Fragment>
    );
  }
}

export default TopicsPage;
