<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    protected $table = 'educations';
    protected $fillable =
    [
        'institution',
        'major',
        'title',
        'start',
        'end',
    ];
}
