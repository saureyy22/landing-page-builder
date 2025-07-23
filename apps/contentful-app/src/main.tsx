import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { DragDropProvider } from './components/DragDropProvider';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const AppWithProviders = () => (
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <DragDropProvider>
          <App />
        </DragDropProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

root.render(<AppWithProviders />);

export default App;