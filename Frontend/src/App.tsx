import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Applyfresh from "./pages/students/applyfresh";
import HomePage from "./pages/homepage/homepage";
import Layout from "./components/Layout";
import Addcenter from "./pages/centers/addcenter";
import Allcenters from "./pages/centers/allcenters";
import Allstudents from "./pages/students/allstudents";


const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/student-application-foam" element={<Applyfresh/>} />
          <Route path="/add-center" element={<Addcenter/>} />
          <Route path="/centers" element={<Allcenters/>} />
          <Route path="/students" element={<Allstudents/>} />


        </Routes>
     </Layout>
    </Router>
  );
};

export default App;