import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../css/GradesManagement.css";

function GestionNotes() {
  const [notes, setNotes] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const userRes = await axios.get("http://localhost:8000/api/user", {
        headers,
      });
      const teacherId = userRes.data.teacher.id;
      setTeacherId(teacherId);

      const notesRes = await axios.get("http://localhost:8000/api/grades", {
        headers,
      });
      const allNotes = notesRes.data.data;

      const teacherNotes = allNotes.filter((n) => n.teacher?.id === teacherId);
      setNotes(teacherNotes);
    } catch (err) {
      console.error("Erreur lors du chargement des notes :", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette note ?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/grades/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Erreur de suppression :", err);
    }
  };

  const handleEdit = (note) =>
    navigate("/enseignant/note-form", { state: { note } });
  const handleAdd = () => navigate("/enseignant/note-form");

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="gestion-notes">
      <div className="header">
        <h2>Gestion des Notes</h2>
        <button className="add-button" onClick={handleAdd}>
          Ajouter une note
        </button>
      </div>

      <table className="notes-table">
        <thead>
          <tr>
            <th>Étudiant</th>
            <th>Matière</th>
            <th>Note</th>
            <th>Coefficient</th>
            <th>Semestre</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((n) => (
            <tr key={n.id}>
              <td>{n.student?.user?.name}</td>
              <td>{n.subject?.name}</td>
              <td style={{ color: "green" }}>{n.grade}/20</td>
              <td>{n.coefficient}</td>
              <td>{n.semester}</td>
              <td>{n.created_at?.slice(0, 10)}</td>
              <td>
                <button className="edit" onClick={() => handleEdit(n)}>
                  Modifier
                </button>
                <button className="delete" onClick={() => handleDelete(n.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GestionNotes;
