const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    savedBooks: [Book]
  }

   type Book {
    _id: ID!
    authors: [String]
    description: String!
    bookId: String!
    images: String
    link: String
    title: String!
  }

  type Auth {
    token: ID!
    user: User
  }

  type WordBlock {
    word:String
  }

  type Query {
    user( _id: ID!, username: String!): User
    me: User
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth

    saveBook ( _id: ID!,  authors: String,  description: String!, bookId: String!, images: String, link: String, title: String!):Book
    removeBook( _id: ID!, authors: String,  description: String!,  bookId: String!, images: String, link: String, title: String!)
    :Book
  }
`;
module.exports = typeDefs;
