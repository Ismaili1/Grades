import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/ClassStudent.css";

function ClassStudents() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  useEffect(function () {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Non autorisé.");
      setLoading(false);
      return;
    }

    // Load teachers
    axios
      .get("http://localhost:8000/api/users?role=enseignant", {
        headers: { Authorization: "Bearer " + token },
      })
      .then(function (response) {
        // Make sure response.data is an array
        if (Array.isArray(response.data)) {
          setTeachers(response.data);
        } else {
          console.error("Teachers API response is not an array:", response.data);
          setTeachers([]);
        }
      })
      .catch(function (error) {
        console.error("Error loading teachers:", error);
        setTeachers([]);
      });

    // Load subjects
    axios
      .get("http://localhost:8000/api/subjects", {
        headers: { Authorization: "Bearer " + token },
      })
      .then(function (response) {
        // Make sure response.data is an array
        if (Array.isArray(response.data)) {
          setSubjects(response.data);
        } else {
          console.error("Subjects API response is not an array:", response.data);
          setSubjects([]);
        }
      })
      .catch(function (error) {
        console.error("Error loading subjects:", error);
        setSubjects([]);
      });

    // Load students
    axios
      .get("http://localhost:8000/api/classes/" + id + "/students", {
        headers: { Authorization: "Bearer " + token },
      })
      .then(function (response) {
        if (Array.isArray(response.data)) {
          setStudents(response.data);
        } else {
          console.error("Students API response is not an array:", response.data);
          setStudents([]);
        }
        setLoading(false);
      })
      .catch(function (error) {
        console.error("Error loading students:", error);
        setError("Erreur lors du chargement des étudiants.");
        setLoading(false);
      });
  }, [id]);

  function handleDelete(studentId, userId) {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Voulez-vous vraiment supprimer cet étudiant ?")) return;

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

  function handleOpenAssignForm() {
    setShowAssignForm(true);
  }

  function handleTeacherChange(event) {
    setSelectedTeacherId(event.target.value);
  }

  function handleSubjectChange(event) {
    setSelectedSubjectId(event.target.value);
  }

  function handleAssign(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    if (!selectedTeacherId || !selectedSubjectId) {
      alert("Veuillez sélectionner un enseignant et une matière.");
      return;
    }

    axios
      .post(
        "http://localhost:8000/api/assignments",
        {
          teacher_id: selectedTeacherId,
          subject_id: selectedSubjectId,
          class_id: id,
        },
        {
          headers: { Authorization: "Bearer " + token },
        }
      )
      .then(function () {
        alert("Enseignant assigné avec succès !");
        setShowAssignForm(false);
        setSelectedTeacherId("");
        setSelectedSubjectId("");
      })
      .catch(function (error) {
        console.error("Error assigning teacher:", error);
        alert("Échec de l'assignation.");
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
      <h2>Étudiants de la classe {id}</h2>

      <button className="assign-teacher-btn" onClick={handleOpenAssignForm}>
        Assigner un enseignant
      </button>

      {showAssignForm && (
        <form onSubmit={handleAssign} className="assign-form">
          <h3>Assigner un enseignant à cette classe</h3>

          <label>Enseignant :</label>
          <select value={selectedTeacherId} onChange={handleTeacherChange}>
            <option value="">-- Choisir un enseignant --</option>
            {Array.isArray(teachers) && teachers.map(function (teacher) {
              return (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              );
            })}
          </select>

          <label>Matière :</label>
          <select value={selectedSubjectId} onChange={handleSubjectChange}>
            <option value="">-- Choisir une matière --</option>
            {Array.isArray(subjects) && subjects.map(function (subject) {
              return (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              );
            })}
          </select>

          <button type="submit">Assigner</button>
          <button type="button" onClick={() => setShowAssignForm(false)}>
            Annuler
          </button>
        </form>
      )}

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
  );
}

export default ClassStudents;