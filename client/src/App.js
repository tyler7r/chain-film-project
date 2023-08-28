import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserSignup } from './UserSignup';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path='/signup' element={<UserSignup />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
