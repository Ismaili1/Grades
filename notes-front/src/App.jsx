import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

// Layout
import Layout from "./components/Layout";

// Dashboards
import AdminDashboard from "./pages/Admin/AdminDashboard";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentGrades from "./pages/Student/StudentGrades";

import GradesManagement from "./pages/Teacher/GradesManagement";
import BulletinScolaire from "./pages/Teacher/etudiants";

// Admin Pages
import AddClassForm from "./pages/Admin/add-class";
import AddSubject from "./pages/Admin/add-subject";

import ClassStudents from "./pages/Admin/ClassStudent";

import StudentsManagement from "./pages/Admin/StudentsManagement";
import TeachersManagement from "./pages/Admin/TeachersManagement";
import SubjectsManagement from "./pages/Admin/SubjectsManagement";
import ClassesManagement from "./pages/Admin/ClassesManagement";

import EditSubject from "./pages/Admin/edit-subject";

import EditClass from "./pages/Admin/edit-class";

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
          <Route path="add-subject" element={<AddSubject />} />

          <Route path="class/:id" element={<ClassStudents />} />

          {/* Management Routes */}
          <Route path="students" element={<StudentsManagement />} />
          <Route path="teachers" element={<TeachersManagement />} />
          <Route path="subjects" element={<SubjectsManagement />} />
          <Route path="classes" element={<ClassesManagement />} />

          {/* Edit Routes */}
          <Route path="edit-subject/:id" element={<EditSubject />} />

          <Route path="edit-class/:id" element={<EditClass />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/enseignant" element={<Layout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="grades" element={<GradesManagement />} />
          <Route path="students" element={<BulletinScolaire />} />
        </Route>

        {/* Student Routes */}
        <Route path="/étudiant" element={<Layout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="grades" element={<StudentGrades />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
