import { gql } from '@apollo/client';

export const QUERY_USER = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks{
        _id
        description
        bookId
        image
        link
        title
      }
    }
  }
`;



