import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import '../../css/admin/add-class.css';

function AddClassForm() {
  const [className, setClassName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    axios
      .post(
        "http://localhost:8000/api/classes",
        {
          name: className,
        },
        {
          headers: { Authorization: "Bearer " + token },
        }
      )
      .then(function () {
        setSuccess("Classe ajoutée avec succès.");
        setError("");
        setTimeout(function () {
          navigate("/admin/dashboard");
        }, 1500);
      })
      .catch(function (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          setError(error.response.data.message);
        } else {
          setError("Erreur lors de l'ajout de la classe.");
        }
        setSuccess("");
      });
  }

  function handleChange(event) {
    setClassName(event.target.value);
  }

  return (
    <div className="add-class-form">
      <h2>Ajouter une classe</h2>
      <form onSubmit={handleSubmit}>
        <label>Nom de la classe:</label>
        <input type="text" value={className} onChange={handleChange} required />
        <button type="submit">Ajouter</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}

export default AddClassForm;
