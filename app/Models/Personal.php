<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Personal extends Model
{
    protected $table = 'personals';

    protected $fillable = [
        'desc',
        'role',
        'about',
        'photo',
    ];
}
