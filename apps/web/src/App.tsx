import { useEffect, useState } from "react";
import { CataloguePage } from "./pages/CataloguePage";
import { BookDetailPage } from "./pages/BookDetailPage";

type Route =
  | { name: "catalogue" }
  | { name: "book"; bookId: string };

function parseHash(): Route {
  const match = window.location.hash.match(/^#\/books\/([^/?#]+)/);
  if (match) {
    return { name: "book", bookId: decodeURIComponent(match[1]) };
  }
  return { name: "catalogue" };
}

function navigate(path: string) {
  if (window.location.hash !== `#${path}`) {
    window.location.hash = path;
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (route.name === "book") {
    return (
      <BookDetailPage
        key={route.bookId}
        bookId={route.bookId}
        onBack={() => navigate("/")}
      />
    );
  }

  return (
    <CataloguePage
      onSelectBook={(id) => navigate(`/books/${id}`)}
    />
  );
}