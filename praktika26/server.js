import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
    type Book {
        id: ID!
        title: String!
        author: Author!
    }

    type Author {
        id: ID!
        name: String!
        books: [Book!]!
    }

    type Query {
        books: [Book!]!
        book (id: ID!): Book
        authors: [Author!]!
    }

    type Mutation {
        createBook(title: String!, authorId: ID!): Book!
        createAuthor(name: String!): Author!
    }
`;

const books = [
  { id: "1", title: "Война и мир", authorId: "1" },
  { id: "2", title: "Анна Каренина", authorId: "1" },
  { id: "3", title: "Преступление и наказание", authorId: "2" },
];

const authors = [
  { id: "1", name: "Лев Толстой" },
  { id: "2", name: "Фёдор Достоевский" },
];

const resolvers = {
  Query: {
    books: () => {return books},
    book: (_, args) => {return books.find(b => b.id === args.id)},
    authors: () => {return authors},
  },
  Book: {
    author: (parent) => {return authors.find(a => a.id === parent.authorId)}
  },
  Author: {
    books: (parent) => {return books.filter(b => b.authorId === parent.id)}
  },
  Mutation: {
    createBook: (_, args) => {
        const authorExsists = authors.find(a => a.id === args.authorId)

        if (!authorExsists) {
            throw new Error(`Автор с id ${args.authorId} не найден`);
        }

        const newBook = {
            id: String(books.length + 1),
            title: args.title,
            authorId: args.authorId,
        }

        books.push(newBook)
        return newBook
    },
    createAuthor: (_, args) => {
        const newAuthor = {
            id: String(authors.length + 1),
            name: args.name,
        }
        authors.push(newAuthor)
        return newAuthor
    },
  },
};



const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`Server ready at: ${url}`);