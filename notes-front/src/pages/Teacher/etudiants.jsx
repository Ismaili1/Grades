import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "../../css/TeacherCss/etudiants.css";

function MesEtudiants() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [uniqueAcademicYears, setUniqueAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [studentAverages, setStudentAverages] = useState([]);
  const [loadingAverages, setLoadingAverages] = useState(false);

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

        // Recuperation des classes de l'enseignant
        const teacherClasses = await api.getTeacherClasses();
        setClasses(teacherClasses);
      } catch (err) {
        console.error("Initialization Error:", err);
        setError(
          err.message || "Une erreur est survenue lors de l'initialisation."
        );
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

  const handleYearChange = async (e) => {
    const yearId = e.target.value;
    setSelectedYear(yearId);
    if (!yearId) {
      setStudentAverages([]);
      return;
    }

    try {
      setLoadingAverages(true);
      setError(null);

      const promises = students.map((student) =>
        api
          .getStudentAverages(student.id, yearId)
          .then((data) => ({
            id: student.id,
            name: student.user?.name,
            general_average: data.general_average,
            subject_averages: data.subject_averages,
          }))
          .catch((err) => {
            console.error(
              `Error fetching averages for student ${student.id}:`,
              err
            );
            return null;
          })
      );

      const results = await Promise.all(promises);
      const validResults = results.filter((r) => r !== null);

      if (validResults.length === 0) {
        setError("Aucune moyenne disponible pour cette année scolaire.");
      }

      setStudentAverages(validResults);
    } catch (err) {
      console.error("Averages Fetch Error:", err);
      setError(
        err.message ||
          "Une erreur est survenue lors de la récupération des moyennes."
      );
    } finally {
      setLoadingAverages(false);
    }
  };

  if (loading) {
    return (
      <div className="students-loading">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="students-error">
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
    <div className="students-container">
      <h2>Mes étudiants</h2>

      <div className="class-select">
        <label>Classe :</label>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Sélectionnez une classe --</option>
          {classes.map((classe) => (
            <option key={classe.id} value={classe.id}>
              {classe.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="students-loading">
          <p>Chargement des données...</p>
        </div>
      ) : error ? (
        <div className="students-error">
          <p className="error-message">{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      ) : (
        <div>
          {students.length === 0 ? (
            <p>Aucun étudiant trouvé pour cette classe.</p>
          ) : (
            <ul>
              {students.map((student) => (
                <li key={student.id}>{student.user?.name || "Inconnu"}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default MesEtudiants;
