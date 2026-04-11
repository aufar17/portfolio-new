<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThreadMessage extends Model
{
    protected $table = 'thread_messages';
    protected $fillable = ['user_id', 'thread_id', 'parent_id', 'message'];

    public function thread(): BelongsTo
    {
        return $this->belongsTo(Thread::class, 'thread_id', 'id');
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ThreadMessage::class, 'parent_id', 'id');
    }
}
