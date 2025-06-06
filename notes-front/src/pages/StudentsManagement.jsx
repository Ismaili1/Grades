import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../css/StudentsManagement.css';

function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(function() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    axios.get("http://localhost:8000/api/users", {
      headers: {
        Authorization: "Bearer " + token
      },
      params: {
        role: "étudiant"
      }
    })
    .then(function(response) {
      console.log("API Response:", response); // Debug log
      
      // Handle different possible response structures
      let studentsData = [];
      if (Array.isArray(response.data)) {
        studentsData = response.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        studentsData = response.data.users;
      } else if (response.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data;
      }

      if (studentsData.length === 0) {
        setError("Aucun étudiant trouvé dans la base de données.");
      }

      setStudents(studentsData);
      setFilteredStudents(studentsData);
      setLoading(false);
    })
    .catch(function(error) {
      console.error("API Error:", error);
      setError("Erreur lors du chargement des étudiants: " + (error.response?.data?.message || error.message));
      setLoading(false);
    });
  }, []);

  useEffect(function() {
    if (searchTerm === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(function(student) {
        return (
          (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.id && student.id.toString().includes(searchTerm)) ||
          (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  function handleEdit(studentId) {
    navigate("/admin/edit-student/" + studentId);
  }

  function handleDelete(studentId, studentName) {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer l'étudiant " + studentName + " ?")) {
      const token = localStorage.getItem("token");
      
      axios.delete("http://localhost:8000/api/users/" + studentId, {
        headers: {
          Authorization: "Bearer " + token
        }
      })
      .then(function() {
        const updatedStudents = students.filter(function(student) {
          return student.id !== studentId;
        });
        setStudents(updatedStudents);
        setFilteredStudents(updatedStudents.filter(function(student) {
          return (
            (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.id && student.id.toString().includes(searchTerm)) ||
            (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }));
        alert("Étudiant supprimé avec succès.");
      })
      .catch(function(error) {
        console.error("Delete Error:", error);
        alert("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
      });
    }
  }

  function goBack() {
    navigate("/admin");
  }

  function goToAddStudent() {
    navigate("/admin/add-student");
  }

  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="students-management">
      <div className="students-header">
        <button className="back-button" onClick={goBack}>← Retour</button>
        <h1 className="page-title">Gestion des Étudiants</h1>
        <button className="add-student-button" onClick={goToAddStudent}>
          + Ajouter un étudiant
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher par nom, ID ou email..."
          value={searchTerm}
          onChange={function(e) { setSearchTerm(e.target.value); }}
        />
      </div>

      <div className="students-count">
        <p>Total: {filteredStudents.length} étudiant(s)</p>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="no-results">
          {searchTerm ? (
            <p>Aucun étudiant trouvé pour "{searchTerm}"</p>
          ) : (
            <p>Aucun étudiant disponible.</p>
          )}
        </div>
      ) : (
        <div className="students-grid">
          {filteredStudents.map(function(student) {
            return (
              <div key={student.id} className="student-card">
                <div className="student-info">
                  <h3 className="student-name">{student.name || "Nom non disponible"}</h3>
                  <p className="student-id">ID: {student.id || "N/A"}</p>
                  <p className="student-email">{student.email || "Email non disponible"}</p>
                  {student.student && student.student.class && (
                    <p className="student-class">Classe: {student.student.class.name || "N/A"}</p>
                  )}
                </div>
                <div className="student-actions">
                  <button
                    className="edit-button"
                    onClick={function() { handleEdit(student.id); }}
                  >
                    Modifier
                  </button>
                  <button
                    className="delete-button"
                    onClick={function() { handleDelete(student.id, student.name); }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentsManagement;