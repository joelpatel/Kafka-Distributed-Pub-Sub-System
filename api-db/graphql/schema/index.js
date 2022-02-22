const { buildSchema } = require("graphql");

module.exports = buildSchema(`
      type Subscription {
        _id: ID!
        topic: Topic!
        user: User!
        createdAt: String!
        updatedAt: String!
      }

      type Topic {
          _id: ID!
          title: String!
          description: String!
          date: String!
      }

      type User {
        _id: ID!
        email: String!
        password: String
        isAdmin: Boolean
      }

      type AuthData {
        userId: ID!
        token: String!
        tokenExpiration: Int!
        isAdmin: Boolean!
      }

      input TopicInput {
          title: String!
          description: String!
          date: String!
      }

      input UserInput {
        email: String!
        password: String!
      }

      type RootQuery {
          topics: [Topic!]!
          subscriptions: [Subscription!]!
          login(email: String!, password: String!): AuthData!
      }

      type RootMutation {
          createTopic(topicInput: TopicInput): Topic
          createUser(userInput: UserInput): User
          subscribe(topicID: ID!): Subscription!
          cancelSubscription(subscriptionID: ID!): Topic!
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
  `);
