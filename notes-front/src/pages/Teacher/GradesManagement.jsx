import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "../../css/GradesManagement.css";

function GradesManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [uniqueAcademicYears, setUniqueAcademicYears] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editGradeId, setEditGradeId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    subject_id: "",
    academic_year_id: "",
    grade: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await api.getUser();
        if (userData.role !== "enseignant" || !userData.teacher) {
          throw new Error("Accès interdit : vous devez être un enseignant.");
        }
        setTeacherId(userData.teacher.id);
        const teacherClasses = await api.getTeacherClasses();
        setClasses(teacherClasses);
        const teacherSubjects = await api.getTeacherSubjects();
        setSubjects(teacherSubjects);
        // Recuperation des annees scolaires
        const years = await api.getAcademicYears();
        setUniqueAcademicYears(years);
      } catch (err) {
        setError(err.message || "Erreur lors de l'initialisation.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) {
        setStudents([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const studentsData = await api.getTeacherClassStudents(selectedClassId);
        setStudents(studentsData);
      } catch (err) {
        setError(
          err.message || "Erreur lors de la récupération des étudiants."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClassId]);

  useEffect(() => {
    // Reset des matieres et des étudiants lors du changement de classe
    setSelectedSubjectId("");
    setFormData((prev) => ({ ...prev, student_id: "", subject_id: "" }));
  }, [selectedClassId]);

  useEffect(() => {
    // Reset des étudiants lors du changement de matière
    setFormData((prev) => ({ ...prev, student_id: "" }));
  }, [selectedSubjectId]);

  useEffect(() => {
    if (formMode === "edit") setShowForm(true);
  }, [formMode]);

  // Filtre des matieres pour la classe selectionnée
  const filteredSubjects = selectedClassId
    ? subjects.filter((item) =>
        item.classes.some((c) => c.id.toString() === selectedClassId)
      )
    : [];

  // Filtre des etudiants pour la classe selectionnee
  const filteredStudents = students;

  const fetchGradesAndBuildData = async (teacherIdParam) => {
    try {
      setLoading(true);
      const teacherGrades = await api.getGrades({ teacher_id: teacherIdParam });

      if (!Array.isArray(teacherGrades)) {
        throw new Error("Format de données invalide reçu du serveur.");
      }

      setGrades(teacherGrades);
    } catch (err) {
      console.error("Data Fetch Error:", err);
      setError(err.message || "Erreur lors de la récupération des notes.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const grade = parseFloat(formData.grade);
    if (isNaN(grade) || grade < 0 || grade > 20) {
      throw new Error("La note doit être comprise entre 0 et 20.");
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      validateForm();

      if (formMode === "add") {
        await api.createGrade({
          student_id: parseInt(formData.student_id),
          subject_id: parseInt(formData.subject_id),
          academic_year_id: parseInt(formData.academic_year_id),
          grade: parseFloat(formData.grade),
        });
        alert("Note ajoutée avec succès !");
      } else if (formMode === "edit" && editGradeId) {
        await api.updateGrade(editGradeId, {
          grade: parseFloat(formData.grade),
        });
        alert("Note mise à jour avec succès !");
      }

      resetForm();
      await fetchGradesAndBuildData(teacherId);
    } catch (err) {
      console.error("Form Submit Error:", err);
      alert(
        err.message ||
          "Une erreur est survenue lors de l'enregistrement de la note."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormMode("add");
    setEditGradeId(null);
    setFormData({
      student_id: "",
      subject_id: "",
      academic_year_id: "",
      grade: "",
    });
  };

  const handleEditClick = (grade) => {
    setFormMode("edit");
    setEditGradeId(grade.id);
    setFormData({
      student_id: grade.student.id.toString(),
      subject_id: grade.subject.id.toString(),
      academic_year_id: grade.academic_year.id.toString(),
      grade: grade.grade.toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette note ?")) return;
    try {
      setLoading(true);
      await api.deleteGrade(id);
      alert("Note supprimée avec succès !");
      await fetchGradesAndBuildData(teacherId);
    } catch (err) {
      console.error("Delete Error:", err);
      alert(
        err.message ||
          "Une erreur est survenue lors de la suppression de la note."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchGradesAndBuildData(teacherId);
    }
  }, [teacherId]);

  if (loading) {
    return (
      <div className="grades-loading">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grades-error">
        <p className="error-message">{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="gestion-notes-container">
      <h2>Gestion des notes</h2>

      <section className="form-section">
        <h3>{formMode === "add" ? "Ajouter une note" : "Modifier une note"}</h3>
        <button
          className="ajouter-toggle-button"
          onClick={() => setShowForm((prev) => !prev)}
          disabled={formMode === "edit"}
          style={{
            marginBottom: "1rem",
            width: "100%",
            padding: "1rem",
            fontWeight: "bold",
          }}
        >
          {showForm ? "Fermer le formulaire" : "Ajouter"}
        </button>
        {showForm && (
          <form onSubmit={handleFormSubmit} className="grade-form">
            <div className="form-row">
              <label>Classe :</label>
              <div className="radio-group">
                {classes.map((classe) => (
                  <label key={classe.id} style={{ marginRight: "1rem" }}>
                    <input
                      type="radio"
                      name="class_id"
                      value={classe.id}
                      checked={selectedClassId === classe.id.toString()}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      disabled={formMode === "edit" || isSubmitting}
                      required
                    />
                    {classe.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label>Matière :</label>
              <select
                name="subject_id"
                value={formData.subject_id}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  handleFormChange(e);
                }}
                required
                disabled={
                  !selectedClassId || formMode === "edit" || isSubmitting
                }
              >
                <option value="">-- Sélectionnez une matière --</option>
                {filteredSubjects.map((item) => (
                  <option key={item.subject.id} value={item.subject.id}>
                    {item.subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Élève :</label>
              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleFormChange}
                required
                disabled={
                  !selectedClassId ||
                  !formData.subject_id ||
                  formMode === "edit" ||
                  isSubmitting
                }
              >
                <option value="">-- Sélectionnez un élève --</option>
                {filteredStudents.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.user?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Année scolaire :</label>
              <select
                name="academic_year_id"
                value={formData.academic_year_id}
                onChange={handleFormChange}
                required
                disabled={formMode === "edit" || isSubmitting}
              >
                <option value="">-- Sélectionnez une année --</option>
                {uniqueAcademicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Note (/20) :</label>
              <input
                type="number"
                name="grade"
                value={formData.grade}
                onChange={handleFormChange}
                min="0"
                max="20"
                step="0.1"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : formMode === "add"
                  ? "Ajouter"
                  : "Mettre à jour"}
              </button>
              {formMode === "edit" && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancel-button"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        )}
      </section>

      <section className="grades-list">
        <h3>Liste des notes</h3>
        {grades.length === 0 ? (
          <p className="no-grades">Aucune note enregistrée.</p>
        ) : (
          <table className="grades-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Matière</th>
                <th>Année</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.student?.user?.name || "Inconnu"}</td>
                  <td>{grade.subject?.name || "Inconnue"}</td>
                  <td>{grade.academic_year?.label || "Inconnue"}</td>
                  <td>{grade.grade}/20</td>
                  <td>
                    <button
                      onClick={() => handleEditClick(grade)}
                      className="edit-button"
                      disabled={isSubmitting}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(grade.id)}
                      className="delete-button"
                      disabled={isSubmitting}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default GradesManagement;
