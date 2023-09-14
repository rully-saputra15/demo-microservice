const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { default: axios } = require("axios");

// kasih contoh struktur di database
// untuk category ditambah setelah ada contoh data category (pengen include)
const DATA = [
  {
    id: 1,
    title: "Harpot",
    author: "JK Rowling",
    price: 20000,
  },
  {
    id: 2,
    title: "Harpot 2",
    author: "JK Rowling",
    price: 20000,
  },
];

// setelah itu kasih contoh datanya category
const DATA_CATEGORY = [
  {
    id: 1,
    name: "horror",
    imgUrl: "test.png",
  },
];

// scalar type sebutan untuk tipe data typedefs
// category di book itu namanya custom type
// kalau category mau array tinggal tambah [Category]

// type Query itu special dan ngequery dari situ

//type definition aja atau janji/kontrak/model
const typeDefs = `#graphql
    type Book {
        id: ID
        title: String
        description:String
    }

    type Category {
        id: ID
        name: String
        imgUrl: String
    }

    input newBook {
      title: String
      description:String
    }

    type Query {
        books: [Book]
        findBookById(bookId: ID!): Book
        categories: [Category]
    }
    type Mutation {
        createBook(newBook: newBook): Book
    }
`;

// resolver: cara implementasi apa yang sudah dituliskan di type query

// mirip dengan controllers
// Query harus sama dengan type definition
const resolvers = {
  Query: {
    books: async () => {
      // kalau mau ambil data dari services, pakai axios
      const { data } = await axios.get("http://localhost:4001/books");
      return data;
    },
    findBookById: (_, args) => {
      return DATA.find((item) => item.id === +args.bookId);
    },
    categories: () => {
      return DATA_CATEGORY;
    },
  },
  Mutation: {
    async createBook(_, args) {
      const { title, description } = args.newBook;
      const newBook = {
        id: Math.random,
        title,
        description,
      };
      // axios post
      const { data } = await axios.post("http://localhost:4001/books", newBook);
      return data;
    },
  },
};

// nama properties/key di object harus sama, kalau nggak harus di kasih valuenya

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port: process.env.PORT || 4000 },
})
  .then((result) => {
    console.log(`Server ready at: ${result.url}`);
  })
  .catch((err) => {
    console.log(err);
  });
