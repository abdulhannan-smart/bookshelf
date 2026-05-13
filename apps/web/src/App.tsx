import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CataloguePage } from "./pages/CataloguePage";
import { BookDetailPage } from "./pages/BookDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CataloguePage />} />
        <Route path="/books/:bookId" element={<BookDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
