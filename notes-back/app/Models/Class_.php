<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Class_ extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'name',
    ];

    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }


    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'teacher_subject')
                    ->withPivot('subject_id')
                    ->withTimestamps();
    }


    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'teacher_subject', 'class__id', 'subject_id')
                    ->withPivot('teacher_id')
                    ->withTimestamps();
    }
}