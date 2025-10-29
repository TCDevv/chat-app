import 'reflect-metadata';
import { useEffect } from 'react';
import { ChatLayout } from '@components/ChatLayout/ChatLayout';
import { initializeMockData } from '@utils/mockData';
import './App.scss';

function App() {
  useEffect(() => {
    // Initialize mock data on first load
    initializeMockData();
  }, []);

  return <ChatLayout />;
}

export default App;
