import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import './index.css';

import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import { database } from './src/database';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <DatabaseProvider database={database}>
        <App />
    </DatabaseProvider>
);