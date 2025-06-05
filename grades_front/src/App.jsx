import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddClassForm from "./pages/add-class";
import AddStudent from "./pages/add-student";
import AddSubject from "./pages/add-subject";
import AddTeacher from './pages/add-teacher';
import ClassStudents from "./pages/ClassStudent";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
         <Route path="/admin/add-class" element={<AddClassForm />} />
         <Route path="/admin/add-student" element={<AddStudent/>}/>
         <Route path="/admin/add-subject" element={<AddSubject/>}/>
         <Route path="/admin/add-teacher" element={<AddTeacher/>}/>
         <Route path="/admin/class/:id" element={<ClassStudents />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
