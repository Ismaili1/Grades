import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/add-teacher.css";

function AddTeacher() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "enseignant",
    subject_id: "",
    class_ids: [] // Changed to array for multiple classes
  });

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(function() {
    const token = localStorage.getItem("token");
    
    // Fetch subjects
    axios.get("http://localhost:8000/api/subjects", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function(response) {
      let subjectsData = [];
      if (Array.isArray(response.data)) {
        subjectsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        subjectsData = response.data.data;
      }
      
      setSubjects(subjectsData);
      setLoadingSubjects(false);
    })
    .catch(function(error) {
      console.error("Error fetching subjects:", error);
      setError("Erreur lors du chargement des matières.");
      setLoadingSubjects(false);
    });

    // Fetch classes
    axios.get("http://localhost:8000/api/classes", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function(response) {
      let classesData = [];
      if (Array.isArray(response.data)) {
        classesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        classesData = response.data.data;
      }
      
      setClasses(classesData);
      setLoadingClasses(false);
    })
    .catch(function(error) {
      console.error("Error fetching classes:", error);
      setError("Erreur lors du chargement des classes.");
      setLoadingClasses(false);
    });
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(function(prev) {
      return {
        ...prev,
        [name]: value
      };
    });
  }

  // Handle class selection from dropdown
  function handleClassSelect(event) {
    const { value } = event.target;
    
    if (value) {
      setForm(function(prev) {
        return {
          ...prev,
          class_ids: [...prev.class_ids, value]
        };
      });
    }
  }

  // Handle removing a selected class
  function handleClassRemove(classIdToRemove) {
    setForm(function(prev) {
      return {
        ...prev,
        class_ids: prev.class_ids.filter(function(id) {
          return id !== classIdToRemove;
        })
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    // First create the user/teacher
    axios.post("http://localhost:8000/api/users", {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role
    }, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(function(userResponse) {
      console.log("User created:", userResponse.data);
      
      // If subject and classes are selected, create the assignments
      if (form.subject_id && form.class_ids.length > 0) {
        const createdUser = userResponse.data.user;
        
        // Get the teacher data
        return axios.get(`http://localhost:8000/api/users/${createdUser.id}`, {
          headers: {
            Authorization: "Bearer " + token
          }
        });
      }
      
      return Promise.resolve(null);
    })
    .then(function(teacherResponse) {
      if (teacherResponse && form.subject_id && form.class_ids.length > 0) {
        const teacherData = teacherResponse.data;
        
        if (teacherData.teacher && teacherData.teacher.id) {
          // Create multiple assignments - one for each selected class
          const assignmentPromises = form.class_ids.map(function(classId) {
            return axios.post("http://localhost:8000/api/assignments", {
              teacher_id: teacherData.teacher.id,
              subject_id: form.subject_id,
              class_id: classId
            }, {
              headers: {
                Authorization: "Bearer " + token
              }
            });
          });
          
          // Wait for all assignments to be created
          return Promise.all(assignmentPromises);
        }
      }
      
      return Promise.resolve(null);
    })
    .then(function() {
      const classCount = form.class_ids.length;
      const successMessage = classCount > 0 
        ? `Enseignant ajouté avec succès et assigné à ${classCount} classe(s) !`
        : "Enseignant ajouté avec succès !";
        
      setSuccess(successMessage);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "enseignant",
        subject_id: "",
        class_ids: []
      });

      setTimeout(function() {
        navigate("/admin/dashboard");
      }, 2000);
    })
    .catch(function(error) {
      console.error("Error adding teacher:", error);
      setError(error.response?.data?.message || "Erreur lors de l'ajout de l'enseignant.");
    });
  }

  return (
    <div className="add-teacher-form">
      <h2>Ajouter un enseignant</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Matière enseignée</label>
          {loadingSubjects ? (
            <p>Chargement des matières...</p>
          ) : (
            <select
              name="subject_id"
              value={form.subject_id}
              onChange={handleChange}
            >
              <option value="">Sélectionner une matière (optionnel)</option>
              {subjects.map(function(subject) {
                return (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        <div className="form-group">
          <label>Classes assignées</label>
          {loadingClasses ? (
            <p>Chargement des classes...</p>
          ) : (
            <div className="class-selection">
              <select
                value=""
                onChange={handleClassSelect}
                className="class-dropdown"
              >
                <option value="">Sélectionner une classe à ajouter...</option>
                {classes
                  .filter(function(class_) {
                    return !form.class_ids.includes(class_.id.toString());
                  })
                  .map(function(class_) {
                    return (
                      <option key={class_.id} value={class_.id}>
                        {class_.name}
                      </option>
                    );
                  })}
              </select>
              
              {form.class_ids.length > 0 && (
                <div className="selected-classes">
                  <p className="selected-label">Classes sélectionnées:</p>
                  <div className="class-tags-container">
                    {form.class_ids.map(function(classId) {
                      const classObj = classes.find(function(c) {
                        return c.id.toString() === classId;
                      });
                      
                      return (
                        <span key={classId} className="class-tag">
                          <span className="class-name">{classObj ? classObj.name : classId}</span>
                          <button
                            type="button"
                            className="remove-class"
                            onClick={function() { handleClassRemove(classId); }}
                            title="Supprimer cette classe"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="note">
          Note: Vous pouvez créer l'enseignant d'abord et assigner les matières/classes plus tard.
        </p>

        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default AddTeacher;