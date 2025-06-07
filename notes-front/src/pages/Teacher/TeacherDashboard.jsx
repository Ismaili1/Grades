import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "../../css/TeacherDashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [gradeChartData, setGradeChartData] = useState([]);
  const [classComparisonData, setClassComparisonData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = await api.getUser();
        if (user.role !== "enseignant" || !user.teacher) {
          throw new Error(
            "Accès interdit : vous devez être connecté en tant qu'enseignant."
          );
        }

        const teacherId = user.teacher.id;

        const [teacherClasses, teacherSubjects, teacherGrades] =
          await Promise.all([
            api.getTeacherClasses(),
            api.getTeacherSubjects(),
            api.getGrades({ teacher_id: teacherId }),
          ]);

        setClasses(teacherClasses);
        setSubjects(teacherSubjects);

        if (!Array.isArray(teacherGrades)) {
          throw new Error("Format de données invalide reçu du serveur.");
        }

        // Données pour histogramme des notes par matière
        const gradeDistribution = {};
        const classAverage = {};

        teacherGrades.forEach((g) => {
          const subjectName = g.subject?.name || "Inconnue";
          gradeDistribution[subjectName] =
            (gradeDistribution[subjectName] || 0) + 1;

          const className = g.student?.class?.name || "Inconnue";
          if (!classAverage[className]) {
            classAverage[className] = { total: 0, count: 0 };
          }
          classAverage[className].total += g.grade;
          classAverage[className].count += 1;
        });

        const gradeChart = Object.entries(gradeDistribution).map(
          ([subject, count]) => ({
            subject,
            count,
          })
        );

        const classChart = Object.entries(classAverage).map(
          ([className, data]) => ({
            className,
            average: (data.total / data.count).toFixed(2),
          })
        );

        setGradeChartData(gradeChart);
        setClassComparisonData(classChart);

        // Activité récente
        const last5 = [...teacherGrades]
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 5);

        setRecentActivities(last5);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError(
          err.message ||
            "Une erreur est survenue lors du chargement des données."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Chargement du tableau de bord…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p className="error-message">{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2>Tableau de bord – Enseignant</h2>

      {/* Distribution des notes  */}
      <section className="chart-section">
        <h3>Distribution des notes par matière</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gradeChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Nombre de notes" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/*Comparaison des moyennes par classe */}
      <section className="chart-section">
        <h3>Comparaison des moyennes par classe</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={classComparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="className" />
            <YAxis domain={[0, 20]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#82ca9d" name="Moyenne /20" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Mes classes */}
      <section className="teacher-classes-section">
        <h3>Mes classes</h3>
        {classes.length === 0 ? (
          <p>Aucune classe assignée.</p>
        ) : (
          <ul>
            {classes.map((classe) => (
              <li key={classe.id}>{classe.name}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Matières */}
      <section className="teacher-subjects-section">
        <h3>Mes matières</h3>
        {subjects.length === 0 ? (
          <p>Aucune matière assignée.</p>
        ) : (
          <ul>
            {subjects.map((item, idx) => (
              <li key={idx}>
                {item.subject.name} (Classes:{" "}
                {item.classes.map((c) => c.name).join(", ")})
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Activité récente */}
      <section className="recent-activity-section">
        <h3>Activité récente</h3>
        {recentActivities.length === 0 ? (
          <p className="no-activity">Aucune activité récente.</p>
        ) : (
          <table className="recent-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Matière</th>
                <th>Note actuelle</th>
                <th>Mis à jour le</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.student?.user?.name || "Inconnu"}</td>
                  <td>{grade.subject?.name || "Inconnue"}</td>
                  <td>{grade.grade}/20</td>
                  <td>{formatDate(grade.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default TeacherDashboard;
