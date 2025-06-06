<?php

namespace App\Http\Controllers\API;

use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Teacher;
use App\Models\Subject;
use App\Models\Class_;

class TeacherAssignmentController extends Controller
{
    //Assigner un enseignant a une matiere et une classe.

    public function assign(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:classes,id',
        ]);
        
        $teacher = Teacher::findOrFail($request->teacher_id);
        
        // Verifier si l'enseignant est déjà assigné à cette matière dans cette classe
        $exists = $teacher->subjects()
            ->wherePivot('subject_id', $request->subject_id)
            ->wherePivot('class_id', $request->class_id)
            ->exists();
        
        if ($exists) {
            return response()->json([
                'message' => 'Cet enseignant est déjà assigné à cette matière dans cette classe'
            ], 422);
        }
        
        $teacher->subjects()->attach($request->subject_id, ['class_id' => $request->class_id]);
        
        return response()->json([
            'message' => 'Enseignant assigné avec succès'
        ], 201);
    }

    // Retirer l'assignation d'un enseignant à une matière et une classe.

    public function unassign(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:classes,id',
        ]);
        
        $teacher = Teacher::findOrFail($request->teacher_id);
        
        $teacher->subjects()
            ->wherePivot('subject_id', $request->subject_id)
            ->wherePivot('class_id', $request->class_id)
            ->detach();
        
        return response()->json([
            'message' => 'Assignation supprimée avec succès'
        ]);
    }

    // Obtenir toutes les assignations d'enseignants.

    public function index()
    {
        $assignments = DB::table('teacher_subject')
            ->join('teachers', 'teacher_subject.teacher_id', '=', 'teachers.id')
            ->join('users', 'teachers.user_id', '=', 'users.id')
            ->join('subjects', 'teacher_subject.subject_id', '=', 'subjects.id')
            ->join('classes', 'teacher_subject.class_id', '=', 'classes.id')
            ->select(
                'teacher_subject.id',
                'teacher_subject.teacher_id',
                'teacher_subject.subject_id',
                'teacher_subject.class_id',
                'users.name as teacher_name',
                'subjects.name as subject_name',
                'classes.name as class_name'
            )
            ->get();
        
        return response()->json($assignments);
    }

    //get les matieres assignées à un enseignant spécifique.

    public function teacherSubjects($teacherId)
    {
        $teacher = Teacher::findOrFail($teacherId);
        
        $assignments = $teacher->subjects()
            ->with('classes')
            ->get()
            ->map(function ($subject) use ($teacher) {
                $classes = DB::table('teacher_subject')
                    ->where('teacher_id', $teacher->id)
                    ->where('subject_id', $subject->id)
                    ->join('classes', 'teacher_subject.class_id', '=', 'classes.id')
                    ->select('classes.*')
                    ->get();
                
                return [
                    'subject' => $subject,
                    'classes' => $classes
                ];
            });
        
        return response()->json([
            'teacher' => $teacher->load('user'),
            'assignments' => $assignments
        ]);
    }
}