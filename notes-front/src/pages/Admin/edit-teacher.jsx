import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import '../../css/admin/editteacher.css';

function EditTeacher() {
  const { id } = useParams(); // This is the user ID
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState({
    name: '',
    email: '',
    role: 'enseignant'
  });
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignedSubject, setAssignedSubject] = useState(null);
  const [originalAssignedSubject, setOriginalAssignedSubject] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
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
        // First, fetch the user data with teacher relationship
        const userResponse = await axios.get(`http://localhost:8000/api/users/${id}?role=enseignant`, {
          headers: { Authorization: "Bearer " + token }
        });
        
        console.log("User response:", userResponse.data);
        
        setTeacher({
          name: userResponse.data.name,
          email: userResponse.data.email,
          role: userResponse.data.role || 'enseignant'
        });

        // Check if user has teacher relationship and get teacher ID
        let teacherSubjects = [];
        if (userResponse.data.teacher) {
          const currentTeacherId = userResponse.data.teacher.id;
          setTeacherId(currentTeacherId);
          
          try {
            // Fetch teacher's assigned subjects using teacher ID
            const subjectsResponse = await axios.get(`http://localhost:8000/api/teachers/${currentTeacherId}/subjects`, {
              headers: { Authorization: "Bearer " + token }
            });
            
            console.log("Teacher subjects response:", subjectsResponse.data);
            
            // Handle the response format based on your TeacherAssignmentController
            if (subjectsResponse.data && subjectsResponse.data.assignments) {
              teacherSubjects = subjectsResponse.data.assignments.map(assignment => ({
                id: assignment.subject.id,
                name: assignment.subject.name
              }));
            }
          } catch (subjectError) {
            console.warn("Could not fetch teacher subjects:", subjectError);
            // This might be normal if teacher has no subjects assigned yet
          }
        } else {
          console.warn("User does not have teacher relationship");
        }

        const subjectId = teacherSubjects.length > 0 ? teacherSubjects[0].id : null;
        setAssignedSubject(subjectId);
        setOriginalAssignedSubject(subjectId);

        // Fetch all available subjects
        const allSubjectsResponse = await axios.get("http://localhost:8000/api/subjects", {
          headers: { Authorization: "Bearer " + token }
        });

        console.log("All subjects response:", allSubjectsResponse.data);

        // Handle different response formats for all subjects
        let allSubjects = [];
        if (Array.isArray(allSubjectsResponse.data)) {
          allSubjects = allSubjectsResponse.data;
        } else if (allSubjectsResponse.data && allSubjectsResponse.data.data) {
          allSubjects = allSubjectsResponse.data.data;
        } else if (allSubjectsResponse.data && allSubjectsResponse.data.subjects) {
          allSubjects = allSubjectsResponse.data.subjects;
        }

        setSubjects(allSubjects);

        // Fetch all classes for subject assignments
        const classesResponse = await axios.get("http://localhost:8000/api/classes", {
          headers: { Authorization: "Bearer " + token }
        });

        let allClasses = [];
        if (Array.isArray(classesResponse.data)) {
          allClasses = classesResponse.data;
        } else if (classesResponse.data && classesResponse.data.data) {
          allClasses = classesResponse.data.data;
        }

        setClasses(allClasses);
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

  function handleSubjectChange(subjectId) {
    // If the same subject is selected, deselect it
    if (assignedSubject === subjectId) {
      setAssignedSubject(null);
    } else {
      // Otherwise, select the new subject
      setAssignedSubject(subjectId);
    }
  }

  async function updateSubjectAssignments(token) {
    if (!teacherId) {
      throw new Error("Teacher ID not found");
    }

    console.log("Original subject:", originalAssignedSubject);
    console.log("New subject:", assignedSubject);

    // For simplicity, we'll assign to the first class available
    // In a real scenario, you might want to let the user choose the class
    const defaultClassId = classes.length > 0 ? classes[0].id : 1;

    // Remove the original subject if it exists and is different from the new one
    if (originalAssignedSubject && originalAssignedSubject !== assignedSubject) {
      try {
        await axios.delete("http://localhost:8000/api/assignments", {
          headers: { Authorization: "Bearer " + token },
          data: {
            teacher_id: teacherId,
            subject_id: originalAssignedSubject,
            class_id: defaultClassId
          }
        });
        console.log(`Removed assignment for subject ${originalAssignedSubject}`);
      } catch (error) {
        console.warn(`Failed to remove subject ${originalAssignedSubject}:`, error);
      }
    }

    // Add new subject assignment if one is selected and it's different from the original
    if (assignedSubject && assignedSubject !== originalAssignedSubject) {
      try {
        await axios.post("http://localhost:8000/api/assignments", {
          teacher_id: teacherId,
          subject_id: assignedSubject,
          class_id: defaultClassId
        }, {
          headers: { Authorization: "Bearer " + token }
        });
        console.log(`Added assignment for subject ${assignedSubject}`);
      } catch (error) {
        console.warn(`Failed to add subject ${assignedSubject}:`, error);
        throw error; // Re-throw to handle in the main function
      }
    }

    // If no subject is selected and there was an original subject, remove it
    if (!assignedSubject && originalAssignedSubject) {
      try {
        await axios.delete("http://localhost:8000/api/assignments", {
          headers: { Authorization: "Bearer " + token },
          data: {
            teacher_id: teacherId,
            subject_id: originalAssignedSubject,
            class_id: defaultClassId
          }
        });
        console.log(`Removed assignment for subject ${originalAssignedSubject}`);
      } catch (error) {
        console.warn(`Failed to remove subject ${originalAssignedSubject}:`, error);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const token = localStorage.getItem("token");
    
    try {
      // First, update the basic user information
      const teacherData = {
        name: teacher.name,
        email: teacher.email,
        role: teacher.role
      };

      console.log("Updating teacher data:", teacherData);

      await axios.put(`http://localhost:8000/api/users/${id}`, teacherData, {
        headers: {
          Authorization: "Bearer " + token,
          'Content-Type': 'application/json'
        }
      });

      // Then, update subject assignments if there are changes
      const hasSubjectChanges = assignedSubject !== originalAssignedSubject;

      if (hasSubjectChanges && teacherId) {
        console.log("Updating subject assignments...");
        await updateSubjectAssignments(token);
      }

      console.log("Update successful");
      setSuccess("Enseignant mis à jour avec succès!");
      setTimeout(() => navigate("/admin/teachers"), 1500);
      
    } catch (error) {
      console.error("Update Error:", error);
      setError(error.response?.data?.message || "Erreur lors de la mise à jour");
    }
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
            <label>Matière enseignée</label>
            {subjects.length > 0 ? (
              <div className="subjects-list">
                {subjects.map(subject => (
                  <div key={subject.id} className="subject-radio">
                    <input
                      type="radio"
                      id={`subject-${subject.id}`}
                      name="subject"
                      value={subject.id}
                      checked={assignedSubject === subject.id}
                      onChange={() => handleSubjectChange(subject.id)}
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