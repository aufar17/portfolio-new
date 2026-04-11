<?php

use App\Models\Thread;
use App\Models\ThreadMessage;

class ThreadService
{
    public function getThreads()
    {
        $threads = Thread::get();
        return $threads;
    }
    public function getMessage()
    {
        $threads = ThreadMessage::with(['user', 'thread', 'parent'])->get();
        return $threads;
    }

    public function createThread(){
        $thread = Thread::create([
            'title' => request('title')
        ]);
        return $thread;
    }
}
