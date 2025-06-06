import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/TeacherDashboard.css";

function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalGrades: 0,
    totalStudents: 0,
    averageGrade: 0,
    recentGrades: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Get user
        const userRes = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: "Bearer " + token },
        });

        const teacher = userRes.data.teacher;

        // Get all grades
        const gradesRes = await axios.get("http://localhost:8000/api/grades", {
          headers: { Authorization: "Bearer " + token },
        });

        const allGrades = gradesRes.data.data;

        // Filter grades by teacher
        const teacherGrades = allGrades.filter(
          (grade) => grade.teacher?.id === teacher?.id
        );

        // Count unique students
        const studentIds = new Set(
          teacherGrades.map((grade) => grade.student?.id)
        );

        // moyenne
        const average =
          teacherGrades.length > 0
            ? teacherGrades.reduce((sum, g) => sum + g.grade, 0) /
              teacherGrades.length
            : 0;

        // Get 5
        const recent = [...teacherGrades]
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 5);

        setStats({
          totalGrades: teacherGrades.length,
          totalStudents: studentIds.size,
          averageGrade: average.toFixed(2),
          recentGrades: recent,
        });
      } catch (error) {
        console.error("Erreur de chargement du tableau de bord:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="teacher-dashboard">
      <h2 className="dashboard-title">Tableau de bord - Enseignant</h2>

      <div className="stats-container">
        <div className="stat-card">
          <h3>{stats.totalGrades}</h3>
          <p>Notes saisies</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalStudents}</h3>
          <p>Étudiants</p>
        </div>
        <div className="stat-card">
          <h3>{stats.averageGrade}</h3>
          <p>Moyenne générale</p>
        </div>
      </div>

      <div className="recent-grades">
        <h3>Notes récentes</h3>
        {stats.recentGrades.length === 0 ? (
          <p>Aucune note enregistrée.</p>
        ) : (
          stats.recentGrades.map((grade) => (
            <div key={grade.id} className="grade-item">
              <strong>{grade.student?.user?.name}</strong> -{" "}
              {grade.subject?.name}
              <span className="grade-note">
                {grade.grade}/20 <small>{grade.created_at.slice(0, 10)}</small>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
