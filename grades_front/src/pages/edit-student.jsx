import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import '../css/EditStudent.css';

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState({
    name: '',
    email: '',
    class_id: '',
    role: 'étudiant' // Add role field with default value
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(function() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    // Fetch student data
    axios.get(`http://localhost:8000/api/users/${id}`, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function(response) {
      setStudent({
        name: response.data.name,
        email: response.data.email,
        class_id: response.data.student?.class_id || '',
        role: response.data.role || 'étudiant' // Preserve existing role or default to 'étudiant'
      });
      
      // Fetch available classes
      return axios.get("http://localhost:8000/api/classes", {
        headers: {
          Authorization: "Bearer " + token
        }
      });
    })
    .then(function(response) {
      setClasses(response.data);
      setLoading(false);
    })
    .catch(function(error) {
      console.error("Error:", error);
      setError("Erreur lors du chargement des données.");
      setLoading(false);
    });
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setStudent(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const token = localStorage.getItem("token");
    const studentData = {
      name: student.name,
      email: student.email,
      class_id: student.class_id,
      role: student.role // Include role in the update
    };

    axios.put(`http://localhost:8000/api/users/${id}`, studentData, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function() {
      setSuccess("Étudiant mis à jour avec succès!");
      setTimeout(() => navigate("/admin/students"), 1500);
    })
    .catch(function(error) {
      console.error("Update Error:", error);
      setError(error.response?.data?.message || "Erreur lors de la mise à jour");
    });
  }

  function goBack() {
    navigate("/admin/students");
  }

  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  return (
    <div className="edit-student-container">
      <div className="edit-student-header">
        <button className="back-button" onClick={goBack}>← Retour</button>
        <h1 className="page-title">Modifier l'Étudiant</h1>
      </div>

      <div className="edit-student-form-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-student-form">
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              value={student.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={student.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="class_id">Classe</label>
            <select
              id="class_id"
              name="class_id"
              value={student.class_id}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hidden role field */}
          <input type="hidden" name="role" value={student.role} />

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={goBack}>
              Annuler
            </button>
            <button type="submit" className="save-button">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudent;