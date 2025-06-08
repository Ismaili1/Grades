import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Filter, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Trophy,
  User,
  ChevronDown,
  Eye,
  BarChart3,
  Download
} from 'lucide-react';
import '../../css/StudentGrades.css';

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchGrades();
    fetchSubjects();
    fetchTeachers();
  }, [selectedYear]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSubjects(data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/teachers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTeachers(data.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 16) return 'grade-green';
    if (grade >= 14) return 'grade-blue';
    if (grade >= 12) return 'grade-yellow';
    if (grade >= 10) return 'grade-orange';
    return 'grade-red';
  };

  const getGradeIcon = (grade) => {
    if (grade >= 16) return '🏆';
    if (grade >= 14) return '⭐';
    if (grade >= 12) return '👍';
    if (grade >= 10) return '👌';
    return '💪';
  };

  const filteredAndSortedGrades = () => {
    let filtered = grades.filter(grade => {
      const matchesSubject = !selectedSubject || grade.subject?.id === parseInt(selectedSubject);
      const matchesTeacher = !selectedTeacher || grade.teacher?.id === parseInt(selectedTeacher);
      const matchesSearch = !searchTerm || 
        grade.subject?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.teacher?.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSubject && matchesTeacher && matchesSearch;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'grade':
          aValue = a.grade;
          bValue = b.grade;
          break;
        case 'subject':
          aValue = a.subject?.name || '';
          bValue = b.subject?.name || '';
          break;
        case 'teacher':
          aValue = a.teacher?.user?.name || '';
          bValue = b.teacher?.user?.name || '';
          break;
        case 'date':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const calculateStats = () => {
    const filteredGrades = filteredAndSortedGrades();
    if (filteredGrades.length === 0) return null;

    const total = filteredGrades.reduce((sum, grade) => sum + grade.grade, 0);
    const average = total / filteredGrades.length;
    const highest = Math.max(...filteredGrades.map(g => g.grade));
    const lowest = Math.min(...filteredGrades.map(g => g.grade));

    return { average, highest, lowest, count: filteredGrades.length };
  };

  const clearFilters = () => {
    setSelectedSubject('');
    setSelectedTeacher('');
    setSearchTerm('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement de vos notes...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="header-icon">
            <BookOpen />
          </div>
          <div>
            <h1>Mes Notes</h1>
            <p>Année Académique {selectedYear === 1 ? '2023-2024' : '2024-2025'}</p>
          </div>
        </div>
        <div className="header-right">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-select"
          >
            <option value={1}>2023-2024</option>
            <option value={2}>2024-2025</option>
          </select>
          <button className="export-button">
            <Download />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stats-card blue">
            <div>
              <p>Moyenne</p>
              <p>{stats.average.toFixed(2)}/20</p>
            </div>
            <div className="icon-circle blue-bg">
              <BarChart3 />
            </div>
          </div>
          <div className="stats-card green">
            <div>
              <p>Meilleure Note</p>
              <p>{stats.highest}/20</p>
            </div>
            <div className="icon-circle green-bg">
              <TrendingUp />
            </div>
          </div>
          <div className="stats-card red">
            <div>
              <p>Note la plus faible</p>
              <p>{stats.lowest}/20</p>
            </div>
            <div className="icon-circle red-bg">
              <TrendingDown />
            </div>
          </div>
          <div className="stats-card purple">
            <div>
              <p>Total Notes</p>
              <p>{stats.count}</p>
            </div>
            <div className="icon-circle purple-bg">
              <Trophy />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-container">
        <div className="filters-header">
          <h2>Filtres et Recherche</h2>
          <button onClick={() => setShowFilters(!showFilters)} className="toggle-filters-button">
            <Filter />
            <span>{showFilters ? 'Masquer' : 'Afficher'} les filtres</span>
            <ChevronDown className={showFilters ? 'rotated' : ''} />
          </button>
        </div>

        <div className="search-bar">
          <Search />
          <input
            type="text"
            placeholder="Rechercher par matière ou professeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showFilters && (
          <div className="filters-grid">
            <div>
              <label>Matière</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">Toutes les matières</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Professeur</label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">Tous les professeurs</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.user?.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Date</option>
                <option value="grade">Note</option>
                <option value="subject">Matière</option>
                <option value="teacher">Professeur</option>
              </select>
            </div>

            <div>
              <label>Ordre</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="clear-filters-button">
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grades Table */}
      <div className="grades-table-container">
        {filteredAndSortedGrades().length === 0 ? (
          <p className="no-grades-msg">Aucune note disponible.</p>
        ) : (
          <table className="grades-table">
            <thead>
              <tr>
                <th>Matière</th>
                <th>Professeur</th>
                <th>Date</th>
                <th>Note</th>
                <th>Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedGrades().map((grade) => (
                <tr key={grade.id}>
                  <td>
                    <div className="subject-cell">
                      <Calendar />
                      <span>{grade.subject?.name}</span>
                    </div>
                  </td>
                  <td>{grade.teacher?.user?.name}</td>
                  <td>{new Date(grade.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className={`grade-badge ${getGradeColor(grade.grade)}`}>
                    {grade.grade} {getGradeIcon(grade.grade)}
                  </td>
                  <td>{grade.comment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentGrades;
