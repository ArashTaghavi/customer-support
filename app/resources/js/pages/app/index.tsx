import type { ReactNode } from 'react';
import AppLayout from './layout';

export default function App() {
    return null;
}

App.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;
