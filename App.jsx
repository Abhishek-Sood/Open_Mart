import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ThreeDStore from './components/ThreeDStore';
import CartPage from './components/CartPage'; // Adjust path if necessary
import './App.css';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ThreeDStore />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
