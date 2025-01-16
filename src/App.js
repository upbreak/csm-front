import { Routes, Route, useLocation } from "react-router-dom";
import PrivateRouter from './component/layout/PrivateRoute';
import Login from './component/layout/Login/Login';

// 라우팅 모듈
// /login을 제외한 요청은 PrivateRouter을 통하여 처리됨
function App() {
  const location = useLocation();

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRouter />} >
          
        </Route>
      </Routes>
    </div>
  );
}

export default App;
