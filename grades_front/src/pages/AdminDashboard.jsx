  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import '../css/AdminDashboard.css';

  function AdminDashboard() {
    const [admin, setAdmin] = useState(null);
    const [stats, setStats] = useState({
      students: 0,
      subjects: 0,
      teachers: 0,
      classesCount: 0
    });
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(function () {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vous devez être connecté.");
        return;
      }

      axios.get("http://localhost:8000/api/user", {
        headers: {
          Authorization: "Bearer " + token
        }
      })
      .then(function (response) {
        if (response.data.role !== "admin" && response.data.role !== "super admin") {
          setError("Accès refusé. Réservé aux administrateurs.");
          return;
        }

        setAdmin(response.data);

        const statsPromise = axios.get("http://localhost:8000/api/dashboard-stats", {
          headers: { Authorization: "Bearer " + token }
        });

        const classesPromise = axios.get("http://localhost:8000/api/classes", {
          headers: { Authorization: "Bearer " + token }
        });

        return Promise.all([statsPromise, classesPromise]);
      })
      .then(function (results) {
        if (results) {
          setStats({
            students: results[0].data.students,
            subjects: results[0].data.subjects,
            teachers: results[0].data.teachers,
            classesCount: results[0].data.classesCount
          });
          setClasses(results[1].data);
        }
      })
      .catch(function () {
        setError("Erreur lors du chargement du tableau de bord.");
      });
    }, []);

    function goToAddStudent() {
      navigate("/admin/add-student");
    }

    function goToAddSubject() {
      navigate("/admin/add-subject");
    }

    function goToAddTeacher() {
      navigate("/admin/add-teacher");
    }

    function goToAddClass() {
      navigate("/admin/add-class");
    }

    function goToClassDetails(id) {
      navigate("/admin/class/" + id);
    }

    if (error) {
      return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
    }

    if (!admin) {
      return <p style={{ textAlign: "center" }}>Chargement...</p>;
    }

    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1 className="admin-title">Bienvenue, {admin.name}</h1>
          <p className="admin-subtitle">Tableau de bord administrateur</p>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <p className="stat-title">Total des étudiants</p>
            <p className="stat-value">{stats.students}</p>
            <button className="add-icon-bottom" onClick={goToAddStudent}>+</button>
          </div>
          <div className="stat-card">
            <p className="stat-title">Total des matières</p>
            <p className="stat-value">{stats.subjects}</p>
            <button className="add-icon-bottom" onClick={goToAddSubject}>+</button>
          </div>
          <div className="stat-card">
            <p className="stat-title">Total des enseignants</p>
            <p className="stat-value">{stats.teachers}</p>
            <button className="add-icon-bottom" onClick={goToAddTeacher}>+</button>
          </div>
          <div className="stat-card">
            <p className="stat-title">Total des classes</p>
            <p className="stat-value">{stats.classesCount}</p>
            <button className="add-icon-bottom" onClick={goToAddClass}>+</button>
          </div>
        </div>

        <div className="classes-section">
          <h3 className="section-title">Classes</h3>
          {classes.length === 0 ? (
            <p>Aucune classe disponible.</p>
          ) : (
            <div className="classes-grid">
              {classes.map(function (cl) {
                return (
                  <div
                    key={cl.id}
                    className="class-card"
                    onClick={function () { goToClassDetails(cl.id); }}
                    style={{ cursor: "pointer" }}
                  >
                    <h4 className="class-name">{cl.name}</h4>
                    <p className="class-id">ID: {cl.id}</p>
                    <p className="class-students">Étudiants: {cl.students_count}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  export default AdminDashboard;
