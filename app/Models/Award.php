<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Award extends Model
{
    protected $table = 'awards';

    protected $fillable = [
        'title',
        'slug',
        'type',
        'status',
        'description',
        'issuer',
        'photo',
        'date',
    ];

    protected $appends = [
        'date_format'
    ];

    public function getDateFormatAttribute($value)
    {
        return Carbon::parse($value)->format('M Y');
    }
}
