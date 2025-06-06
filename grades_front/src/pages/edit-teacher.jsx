import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import '../css/EditTeacher.css';

function EditTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState({
    name: '',
    email: '',
    role: 'enseignant'
  });
  const [subjects, setSubjects] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);
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

    async function fetchData() {
      try {
        // Fetch teacher data
        const teacherResponse = await axios.get(`http://localhost:8000/api/users/${id}`, {
          headers: { Authorization: "Bearer " + token }
        });
        
        setTeacher({
          name: teacherResponse.data.name,
          email: teacherResponse.data.email,
          role: teacherResponse.data.role || 'enseignant'
        });

        // Fetch teacher's assigned subjects
        const subjectsResponse = await axios.get(`http://localhost:8000/api/teachers/${id}/subjects`, {
          headers: { Authorization: "Bearer " + token }
        });

        // Handle different response formats
        let teacherSubjects = [];
        if (Array.isArray(subjectsResponse.data)) {
          teacherSubjects = subjectsResponse.data;
        } else if (subjectsResponse.data && subjectsResponse.data.subjects) {
          teacherSubjects = subjectsResponse.data.subjects;
        } else if (subjectsResponse.data && subjectsResponse.data.data) {
          teacherSubjects = subjectsResponse.data.data;
        }

        setAssignedSubjects(teacherSubjects.map(subject => subject.id));

        // Fetch all available subjects
        const allSubjectsResponse = await axios.get("http://localhost:8000/api/subjects", {
          headers: { Authorization: "Bearer " + token }
        });

        // Handle different response formats for all subjects
        let allSubjects = [];
        if (Array.isArray(allSubjectsResponse.data)) {
          allSubjects = allSubjectsResponse.data;
        } else if (allSubjectsResponse.data && allSubjectsResponse.data.subjects) {
          allSubjects = allSubjectsResponse.data.subjects;
        } else if (allSubjectsResponse.data && allSubjectsResponse.data.data) {
          allSubjects = allSubjectsResponse.data.data;
        }

        setSubjects(allSubjects);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Erreur lors du chargement des données. Veuillez vérifier la console pour plus de détails.");
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setTeacher(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleSubjectToggle(subjectId) {
    setAssignedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const token = localStorage.getItem("token");
    const teacherData = {
      name: teacher.name,
      email: teacher.email,
      role: teacher.role,
      subjects: assignedSubjects
    };

    axios.put(`http://localhost:8000/api/users/${id}`, teacherData, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function() {
      setSuccess("Enseignant mis à jour avec succès!");
      setTimeout(() => navigate("/admin/teachers"), 1500);
    })
    .catch(function(error) {
      console.error("Update Error:", error);
      setError(error.response?.data?.message || "Erreur lors de la mise à jour");
    });
  }

  function goBack() {
    navigate("/admin/teachers");
  }

  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  return (
    <div className="edit-teacher-container">
      <div className="edit-teacher-header">
        <button className="back-button" onClick={goBack}>← Retour</button>
        <h1 className="page-title">Modifier l'Enseignant</h1>
      </div>

      <div className="edit-teacher-form-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-teacher-form">
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              type="text"
              id="name"
              name="name"
              value={teacher.name}
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
              value={teacher.email}
              onChange={handleChange}
              required
            />
          </div>

      <div className="form-group">
        <label>Matières enseignées</label>
        {subjects.length > 0 ? (
          <div className="subjects-list">
            {subjects.map(subject => (
              <div key={subject.id} className="subject-checkbox">
                <input
                  type="checkbox"
                  id={`subject-${subject.id}`}
                  checked={assignedSubjects.includes(subject.id)}
                  onChange={() => handleSubjectToggle(subject.id)}
                />
                <label htmlFor={`subject-${subject.id}`}>
                  {subject.name}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-subjects-message">Aucune matière disponible</p>
        )}
      </div>

          <input type="hidden" name="role" value={teacher.role} />

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

export default EditTeacher;