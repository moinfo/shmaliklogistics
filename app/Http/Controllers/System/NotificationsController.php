<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Services\AlertService;
use Inertia\Inertia;

class NotificationsController extends Controller
{
    public function __invoke()
    {
        $alerts = AlertService::all(60);

        $grouped = [
            'expired'  => array_values(array_filter($alerts, fn($a) => $a['days'] < 0)),
            'critical' => array_values(array_filter($alerts, fn($a) => $a['days'] >= 0 && $a['days'] <= 7)),
            'warning'  => array_values(array_filter($alerts, fn($a) => $a['days'] > 7 && $a['days'] <= 30)),
            'notice'   => array_values(array_filter($alerts, fn($a) => $a['days'] > 30)),
        ];

        return Inertia::render('system/Notifications/Index', [
            'alerts'  => $alerts,
            'grouped' => $grouped,
            'counts'  => [
                'expired'  => count($grouped['expired']),
                'critical' => count($grouped['critical']),
                'warning'  => count($grouped['warning']),
                'notice'   => count($grouped['notice']),
            ],
        ]);
    }
}
