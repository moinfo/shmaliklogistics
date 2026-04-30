<?php

namespace App\Services;

use App\Models\BillingDocument;
use App\Models\Driver;
use App\Models\Permit;
use App\Models\Vehicle;

class AlertService
{
    public static function count(): int
    {
        return count(self::all(30));
    }

    public static function all(int $days = 30): array
    {
        $alerts = [];

        // Driver licence expiries
        foreach (Driver::whereNotNull('license_expiry')
            ->where('license_expiry', '<=', now()->addDays($days))
            ->where('status', '!=', 'inactive')
            ->orderBy('license_expiry')
            ->get(['id', 'name', 'license_expiry']) as $d) {
            $left = (int) now()->startOfDay()->diffInDays($d->license_expiry->copy()->startOfDay(), false);
            $alerts[] = [
                'type'     => 'licence',
                'icon'     => '🪪',
                'color'    => $left < 0 ? '#EF4444' : ($left <= 7 ? '#F59E0B' : '#F97316'),
                'title'    => $left < 0 ? 'Driver Licence EXPIRED' : 'Driver Licence expiring',
                'subtitle' => $d->name,
                'days'     => $left,
                'href'     => "/system/drivers/{$d->id}",
            ];
        }

        // Driver visa expiries
        foreach (Driver::whereNotNull('visa_expiry')
            ->where('visa_expiry', '<=', now()->addDays($days))
            ->where('status', '!=', 'inactive')
            ->orderBy('visa_expiry')
            ->get(['id', 'name', 'visa_expiry']) as $d) {
            $left = (int) now()->startOfDay()->diffInDays($d->visa_expiry->copy()->startOfDay(), false);
            $alerts[] = [
                'type'     => 'visa',
                'icon'     => '🛂',
                'color'    => $left < 0 ? '#EF4444' : ($left <= 7 ? '#F59E0B' : '#F97316'),
                'title'    => $left < 0 ? 'Driver Visa EXPIRED' : 'Driver Visa expiring',
                'subtitle' => $d->name,
                'days'     => $left,
                'href'     => "/system/drivers/{$d->id}",
            ];
        }

        // Permit expiries
        foreach (Permit::where('expiry_date', '<=', now()->addDays($days))
            ->where('expiry_date', '>=', now()->subDays(14))
            ->orderBy('expiry_date')
            ->get(['id', 'permit_type', 'vehicle_plate', 'expiry_date']) as $p) {
            $left = (int) now()->startOfDay()->diffInDays($p->expiry_date->copy()->startOfDay(), false);
            $alerts[] = [
                'type'     => 'permit',
                'icon'     => '📋',
                'color'    => $left < 0 ? '#EF4444' : ($left <= 7 ? '#F59E0B' : '#F97316'),
                'title'    => $left < 0 ? "{$p->permit_type} Permit EXPIRED" : "{$p->permit_type} Permit expiring",
                'subtitle' => $p->vehicle_plate,
                'days'     => $left,
                'href'     => "/system/permits/{$p->id}",
            ];
        }

        // Overdue invoices
        foreach (BillingDocument::where('type', 'invoice')
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->startOfDay())
            ->with('client:id,name')
            ->orderBy('due_date')
            ->get(['id', 'document_number', 'client_id', 'due_date', 'total']) as $inv) {
            $left = (int) now()->startOfDay()->diffInDays($inv->due_date->copy()->startOfDay(), false);
            $alerts[] = [
                'type'     => 'invoice',
                'icon'     => '💰',
                'color'    => '#EF4444',
                'title'    => 'Invoice Overdue',
                'subtitle' => "{$inv->document_number} — " . ($inv->client?->name ?? '—'),
                'days'     => $left,
                'href'     => "/system/billing/invoices/{$inv->id}",
            ];
        }

        // Vehicle document expiries
        $vehicleFields = [
            'insurance_expiry'             => 'Insurance',
            'road_licence_expiry'          => 'Road Licence',
            'fitness_expiry'               => 'Fitness Cert',
            'tra_sticker_expiry'           => 'TRA Sticker',
            'goods_vehicle_licence_expiry' => 'Goods Licence',
        ];

        foreach ($vehicleFields as $field => $label) {
            foreach (Vehicle::whereNotNull($field)
                ->where($field, '<=', now()->addDays($days))
                ->whereNotIn('status', ['retired', 'maintenance'])
                ->orderBy($field)
                ->get(['id', 'plate', $field]) as $v) {
                $expiry = $v->$field;
                $left   = (int) now()->startOfDay()->diffInDays($expiry->copy()->startOfDay(), false);
                $alerts[] = [
                    'type'     => 'vehicle',
                    'icon'     => '🚗',
                    'color'    => $left < 0 ? '#EF4444' : ($left <= 7 ? '#F59E0B' : '#F97316'),
                    'title'    => $left < 0 ? "Vehicle {$label} EXPIRED" : "Vehicle {$label} expiring",
                    'subtitle' => $v->plate,
                    'days'     => $left,
                    'href'     => "/system/fleet/{$v->id}",
                ];
            }
        }

        // Sort: most urgent first (lowest days value)
        usort($alerts, fn($a, $b) => $a['days'] <=> $b['days']);

        return $alerts;
    }
}
