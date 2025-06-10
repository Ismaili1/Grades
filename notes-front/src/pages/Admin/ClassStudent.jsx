import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../css/Admin/classstudent.css";

function ClassStudents() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Non autorisé.");
        setLoading(false);
        return;
      }

      // Load both students and assignments
      Promise.all([
        // Load students
        axios.get("http://localhost:8000/api/classes/" + id + "/students", {
          headers: { Authorization: "Bearer " + token },
        }),
        // Load all assignments and filter for this class
        axios.get("http://localhost:8000/api/assignments", {
          headers: { Authorization: "Bearer " + token },
        }),
      ])
        .then(function (responses) {
          const [studentsResponse, assignmentsResponse] = responses;

          // Handle students
          if (Array.isArray(studentsResponse.data)) {
            setStudents(studentsResponse.data);
          } else {
            console.error(
              "Students API response is not an array:",
              studentsResponse.data
            );
            setStudents([]);
          }

          // Handle assignments - filter for this class and group by subject
          if (Array.isArray(assignmentsResponse.data)) {
            const classAssignments = assignmentsResponse.data.filter(function (
              assignment
            ) {
              return assignment.class_id == id;
            });

            // Group assignments by subject
            const subjectsMap = {};
            classAssignments.forEach(function (assignment) {
              if (!subjectsMap[assignment.subject_id]) {
                subjectsMap[assignment.subject_id] = {
                  id: assignment.subject_id,
                  name: assignment.subject_name,
                  teachers: [],
                };
              }

              // Add teacher if not already added
              const teacherExists = subjectsMap[
                assignment.subject_id
              ].teachers.some(function (teacher) {
                return teacher.id === assignment.teacher_id;
              });

              if (!teacherExists) {
                subjectsMap[assignment.subject_id].teachers.push({
                  id: assignment.teacher_id,
                  name: assignment.teacher_name,
                });
              }
            });

            // Convert to array
            const subjectsArray = Object.values(subjectsMap);
            setSubjects(subjectsArray);
          } else {
            console.error(
              "Assignments API response is not an array:",
              assignmentsResponse.data
            );
            setSubjects([]);
          }

          setLoading(false);
        })
        .catch(function (error) {
          console.error("Error loading data:", error);
          setError("Erreur lors du chargement des données.");
          setLoading(false);
        });
    },
    [id]
  );

  function handleDelete(studentId, userId) {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Voulez-vous vraiment supprimer cet étudiant ?"))
      return;

    axios
      .delete("http://localhost:8000/api/users/" + userId, {
        headers: { Authorization: "Bearer " + token },
      })
      .then(function () {
        setStudents(function (prevStudents) {
          return prevStudents.filter(function (student) {
            return student.id !== studentId;
          });
        });
      })
      .catch(function (error) {
        console.error("Error deleting student:", error);
        alert("Échec de la suppression.");
      });
  }

  if (loading) {
    return (
      <div className="class-students-container">
        <p className="loading-message">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="class-students-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="class-students-container">
      <h2>Classe {id}</h2>

      {/* Teachers and Subjects Section */}
      <div className="teachers-section">
        <h3>Enseignants et Matières</h3>
        {subjects.length === 0 ? (
          <p className="empty-message">Aucune matière assignée.</p>
        ) : (
          <table className="subjects-table">
            <thead>
              <tr>
                <th>Matière</th>
                <th>Enseignant(s)</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="subject-name">{subject.name}</td>
                  <td>
                    {subject.teachers && subject.teachers.length > 0 ? (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {subject.teachers.map((teacher) => (
                          <li
                            key={teacher.id}
                            style={{ marginBottom: "0.3rem" }}
                          >
                            {teacher.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="empty-message">
                        Aucun enseignant assigné
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Students Section */}
      <div className="students-section">
        <h3>Étudiants</h3>
        {students.length === 0 ? (
          <p className="empty-message">Aucun étudiant trouvé.</p>
        ) : (
          <ul className="students-list">
            {students.map(function (student) {
              return (
                <li key={student.id} className="student-item">
                  <div>
                    <strong>Nom:</strong> {student.user.name}
                    <br />
                    <strong>Email:</strong> {student.user.email}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={function () {
                      handleDelete(student.id, student.user.id);
                    }}
                  >
                    Supprimer
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ClassStudents;
