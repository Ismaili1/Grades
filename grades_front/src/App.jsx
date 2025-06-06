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
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
         <Route path="/admin/add-class" element={<AddClassForm />} />
         <Route path="/admin/add-student" element={<AddStudent/>}/>
         <Route path="/admin/add-subject" element={<AddSubject/>}/>
         <Route path="/admin/add-teacher" element={<AddTeacher/>}/>
         <Route path="/admin/class/:id" element={<ClassStudents />} />
         <Route path="/admin/students" element={<StudentsManagement/>}/>
         <Route path="/admin/teachers" element={<TeachersManagement/>}/>
         <Route path="/admin/subjects" element={<SubjectsManagement/>}/>
         <Route path="/admin/classes" element={<ClassesManagement/>} />
         <Route path="/admin/edit-student/:id" element={<EditStudent/>} />
         <Route path="/admin/edit-subject/:id" element={<EditSubject/>} />
         <Route path="/admin/edit-teacher/:id" element={<EditTeacher/>} />
         <Route path="/admin/edit-class/:id" element={<EditClass/>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
