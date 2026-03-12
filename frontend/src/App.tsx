import { Route, Routes } from "react-router-dom";

import { HamburgerMenu } from "./components/HamburgerMenu";
import { HomePage } from "./pages/Home";
import { ListPage } from "./pages/List";
import { MyListsPage } from "./pages/MyLists";

export default function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#d6f5e8_0%,_#f8fafc_45%,_#f1f5f9_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <main className="mx-auto w-full max-w-4xl">
        <HamburgerMenu />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-lists" element={<MyListsPage />} />
          <Route path="/lists/:listId" element={<ListPage />} />
        </Routes>
      </main>
    </div>
  );
}
