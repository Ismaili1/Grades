import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../../css/admin/subjectsmanagement.css';

function SubjectsManagement() {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
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

    // Fetch all subjects
    axios.get("http://localhost:8000/api/subjects", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function (response) {
      setSubjects(response.data);
      setFilteredSubjects(response.data);
      setLoading(false);
    })
    .catch(function () {
      setError("Erreur lors du chargement de la liste des matières.");
      setLoading(false);
    });
  }, []);

  useEffect(function () {
    if (searchTerm === "") {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter(function (subject) {
        return (
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.id.toString().includes(searchTerm)
        );
      });
      setFilteredSubjects(filtered);
    }
  }, [searchTerm, subjects]);

  function handleEdit(subjectId) {
    navigate("/admin/edit-subject/" + subjectId);
  }

  function handleDelete(subjectId, subjectName) {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer la matière " + subjectName + " ?")) {
      const token = localStorage.getItem("token");
      
      axios.delete("http://localhost:8000/api/subjects/" + subjectId, {
        headers: {
          Authorization: "Bearer " + token
        }
      })
      .then(function () {
        // Remove the deleted subject from the state
        const updatedSubjects = subjects.filter(function (subject) {
          return subject.id !== subjectId;
        });
        setSubjects(updatedSubjects);
        setFilteredSubjects(updatedSubjects.filter(function (subject) {
          return (
            subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subject.id.toString().includes(searchTerm)
          );
        }));
        alert("Matière supprimée avec succès.");
      })
      .catch(function () {
        alert("Erreur lors de la suppression de la matière.");
      });
    }
  }

  function goBack() {
    navigate("/admin/dashboard");
  }

  function goToAddSubject() {
    navigate("/admin/add-subject");
  }

  if (loading) {
    return <p style={{ textAlign: "center" }}>Chargement...</p>;
  }

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  return (
    <div className="subjects-management">
      <div className="subjects-header">
        <button className="back-button" onClick={goBack}>← Retour</button>
        <h1 className="page-title">Gestion des Matières</h1>
        <button className="add-subject-button" onClick={goToAddSubject}>
          + Ajouter une matière
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher par nom ou ID..."
          value={searchTerm}
          onChange={function (e) { setSearchTerm(e.target.value); }}
        />
      </div>

      <div className="subjects-count">
        <p>Total: {filteredSubjects.length} matière(s)</p>
      </div>

      {filteredSubjects.length === 0 ? (
        <div className="no-results">
          {searchTerm ? (
            <p>Aucune matière trouvée pour "{searchTerm}"</p>
          ) : (
            <p>Aucune matière disponible.</p>
          )}
        </div>
      ) : (
        <div className="subjects-grid">
          {filteredSubjects.map(function (subject) {
            return (
              <div key={subject.id} className="subject-card">
                <div className="subject-info">
                  <h3 className="subject-name">{subject.name}</h3>
                  <p className="subject-id">ID: {subject.id}</p>
                  {subject.teachers_count !== undefined && (
                    <p className="subject-teachers">Enseignants: {subject.teachers_count}</p>
                  )}
                  {subject.classes_count !== undefined && (
                    <p className="subject-classes">Classes: {subject.classes_count}</p>
                  )}
                </div>
                <div className="subject-actions">
                  <button
                    className="edit-button"
                    onClick={function () { handleEdit(subject.id); }}
                  >
                    Modifier
                  </button>
                  <button
                    className="delete-button"
                    onClick={function () { handleDelete(subject.id, subject.name); }}
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

export default SubjectsManagement;