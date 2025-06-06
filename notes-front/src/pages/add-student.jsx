import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../css/add-student.css';

function AddStudent() {
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    class_id: ""
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(function () {
    const token = localStorage.getItem("token");

    axios.get("http://localhost:8000/api/classes", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(function (res) {
      setClasses(res.data);
    })
    .catch(function () {
      setError("Erreur lors du chargement des classes.");
    });
  }, []);

  function handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;
    setFormData(function (prevData) {
      return {
        ...prevData,
        [name]: value
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: "étudiant",
      class_id: formData.class_id
    };

    axios.post("http://localhost:8000/api/users", payload, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function () {
      setSuccess("Étudiant ajouté avec succès !");
      setFormData({
        name: "",
        email: "",
        password: "",
        class_id: ""
      });

      setTimeout(function () {
        navigate("/admin");
      }, 2000);
    })
    .catch(function (error) {
      setError("Erreur lors de l'ajout de l'étudiant.");
    });
  }

  return (
    <div className="add-student-form">
      <h2>Ajouter un étudiant</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Classe</label>
          <select
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Sélectionnez une classe --</option>
            {classes.map(function (cl) {
              return (
                <option key={cl.id} value={cl.id}>
                  {cl.name}
                </option>
              );
            })}
          </select>
        </div>

        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default AddStudent;
