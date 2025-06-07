import React, { useState, useEffect } from 'react';
import { User, BookOpen, Trophy, Calendar, TrendingUp, Star, Award, Target } from 'lucide-react';
import '../../css/StudentDashboard.css';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [grades, setGrades] = useState([]);
  const [averages, setAverages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(1); // Default academic year

  useEffect(() => {
    fetchStudentData();
    fetchGrades();
    fetchAverages();
  }, [selectedYear]);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStudentData(data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = new URL('http://localhost:8000/api/grades');
      url.searchParams.append('academic_year_id', selectedYear);
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setGrades(data.data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchAverages = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.student) {
        const response = await fetch(
          `http://localhost:8000/api/students/${user.student.id}/averages/${selectedYear}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const data = await response.json();
        setAverages(data);
      }
    } catch (error) {
      console.error('Error fetching averages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColorClass = (grade) => {
    if (grade >= 16) return 'grade-excellent';
    if (grade >= 14) return 'grade-tres-bien';
    if (grade >= 12) return 'grade-bien';
    if (grade >= 10) return 'grade-assez-bien';
    return 'grade-insuffisant';
  };

  const getPerformanceLevel = (average) => {
    if (average >= 16) return { level: 'Excellent', icon: '🏆', className: 'excellent' };
    if (average >= 14) return { level: 'Très Bien', icon: '⭐', className: 'tres-bien' };
    if (average >= 12) return { level: 'Bien', icon: '👍', className: 'bien' };
    if (average >= 10) return { level: 'Assez Bien', icon: '👌', className: 'assez-bien' };
    return { level: 'À Améliorer', icon: '💪', className: 'a-ameliorer' };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  const performance = averages?.general_average ? getPerformanceLevel(averages.general_average) : null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Header */}
        <div className="header-card">
          <div className="header-content">
            <div className="header-user-info">
              <div className="user-avatar">
                <User />
              </div>
              <div className="user-details">
                <h1>
                  Bonjour, {studentData?.name} 👋
                </h1>
                <p>
                  {studentData?.student?.class?.name} • Année Académique {selectedYear}
                </p>
              </div>
            </div>
            <div className="year-controls">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="year-select"
              >
                <option value={1}>2023-2024</option>
                <option value={2}>2024-2025</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card blue-border">
            <div className="stat-card-content">
              <div className="stat-card-info">
                <p>Moyenne Générale</p>
                <p>
                  {averages?.general_average?.toFixed(2) || '--'}/20
                </p>
              </div>
              <div className="stat-card-icon blue">
                <Target />
              </div>
            </div>
            {performance && (
              <div className={`performance-indicator ${performance.className}`}>
                <span>{performance.icon}</span>
                <span>{performance.level}</span>
              </div>
            )}
          </div>

          <div className="stat-card green-border">
            <div className="stat-card-content">
              <div className="stat-card-info">
                <p>Matières</p>
                <p>
                  {averages?.subject_averages?.length || 0}
                </p>
              </div>
              <div className="stat-card-icon green">
                <BookOpen />
              </div>
            </div>
            <p className="stat-description green">Matières étudiées</p>
          </div>

          <div className="stat-card purple-border">
            <div className="stat-card-content">
              <div className="stat-card-info">
                <p>Notes Saisies</p>
                <p>{grades.length}</p>
              </div>
              <div className="stat-card-icon purple">
                <Award />
              </div>
            </div>
            <p className="stat-description purple">Cette année</p>
          </div>

          <div className="stat-card yellow-border">
            <div className="stat-card-content">
              <div className="stat-card-info">
                <p>Meilleure Note</p>
                <p>
                  {grades.length > 0 ? Math.max(...grades.map(g => g.grade)).toFixed(1) : '--'}/20
                </p>
              </div>
              <div className="stat-card-icon yellow">
                <Trophy />
              </div>
            </div>
            <p className="stat-description yellow">Record personnel</p>
          </div>
        </div>

        <div className="content-grid">
          {/* Subject Averages */}
          <div className="content-card">
            <div className="content-card-header">
              <div className="content-card-icon green">
                <TrendingUp />
              </div>
              <h2 className="content-card-title">Moyennes par Matière</h2>
            </div>

            <div className="subject-list">
              {averages?.subject_averages?.map((subjectAvg, index) => (
                <div key={index} className="subject-item">
                  <div className="subject-info">
                    <div className="subject-icon">
                      <BookOpen />
                    </div>
                    <span className="subject-name">{subjectAvg.subject.name}</span>
                  </div>
                  <div className="subject-grade-info">
                    <span className={`grade-badge ${getGradeColorClass(subjectAvg.average)}`}>
                      {subjectAvg.average}/20
                    </span>
                  </div>
                </div>
              ))}
              {(!averages?.subject_averages || averages.subject_averages.length === 0) && (
                <div className="empty-state">
                  <BookOpen />
                  <p>Aucune moyenne disponible pour cette année</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Grades */}
          <div className="content-card">
            <div className="content-card-header">
              <div className="content-card-icon purple">
                <Star />
              </div>
              <h2 className="content-card-title">Notes Récentes</h2>
            </div>

            <div className="grades-list">
              {grades.slice(0, 10).map((grade, index) => (
                <div key={index} className="grade-item">
                  <div className="grade-details">
                    <div className="grade-header">
                      <span className="grade-subject">{grade.subject?.name}</span>
                      <span className="grade-date">
                        • {new Date(grade.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="grade-teacher">Prof: {grade.teacher?.user?.name}</p>
                  </div>
                  <div className={`grade-value ${getGradeColorClass(grade.grade)}`}>
                    {grade.grade}/20
                  </div>
                </div>
              ))}
              {grades.length === 0 && (
                <div className="empty-state">
                  <Calendar />
                  <p>Aucune note disponible</p>
                  <p>Vos notes apparaîtront ici une fois saisies</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        {averages?.general_average && (
          <div className="performance-banner">
            <div className="performance-banner-content">
              <div className="performance-banner-icon">
                <Trophy />
              </div>
              <div className="performance-banner-info">
                <h3>Votre Performance</h3>
                <p>
                  {performance?.level} avec une moyenne de {averages.general_average.toFixed(2)}/20
                </p>
                <div className="performance-banner-stats">
                  <span>🎯 Objectif: 16/20</span>
                  <span>📈 Progression continue</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;