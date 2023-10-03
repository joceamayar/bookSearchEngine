const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');
const { GraphQLError } = require('graphql');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      console.log(context)
      if (context?.user) {
        return await User.findOne({ _id: context.user._id }).populate('books');
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

    saveBook: async (parent, { _id, authors, description, bookId, images, link, title }, context) => {
      try {
        const book = await Book({
          _id,
          authors,
          description,
          bookId,
          images,
          link,
          title,
        });

        await book.save();
        return book;
      } catch (error) {
        console.error('Error saving book:', error);
        throw new Error('Error saving book');
      }
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const book = await Book.findOneAndDelete({
          _id: bookId,
          book: context.user.username,
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { books: book._id } }
        );
        // { new: true }
        return book;
      }
      throw new GraphQLError('Authentication Error');
    },
  }
}
module.exports = resolvers;
