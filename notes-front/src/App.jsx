import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

// Layout
import Layout from "./components/Layout";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import StudentGrades from "./pages/Student/StudentGrades";

import GradesManagement from "./pages/Teacher/GradesManagement";
import MesEtudiants from "./pages/Teacher/etudiants";

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

        {/* Admin Routes */}
        <Route path="/admin" element={<Layout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="add-class" element={<AddClassForm />} />
          <Route path="add-student" element={<AddStudent />} />
          <Route path="add-subject" element={<AddSubject />} />
          <Route path="add-teacher" element={<AddTeacher />} />
          <Route path="class/:id" element={<ClassStudents />} />

          {/* Management Routes */}
          <Route path="students" element={<StudentsManagement />} />
          <Route path="teachers" element={<TeachersManagement />} />
          <Route path="subjects" element={<SubjectsManagement />} />
          <Route path="classes" element={<ClassesManagement />} />

          {/* Edit Routes */}
          <Route path="edit-student/:id" element={<EditStudent />} />
          <Route path="edit-subject/:id" element={<EditSubject />} />
          <Route path="edit-teacher/:id" element={<EditTeacher />} />
          <Route path="edit-class/:id" element={<EditClass />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/enseignant" element={<Layout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="grades" element={<GradesManagement />} />
          <Route path="students" element={<MesEtudiants />} />
        </Route>

        {/* Student Routes */}
        <Route path="/étudiant" element={<Layout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="grades" element={<StudentGrades/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
