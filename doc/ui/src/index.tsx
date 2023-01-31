import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './app/App';

import 'antd/dist/reset.css';
import './index.css';

const container = document.getElementById('app');
if (!container) {
    throw 'Cannot find container "app"';
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
]);

createRoot(container).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
