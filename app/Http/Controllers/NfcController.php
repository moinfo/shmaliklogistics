<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class NfcController extends Controller
{
    private const BACK_IMAGE = '/nfc_cards/card-back.jpeg';

    private static array $employees = [
        'abdulmalik-suleiman-ahmed' => [
            'name'      => 'Abdulmalik Suleiman Ahmed',
            'roles'     => ['Director'],
            'email'     => 'abdulmalik.ahmed@shmaliklogistics.co.tz',
            'phone'     => '+255652373434',
            'idNo'      => '2506-2022-0001',
            'slug'      => 'abdulmalik-suleiman-ahmed',
            'image'     => '/nfc_cards/abdulmalik-suleiman-ahmed.jpeg',
            'backImage' => self::BACK_IMAGE,
        ],
        'mahsen-suleiman-ahmedy' => [
            'name'      => 'Mahsen Suleiman Ahmedy',
            'roles'     => ['Director'],
            'email'     => 'mahsen.ahmedy@shmaliklogistics.co.tz', // create this account
            'phone'     => '+255712892222',
            'idNo'      => '2506-2022-0020',
            'slug'      => 'mahsen-suleiman-ahmedy',
            'image'     => '/nfc_cards/mahsen-suleiman-ahmedy.jpeg',
            'backImage' => self::BACK_IMAGE,
        ],
        'ally-ghanim' => [
            'name'      => 'Ally Ghanim Ally',
            'roles'     => ['Operation Manager'],
            'email'     => 'ally.ghanim@shmaliklogistics.co.tz',
            'phone'     => '+255686366657',
            'idNo'      => '2506-2022-0006',
            'slug'      => 'ally-ghanim',
            'image'     => '/nfc_cards/ally-ghanim.jpeg',
            'backImage' => self::BACK_IMAGE,
        ],
        'arkam-ally-salum' => [
            'name'      => 'Arkam Ally Salum',
            'roles'     => ['Assistant Operation Manager'],
            'email'     => 'arkam.salum@shmaliklogistics.co.tz',
            'phone'     => '+255755637742',
            'idNo'      => '2506-2022-0007',
            'slug'      => 'arkam-ally-salum',
            'image'     => '/nfc_cards/arkam-ally-salum.jpeg',
            'backImage' => self::BACK_IMAGE,
        ],
        'salim-hilal-salim' => [
            'name'      => 'Salim Hilal Salim',
            'roles'     => ['Head of Accounts'],
            'email'     => 'salim.hila@shmaliklogistics.co.tz',
            'phone'     => '+255713133159',
            'idNo'      => '2506-2022-0002',
            'slug'      => 'salim-hilal-salim',
            'image'     => '/nfc_cards/salim-hilal-salim.jpeg',
            'backImage' => self::BACK_IMAGE,
        ],
        'saheel-abdulqadir' => [
            'name'      => 'Saheel Abdulqadir Gajjar',
            'roles'     => ['Assistant Accountant'],
            'email'     => 'saheel.gajjar@shmaliklogistics.co.tz',
            'phone'     => '+255692409999',
            'idNo'      => '2506-2022-0006',
            'slug'      => 'saheel-abdulqadir',
            'image'     => '/nfc_cards/saheel-abdulqadir.jpeg',
            'backImage' => self::BACK_IMAGE,
        ],
        'shabani-kipingu' => [
            'name'      => 'Shabani Bakari Kipingu',
            'roles'     => ['Assistant Accountant'],
            'email'     => 'shabani.kipingu@shmaliklogistics.co.tz',
            'phone'     => '+255710119189',
            'idNo'      => '2506-2022-0003',
            'slug'      => 'shabani-kipingu',
            'image'     => '/nfc_cards/shabani-kipingu.jpeg',
            'backImage' => self::BACK_IMAGE,
        ],
        'towfiq-seif' => [
            'name'      => 'Towfiq Seif Ramadhan',
            'roles'     => ['Head of IT'],
            'email'     => 'towfiq.seif@shmaliklogistics.co.tz',
            'phone'     => '+255789511234',
            'idNo'      => '2506-2022-0004',
            'slug'      => 'towfiq-seif',
            'image'     => '/nfc_cards/towfiq-seif.jpeg',
            'backImage' => self::BACK_IMAGE,
        ],
        'towfiq-seif-hr' => [
            'name'      => 'Towfiq Seif Ramadhan',
            'roles'     => ['Human Resource Manager'],
            'email'     => 'hr@shmaliklogistics.co.tz',
            'phone'     => '+255789511234',
            'idNo'      => '2506-2022-0004',
            'slug'      => 'towfiq-seif-hr',
            'image'     => '/nfc_cards/towfiq-seif-hr.jpeg',
            'backImage' => self::BACK_IMAGE,
        ],
        'athuman-omary-abdallah' => [
            'name'      => 'Athumani Omary Abdallah',
            'roles'     => ['Driver'],
            'email'     => 'athuman.abdallah@shmaliklogistics.co.tz', // create this account
            'phone'     => '+255676711174',
            'idNo'      => '2506-2022-0082',
            'slug'      => 'athuman-omary-abdallah',
            'image'     => '/nfc_cards/athuman-omary-abdallah.jpeg',
            'backImage' => self::BACK_IMAGE,
        ],
    ];

    public function show(string $slug)
    {
        $employee = self::$employees[$slug] ?? null;

        if (! $employee) {
            abort(404);
        }

        return Inertia::render('website/StaffCard', [
            'employee' => $employee,
        ]);
    }

    public function index()
    {
        return Inertia::render('website/Team', [
            'employees' => array_values(self::$employees),
        ]);
    }
}
