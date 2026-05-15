import { useEffect, useState } from "react";
import { CataloguePage } from "./pages/CataloguePage";
import { BookDetailPage } from "./pages/BookDetailPage";
import { ListsPage } from "./pages/ListsPage";
import { ListDetailPage } from "./pages/ListDetailPage";
import { ProfilePage } from "./pages/ProfilePage";

type Route =
  | { name: "catalogue" }
  | { name: "book"; bookId: string }
  | { name: "lists" }
  | { name: "list"; listId: string }
  | { name: "profile"; userId: string };

function parseHash(): Route {
  const bookMatch = window.location.hash.match(/^#\/books\/([^/?#]+)/);
  if (bookMatch) {
    return { name: "book", bookId: decodeURIComponent(bookMatch[1]) };
  }
  const userMatch = window.location.hash.match(/^#\/users\/([^/?#]+)/);
  if (userMatch) {
    return { name: "profile", userId: decodeURIComponent(userMatch[1]) };
  }
  const listMatch = window.location.hash.match(/^#\/lists\/([^/?#]+)/);
  if (listMatch) {
    return { name: "list", listId: decodeURIComponent(listMatch[1]) };
  }
  if (window.location.hash.match(/^#\/lists\/?$/)) {
    return { name: "lists" };
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
        onSelectBook={(id) => navigate(`/books/${id}`)}
      />
    );
  }

  if (route.name === "lists") {
    return (
      <ListsPage
        onBack={() => navigate("/")}
        onSelectList={(id) => navigate(`/lists/${id}`)}
      />
    );
  }

  if (route.name === "list") {
    return (
      <ListDetailPage
        key={route.listId}
        listId={route.listId}
        onBack={() => navigate("/lists")}
        onSelectBook={(id) => navigate(`/books/${id}`)}
      />
    );
  }

  if (route.name === "profile") {
    return (
      <ProfilePage
        key={route.userId}
        userId={route.userId}
        onBack={() => navigate("/")}
      />
    );
  }

  return (
    <CataloguePage
      onSelectBook={(id) => navigate(`/books/${id}`)}
      onShowLists={() => navigate("/lists")}
    />
  );
}
