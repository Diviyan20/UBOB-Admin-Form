import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLoginForm from './views/AdminLoginForm'
import ConfigurationForm from './views/ConfigurationForm'

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login"/>}></Route>
      <Route path="/login" element={<AdminLoginForm/>}></Route>
      <Route path="/configuration" element={<ConfigurationForm/>}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
