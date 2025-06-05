import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState("");

  useEffect(function() {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté.");
      return;
    }

    // First, get user info
    axios.get("http://localhost:8000/api/user", {
      headers: {
        Authorization: "Bearer " + token,
      }
    })
    .then(function(response) {
      if (response.data.role !== "étudiant") {
        setError("Accès refusé. Cette page est réservée aux étudiants.");
        return;
      }
      setStudent(response.data);

      // Then fetch grades filtered by student_id
      return axios.get("http://localhost:8000/api/grades?student_id=" + response.data.id, {
        headers: {
          Authorization: "Bearer " + token,
        }
      });
    })
    .then(function(response) {
      if (response) {
        setGrades(response.data);
      }
    })
    .catch(function(err) {
      setError("Erreur lors de la récupération des données.");
    });
  }, []);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!student) {
    return <p>Chargement...</p>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto", marginTop: "50px" }}>
      <h2>Bienvenue, {student.name}</h2>
      <h3>Vos notes :</h3>
      {grades.length === 0 && <p>Aucune note trouvée.</p>}
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID Matière</th>
            <th>Note</th>
            <th>Année Académique</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(function(grade) {
            return (
              <tr key={grade.id}>
                <td>{grade.subject_id}</td>
                <td>{grade.grade}</td>
                <td>{grade.academic_year_id}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StudentDashboard;
