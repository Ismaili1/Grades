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
      console.log("API Response:", response);
      
      // Handle paginated response from Laravel
      let studentsData = [];
      if (response.data && Array.isArray(response.data.data)) {
        studentsData = response.data.data; // Laravel pagination format
      } else if (Array.isArray(response.data)) {
        studentsData = response.data;
      }

      if (studentsData.length === 0) {
        setError("Aucun étudiant trouvé dans la base de données.");
      }

      console.log("Students data:", studentsData);
      if (studentsData.length > 0) {
        console.log("Sample student with class:", studentsData[0]);
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
        const searchLower = searchTerm.toLowerCase();
        return (
          (student.name && student.name.toLowerCase().includes(searchLower)) ||
          (student.id && student.id.toString().includes(searchTerm)) ||
          (student.email && student.email.toLowerCase().includes(searchLower)) ||
          // Search in class name if available
          (student.student && student.student.class && student.student.class.name && 
           student.student.class.name.toLowerCase().includes(searchLower))
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
          const searchLower = searchTerm.toLowerCase();
          return (
            (student.name && student.name.toLowerCase().includes(searchLower)) ||
            (student.id && student.id.toString().includes(searchTerm)) ||
            (student.email && student.email.toLowerCase().includes(searchLower)) ||
            (student.student && student.student.class && student.student.class.name && 
             student.student.class.name.toLowerCase().includes(searchLower))
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
    navigate("/admin/dashboard");
  }

  function goToAddStudent() {
    navigate("/admin/add-student");
  }

  // Helper function to get class name
  function getStudentClassName(student) {
    if (student.student && student.student.class && student.student.class.name) {
      return student.student.class.name;
    }
    return "Non assigné";
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
          placeholder="Rechercher par nom, ID, email ou classe..."
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
                  <p className="student-class">
                    <strong>Classe: </strong>
                    <span className="class-name">{getStudentClassName(student)}</span>
                  </p>
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