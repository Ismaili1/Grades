import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../css/add-subject.css'

function AddSubject() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  function handleChange(event) {
    setName(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    axios.post("http://localhost:8000/api/subjects", {
      name: name
    }, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function () {
      setSuccess("Matière ajoutée avec succès !");
      setName("");

      setTimeout(function () {
        navigate("/admin/dashboard");
      }, 2000);
    })
    .catch(function (error) {
      setError("Erreur lors de l'ajout de la matière.");
    });
  }

  return (
    <div className="add-subject-form">
      <h2>Ajouter une matière</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom de la matière</label>
          <input
            type="text"
            value={name}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default AddSubject;
