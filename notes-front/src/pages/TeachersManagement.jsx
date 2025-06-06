import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../css/TeachersManagement.css';

function TeachersManagement() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(function () {
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
        role: "enseignant"
      }
    })
    .then(function (response) {
      console.log("API Response:", response.data); // Debug log
      
      // Handle different possible response structures
      let teachersData = [];
      if (Array.isArray(response.data)) {
        teachersData = response.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        teachersData = response.data.users;
      } else if (response.data && Array.isArray(response.data.data)) {
        teachersData = response.data.data;
      }

      if (teachersData.length === 0) {
        setError("Aucun enseignant trouvé dans la base de données.");
      }

      setTeachers(teachersData);
      setFilteredTeachers(teachersData);
      setLoading(false);
    })
    .catch(function (error) {
      console.error("API Error:", error);
      setError("Erreur lors du chargement des enseignants: " + (error.response?.data?.message || error.message));
      setLoading(false);
    });
  }, []);

  useEffect(function () {
    if (searchTerm === "") {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(function (teacher) {
        return (
          (teacher.name && teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (teacher.id && teacher.id.toString().includes(searchTerm)) ||
          (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredTeachers(filtered);
    }
  }, [searchTerm, teachers]);

  function handleEdit(teacherId) {
    navigate("/admin/edit-teacher/" + teacherId);
  }

  function handleDelete(teacherId, teacherName) {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer l'enseignant " + teacherName + " ?")) {
      const token = localStorage.getItem("token");
      
      axios.delete("http://localhost:8000/api/users/" + teacherId, {
        headers: {
          Authorization: "Bearer " + token
        }
      })
      .then(function () {
        const updatedTeachers = teachers.filter(function (teacher) {
          return teacher.id !== teacherId;
        });
        setTeachers(updatedTeachers);
        setFilteredTeachers(updatedTeachers.filter(function (teacher) {
          return (
            (teacher.name && teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (teacher.id && teacher.id.toString().includes(searchTerm)) ||
            (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }));
        alert("Enseignant supprimé avec succès.");
      })
      .catch(function (error) {
        console.error("Delete Error:", error);
        alert("Erreur lors de la suppression: " + (error.response?.data?.message || error.message));
      });
    }
  }

  function goBack() {
    navigate("/admin");
  }

  function goToAddTeacher() {
    navigate("/admin/add-teacher");
  }

  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="teachers-management">
      <div className="teachers-header">
        <button className="back-button" onClick={goBack}>← Retour</button>
        <h1 className="page-title">Gestion des Enseignants</h1>
        <button className="add-teacher-button" onClick={goToAddTeacher}>
          + Ajouter un enseignant
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher par nom, ID ou email..."
          value={searchTerm}
          onChange={function (e) { setSearchTerm(e.target.value); }}
        />
      </div>

      <div className="teachers-count">
        <p>Total: {filteredTeachers.length} enseignant(s)</p>
      </div>

      {!Array.isArray(filteredTeachers) || filteredTeachers.length === 0 ? (
        <div className="no-results">
          {searchTerm ? (
            <p>Aucun enseignant trouvé pour "{searchTerm}"</p>
          ) : (
            <p>Aucun enseignant disponible.</p>
          )}
        </div>
      ) : (
        <div className="teachers-grid">
          {filteredTeachers.map(function (teacher) {
            return (
              <div key={teacher.id} className="teacher-card">
                <div className="teacher-info">
                  <h3 className="teacher-name">{teacher.name || "Nom non disponible"}</h3>
                  <p className="teacher-id">ID: {teacher.id || "N/A"}</p>
                  <p className="teacher-email">{teacher.email || "Email non disponible"}</p>
                  {teacher.teacher && teacher.teacher.subjects && (
                    <p className="teacher-subjects">
                      Matières: {teacher.teacher.subjects.length || "0"}
                    </p>
                  )}
                </div>
                <div className="teacher-actions">
                  <button
                    className="edit-button"
                    onClick={function () { handleEdit(teacher.id); }}
                  >
                    Modifier
                  </button>
                  <button
                    className="delete-button"
                    onClick={function () { handleDelete(teacher.id, teacher.name); }}
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

export default TeachersManagement;