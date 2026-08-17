import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLoginForm from './views/forms/AdminLoginForm'
import ConfigurationForm from './views/forms/ConfigurationForm'
import OutletDashboard from './views/dashboards/OutletDashboard'
import OutletScreenConfiguration from './components/OutletScreenConfiguration'

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login"/>}></Route>
      <Route path="/login" element={<AdminLoginForm/>}></Route>
      <Route path="/configuration" element={<ConfigurationForm/>}></Route>
      <Route path="/outlet-dashboard" element={<OutletDashboard/>}></Route>
      <Route path="/outlet-screen" element={<OutletScreenConfiguration/>}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
