import './styles/App.css';
import Login from './components/Login.jsx';
import Main from './components/Main.jsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main" element={<Main />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


