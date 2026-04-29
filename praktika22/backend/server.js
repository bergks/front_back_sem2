const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const SERVER_NAME = process.env.SERVER_NAME || "backend-server";

app.use((req, res, next) => {
    console.log(`[${SERVER_NAME}] - ${req.method}`)
    next();
})

app.get("/", (req, res) => {
  res.json({
    message: "Привет! Я бэкенд-сервер",
    server: SERVER_NAME,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", server: SERVER_NAME, port: PORT });
});

app.listen(PORT, () => {
  console.log(`[${SERVER_NAME}] запущен на порту ${PORT}`);
});