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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Layout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="add-class" element={<AddClassForm />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="add-subject" element={<AddSubject />} />
          <Route path="add-teacher" element={<AddTeacher />} />
          <Route path="class/:id" element={<ClassStudents />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/enseignant" element={<Layout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          {/* You can add teacher-specific pages here */}
        </Route>

        {/* Student Routes */}
        <Route path="/étudiant" element={<Layout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          {/* You can add student-specific pages here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
