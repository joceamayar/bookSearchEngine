const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const { authMiddleware } = require('./utils/auth');
const jwt = require('jsonwebtoken');


const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');


const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req, res }) => {

      // from ./utils/auth.js
      const secret = 'mysecretsshhhhh';
      const expiration = '2h';

      const token = req.headers.authorization || '';
      var bearer = token?.replace("Bearer ", "");

      try {
        const { data } = jwt.verify(bearer, secret, { maxAge: expiration });
        return { user: data };
      } catch {
        return { user: null };
      }
    }
  }));

  // if we're in production, serve client/build as static assets





  // if (process.env.NODE_ENV === 'production') {
  //   app.use(express.static(path.join(__dirname, '../client/build')));

  //   app.get('*', (req, res) => {
  //     res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  //   });

   if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });

};


startApolloServer();
