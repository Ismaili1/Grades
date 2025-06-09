import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import '../../css/admin/editsubject.css';

function EditSubject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState({
    name: ''
  });
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

    // Fetch subject data
    axios.get(`http://localhost:8000/api/subjects/${id}`, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function(response) {
      setSubject({
        name: response.data.name
      });
      setLoading(false);
    })
    .catch(function(error) {
      console.error("Error:", error);
      setError("Erreur lors du chargement de la matière.");
      setLoading(false);
    });
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setSubject(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const token = localStorage.getItem("token");

    axios.put(`http://localhost:8000/api/subjects/${id}`, subject, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function() {
      setSuccess("Matière mise à jour avec succès!");
      setTimeout(() => navigate("/admin/subjects"), 1500);
    })
    .catch(function(error) {
      console.error("Update Error:", error);
      setError(error.response?.data?.message || "Erreur lors de la mise à jour");
    });
  }

  function goBack() {
    navigate("/admin/subjects");
  }

  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  return (
    <div className="edit-subject-container">
      <div className="edit-subject-header">
        <button className="back-button" onClick={goBack}>← Retour</button>
        <h1 className="page-title">Modifier la Matière</h1>
      </div>

      <div className="edit-subject-form-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-subject-form">
          <div className="form-group">
            <label htmlFor="name">Nom de la matière</label>
            <input
              type="text"
              id="name"
              name="name"
              value={subject.name}
              onChange={handleChange}
              required
            />
          </div>

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

export default EditSubject;