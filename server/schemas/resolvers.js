const { Book, User } = require('../models');
const { countDocuments } = require('../models/User');
const { signToken } = require('../utils/auth');
const { GraphQLError } = require('graphql');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context?.user) {
        return await User.findOne({ _id: context.user._id }).populate('savedBooks');
      }
      throw new GraphQLError('Authentication Error');
    }
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new GraphQLError('Authentication Error');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new GraphQLError('Authentication Error');
      }

      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, book, context) => {
      if (context.user) {
        // Find a user and update the savedBooks
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } },
          { new: true }  // return updated user
        );
        return user;
      }

      // Authentication error if user is not present in context
      throw new AuthenticationError('You need to be logged in!');
    },

    removeBook: async (parent, { book }, context) => {
      if (context.user) {
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { books: book._id } },
          { new: true }
        );
        return user;
      }
      throw new GraphQLError('Authentication Error');
    },
  }
};

module.exports = resolvers;
