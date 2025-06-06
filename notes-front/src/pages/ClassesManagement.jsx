import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../css/ClassesManagement.css';

function ClassesManagement() {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
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

    // Fetch all classes
    axios.get("http://localhost:8000/api/classes", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function (response) {
      setClasses(response.data);
      setFilteredClasses(response.data);
      setLoading(false);
    })
    .catch(function () {
      setError("Erreur lors du chargement de la liste des classes.");
      setLoading(false);
    });
  }, []);

  useEffect(function () {
    if (searchTerm === "") {
      setFilteredClasses(classes);
    } else {
      const filtered = classes.filter(function (classItem) {
        return (
          classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          classItem.id.toString().includes(searchTerm)
        );
      });
      setFilteredClasses(filtered);
    }
  }, [searchTerm, classes]);

  function handleEdit(classId) {
    navigate("/admin/edit-class/" + classId);
  }

  function handleDelete(classId, className) {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer la classe " + className + " ?")) {
      const token = localStorage.getItem("token");
      
      axios.delete("http://localhost:8000/api/classes/" + classId, {
        headers: {
          Authorization: "Bearer " + token
        }
      })
      .then(function () {
        // Remove the deleted class from the state
        const updatedClasses = classes.filter(function (classItem) {
          return classItem.id !== classId;
        });
        setClasses(updatedClasses);
        setFilteredClasses(updatedClasses.filter(function (classItem) {
          return (
            classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.id.toString().includes(searchTerm)
          );
        }));
        alert("Classe supprimée avec succès.");
      })
      .catch(function () {
        alert("Erreur lors de la suppression de la classe.");
      });
    }
  }

  function handleViewDetails(classId) {
    navigate("/admin/class/" + classId);
  }

  function goBack() {
    navigate("/admin");
  }

  function goToAddClass() {
    navigate("/admin/add-class");
  }

  if (loading) {
    return <p style={{ textAlign: "center" }}>Chargement...</p>;
  }

  if (error) {
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  }

  return (
    <div className="classes-management">
      <div className="classes-header">
        <button className="back-button" onClick={goBack}>← Retour</button>
        <h1 className="page-title">Gestion des Classes</h1>
        <button className="add-class-button" onClick={goToAddClass}>
          + Ajouter une classe
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

      <div className="classes-count">
        <p>Total: {filteredClasses.length} classe(s)</p>
      </div>

      {filteredClasses.length === 0 ? (
        <div className="no-results">
          {searchTerm ? (
            <p>Aucune classe trouvée pour "{searchTerm}"</p>
          ) : (
            <p>Aucune classe disponible.</p>
          )}
        </div>
      ) : (
        <div className="classes-grid">
          {filteredClasses.map(function (classItem) {
            return (
              <div key={classItem.id} className="class-card">
                <div className="class-info">
                  <h3 className="class-name">{classItem.name}</h3>
                  <p className="class-id">ID: {classItem.id}</p>
                  <p className="class-students">
                    Étudiants: {classItem.students_count || 0}
                  </p>
                </div>
                <div className="class-actions">
                  <button
                    className="view-button"
                    onClick={function () { handleViewDetails(classItem.id); }}
                  >
                    Détails
                  </button>
                  <button
                    className="edit-button"
                    onClick={function () { handleEdit(classItem.id); }}
                  >
                    Modifier
                  </button>
                  <button
                    className="delete-button"
                    onClick={function () { handleDelete(classItem.id, classItem.name); }}
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

export default ClassesManagement;