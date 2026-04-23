import Home from './components/Home'
import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router'
import NotFound from './components/NotFound'
import LoginForm from './components/LoginForm'
import ProtectedRoute from './components/ProtectedRoute'
const App = () => {
  return(
<BrowserRouter>
<Routes>
  <Route path="/" element={<LoginForm/>}/>
     <Route path="*" element={<NotFound/>}/>
     <Route path='/home' element = {<ProtectedRoute><Home/></ProtectedRoute>}/>
</Routes>
</BrowserRouter>
  )
}
export default App