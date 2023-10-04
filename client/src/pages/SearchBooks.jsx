import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { searchGoogleBooks } from '../utils/API';
import Auth from '../utils/auth';
import { REMOVE_BOOK, SAVE_BOOK } from '../utils/mutations';
import { QUERY_USER } from '../utils/queries';

const SearchBooks = () => {
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);

  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');

  const [savedBooks, setSavedBooks] = useState([]);

  const { client, loading, data } = useQuery(QUERY_USER, {
    onCompleted: () => {
      setSavedBooks(data?.me?.savedBooks);
    }
  });

  const [saveBook, { saveBookError, saveBookData }] = useMutation(SAVE_BOOK);
  const [removeBook, { removeBookError, removeBookData }] = useMutation(REMOVE_BOOK);

  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { data: { saveBook: { savedBooks } } } = await saveBook({
        variables: {
          bookId: bookToSave.bookId,
          authors: bookToSave.authors,
          description: bookToSave.description,
          image: bookToSave.image,
          link: bookToSave.link,
          title: bookToSave.title
        }
      })

      setSavedBooks(savedBooks);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            var isSaved = savedBooks?.some((savedBookId) => savedBookId.bookId === book.bookId)
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={isSaved}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {isSaved
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
