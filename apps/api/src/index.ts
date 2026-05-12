import app from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.listen(PORT, () => {
  console.log(`🚀  BookShelf API running at http://localhost:${PORT}`);
  console.log(`    Health: http://localhost:${PORT}/api/health`);
  console.log(`    Books:  http://localhost:${PORT}/api/books`);
});