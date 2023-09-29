const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
  }

  type Book {
    _id: ID!
    authors: String
    description: String!
    bookId: String!
    images: String
    link: String
    title: String!
  }

  type Query {
    users: [User] 
    user( _id: ID!, username: String!): User
    me: User
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): User
    login(email: String!, password: String!): user

    saveBook ( _id: ID!,  authors: String,  description: String!, bookId: String!, images: String, link: String, title: String!):Book
    removeBook( _id: ID!, authors: String,  description: String!,  bookId: String!, images: String, link: String, title: String!): Book
  }
`;
module.exports = typeDefs;
