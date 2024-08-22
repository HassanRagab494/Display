import React from 'react';
import DataForm from './pages/input/DataForm';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppNavbar from './comb/naaav';
import DisplayData from './pages/show/DisplayData';

function App() {
  return (
    <Router>
      <div>
        <AppNavbar />
        <Routes>
          <Route path="/data-form" element={<DataForm />} />
          <Route path="/display" element={<DisplayData/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
