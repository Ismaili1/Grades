import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import '../css/EditClass.css';

function EditClass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState({
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

    // Fetch class data
    axios.get(`http://localhost:8000/api/classes/${id}`, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function(response) {
      // Handle different response formats
      const classInfo = response.data.class || response.data.data || response.data;
      setClassData({
        name: classInfo.name || ''
      });
      setLoading(false);
    })
    .catch(function(error) {
      console.error("Error loading class:", error);
      setError("Erreur lors du chargement de la classe.");
      setLoading(false);
    });
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setClassData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const token = localStorage.getItem("token");

    axios.put(`http://localhost:8000/api/classes/${id}`, classData, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function() {
      setSuccess("Classe mise à jour avec succès!");
      setTimeout(() => navigate("/admin/classes"), 1500);
    })
    .catch(function(error) {
      console.error("Update Error:", error);
      setError(error.response?.data?.message || "Erreur lors de la mise à jour");
    });
  }

  function goBack() {
    navigate("/admin/classes");
  }

  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  return (
    <div className="edit-class-container">
      <div className="edit-class-header">
        <button className="back-button" onClick={goBack}>← Retour</button>
        <h1 className="page-title">Modifier la Classe</h1>
      </div>

      <div className="edit-class-form-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-class-form">
          <div className="form-group">
            <label htmlFor="name">Nom de la classe</label>
            <input
              type="text"
              id="name"
              name="name"
              value={classData.name}
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

export default EditClass;