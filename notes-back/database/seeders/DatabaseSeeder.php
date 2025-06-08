<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\AcademicYear;
use App\Models\Teacher;
use App\Models\Student;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        AcademicYear::create(['label' => '2023-2024']);
        
        $classe1 = SchoolClass::create(['name' => 'Terminal S']);
        $classe2 = SchoolClass::create(['name' => 'Terminal ES']);
        
        $maths = Subject::create(['name' => 'Mathématiques']);
        $physique = Subject::create(['name' => 'Physique-Chimie']);
        $francais = Subject::create(['name' => 'Français']);
        $histoire = Subject::create(['name' => 'Histoire-Géographie']);
        
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
        
        $enseignant1 = User::create([
            'name' => 'Pierre Dupont',
            'email' => 'pierre.dupont@example.com',
            'password' => bcrypt('password'),
            'role' => 'enseignant',
        ]);
        
        $enseignant2 = User::create([
            'name' => 'Marie Martin',
            'email' => 'marie.martin@example.com',
            'password' => bcrypt('password'),
            'role' => 'enseignant',
        ]);
        
        $teacher1 = Teacher::create(['user_id' => $enseignant1->id]);
        $teacher2 = Teacher::create(['user_id' => $enseignant2->id]);
        
        $teacher1->subjects()->attach($maths->id, ['class_id' => $classe1->id]);
        $teacher1->subjects()->attach($physique->id, ['class_id' => $classe1->id]);
        $teacher2->subjects()->attach($francais->id, ['class_id' => $classe1->id]);
        $teacher2->subjects()->attach($histoire->id, ['class_id' => $classe1->id]);
        
        for ($i = 1; $i <= 5; $i++) {
            $etudiant = User::create([
                'name' => "Étudiant $i",
                'email' => "etudiant$i@example.com",
                'password' => bcrypt('password'),
                'role' => 'étudiant',
            ]);
            
            Student::create([
                'user_id' => $etudiant->id,
                'class_id' => $classe1->id,
            ]);
        }
    }
}