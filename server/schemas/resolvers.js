const { Book, User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id }).populate('books');
      }
      throw AuthenticationError;
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
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
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
      throw AuthenticationError;
    },
  }
}
module.exports = resolvers;
