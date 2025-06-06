import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

// Layout
import Layout from "./components/Layout";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";

// Admin Pages
import AddClassForm from "./pages/add-class";
import AddStudent from "./pages/add-student";
import AddSubject from "./pages/add-subject";
import AddTeacher from "./pages/add-teacher";
import ClassStudents from "./pages/ClassStudent";
import StudentsManagement from "./pages/StudentsManagement";
import TeachersManagement from "./pages/TeachersManagement";
import SubjectsManagement from "./pages/SubjectsManagement";
import ClassesManagement from "./pages/ClassesManagement";
import EditStudent from "./pages/edit-student";
import EditSubject from "./pages/edit-subject";
import EditTeacher from "./pages/edit-teacher";
import EditClass from "./pages/edit-class";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
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
