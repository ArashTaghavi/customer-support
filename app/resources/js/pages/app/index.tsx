import type { ReactNode } from "react";
import { Chat } from "./components";
import AppLayout from "./layout";

export default function App() {
    return <Chat />;
}

App.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
