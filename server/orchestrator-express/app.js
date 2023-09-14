const express = require("express");

const app = express();
const PORT = process.env.PORT || 4000;
const axios = require("axios");
const redis = require("./config/redisConnection");
const BOOKS_SERVICE_URL = "http://localhost:4002";
const USER_SERVICE_URL = "http://localhost:4001";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ msg: "server is running" });
});

// CLIENT REQUEST KE API GATEWAY -> API GATEWAY AMBIL DATA DARI SERVICE
// SERVICE UDAH ADA DATANAY -> KIRIM KE API GATEWAY -> API GATEWAY KIRIM KE CLIENT
app.get("/books", async (req, res) => {
  // JIKA DATA BUKU BELUM DI CACHING/TIDAK ADA DI REDIS, MAKA AXIOS SERVICE BOOKS DAN RESULTNYA SET
  // KE REDIS

  // JIKA DATA BUKU SUDAH ADA DI REDIS MAKA AMBIL AJA DAN KIRIM KE CLIENT
  try {
    const booksCache = await redis.get("books");
    if (booksCache) {
      const booksParsed = JSON.parse(booksCache);
      res.status(200).json(booksParsed);
    } else {
      const { data } = await axios.get(BOOKS_SERVICE_URL + "/books");
      await redis.set("books", JSON.stringify(data));
      res.status(200).json(data);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await axios.delete(BOOKS_SERVICE_URL + "/books/" + id);
    redis.del("books");
    res.status(200).json({ message: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
