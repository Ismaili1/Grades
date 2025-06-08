import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "../../css/TeacherCss/TeacherDashboard.css";
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
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [topBottomScorers, setTopBottomScorers] = useState({
    top: [],
    bottom: [],
  });

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

        // Grade Distribution
        const gradeRanges = { "0-5": 0, "6-10": 0, "11-15": 0, "16-20": 0 };
        teacherGrades.forEach(({ grade }) => {
          if (grade >= 0 && grade <= 5) gradeRanges["0-5"]++;
          else if (grade <= 10) gradeRanges["6-10"]++;
          else if (grade <= 15) gradeRanges["11-15"]++;
          else if (grade <= 20) gradeRanges["16-20"]++;
        });

        setGradeDistribution(
          Object.entries(gradeRanges).map(([range, count]) => ({
            range,
            count,
          }))
        );

        // Top & Bottom Scorers
        const studentStats = {};
        teacherGrades.forEach(({ grade, student }) => {
          const id = student?.id;
          const name = student?.user?.name || "Inconnu";
          if (!id) return;

          if (!studentStats[id])
            studentStats[id] = { name, total: 0, count: 0 };
          studentStats[id].total += grade;
          studentStats[id].count++;
        });

        const averages = Object.entries(studentStats).map(
          ([id, { name, total, count }]) => ({
            id,
            name,
            average: count ? (total / count).toFixed(2) : "-",
          })
        );

        averages.sort((a, b) => b.average - a.average);

        setTopBottomScorers({
          top: averages.slice(0, 3),
          bottom: averages.slice(-3).reverse(),
        });

        // Recent Activities
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
      <div className="dashboard-loading">Chargement du tableau de bord…</div>
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

      {/* Grade Distribution Histogram */}
      <section className="chart-section">
        <h3>Distribution des notes</h3>
        {gradeDistribution.length === 0 ? (
          <p style={{ color: "#888" }}>
            Aucune donnée de distribution disponible.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Nombre d'élèves" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Top & Bottom Scorers */}
      <section className="chart-section">
        <h3>Performance des élèves (Top 3 & Flop 3)</h3>
        <div className="student-performance-summary">
          <div className="performance-columns">
            <div>
              <h4>Top 3</h4>
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {topBottomScorers.top.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4>Flop 3</h4>
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {topBottomScorers.bottom.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
                {item.subject.name} (Classes :{" "}
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
                <th>Note</th>
                <th>Mis à jour</th>
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
