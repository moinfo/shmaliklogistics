<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class NfcController extends Controller
{
    private const BACK = '/nfc_cards/transmas-back.jpeg';
    private const INFO = 'info@transmaslogistics.co.tz';

    // Display metadata for the company; merged onto each record by decorate().
    private const COMPANY = [
        'name'     => 'Trans-Mas Logistics',
        'full'     => 'Trans-Mas Logistics Company Limited',
        'website'  => 'www.transmaslogistics.co.tz',
        'location' => 'P.O. Box 8, Handeni, Tanga',
    ];

    private static array $employees = [
        'ayman-mahsen' => [
            'name'      => 'Ayman Mahsen',
            'roles'     => ['Assistant Director'],
            'email'     => self::INFO,
            'phone'     => '+255779928882',
            'slug'      => 'ayman-mahsen',
            'image'     => '/nfc_cards/ayman-mahsen.jpeg',
            'backImage' => self::BACK,
        ],
        'maheer-ahmed' => [
            'name'      => 'Maheer Ahmed',
            'roles'     => ['Assistant Director'],
            'email'     => self::INFO,
            'phone'     => '+255695573434',
            'slug'      => 'maheer-ahmed',
            'image'     => '/nfc_cards/maheer-ahmed.jpeg',
            'backImage' => self::BACK,
        ],
        'nassor-seif-nassor' => [
            'name'      => 'Nassor Seif Nassor',
            'roles'     => ['Head of Account'],
            'email'     => self::INFO,
            'phone'     => '+255739502240',
            'slug'      => 'nassor-seif-nassor',
            'image'     => '/nfc_cards/nassor-seif-nassor.jpeg',
            'backImage' => self::BACK,
        ],
        'sleyman-ally-hemedi' => [
            'name'      => 'Sleyman Ally Hemedi',
            'roles'     => ['Accountant'],
            'email'     => self::INFO,
            'phone'     => '+255689689529',
            'slug'      => 'sleyman-ally-hemedi',
            'image'     => '/nfc_cards/sleyman-ally-hemedi.jpeg',
            'backImage' => self::BACK,
        ],
        'halfan-ally-salim' => [
            'name'      => 'Halfan Ally Salim',
            'roles'     => ['Supervisor'],
            'email'     => self::INFO,
            'phone'     => '+255624989909',
            'slug'      => 'halfan-ally-salim',
            'image'     => '/nfc_cards/halfan-ally-salim.jpeg',
            'backImage' => self::BACK,
        ],
        'yassir-arafat-suleyman' => [
            'name'      => 'Yassir Arafat Suleyman',
            'roles'     => ['Supervisor'],
            'email'     => self::INFO,
            'phone'     => '+255637413152',
            'slug'      => 'yassir-arafat-suleyman',
            'image'     => '/nfc_cards/yassir-arafat-suleyman.jpeg',
            'backImage' => self::BACK,
        ],
        'cosmas-agostino-chunika' => [
            'name'      => 'Cosmas Agostino Chunika',
            'roles'     => ['Mechanical Engineer'],
            'email'     => self::INFO,
            'phone'     => '+255773963644',
            'slug'      => 'cosmas-agostino-chunika',
            'image'     => '/nfc_cards/cosmas-agostino-chunika.jpeg',
            'backImage' => self::BACK,
        ],
        'hassani-abdallah-shaa' => [
            'name'      => 'Hassani Abdallah Shaa',
            'roles'     => ['Mechanical Engineer'],
            'email'     => self::INFO,
            'phone'     => '+255672409272',
            'slug'      => 'hassani-abdallah-shaa',
            'image'     => '/nfc_cards/hassani-abdallah-shaa.jpeg',
            'backImage' => self::BACK,
        ],
        'ramadhan-mustapha-abedi' => [
            'name'      => 'Ramadhan Mustapha Abedi',
            'roles'     => ['Mechanical Engineer'],
            'email'     => self::INFO,
            'phone'     => '+255748581808',
            'slug'      => 'ramadhan-mustapha-abedi',
            'image'     => '/nfc_cards/ramadhan-mustapha-abedi.jpeg',
            'backImage' => self::BACK,
        ],
        'fadhili-mussa-samatta' => [
            'name'      => 'Fadhili Mussa Samatta',
            'roles'     => ['Welder'],
            'email'     => self::INFO,
            'phone'     => '+255654347846',
            'slug'      => 'fadhili-mussa-samatta',
            'image'     => '/nfc_cards/fadhili-mussa-samatta.jpeg',
            'backImage' => self::BACK,
        ],
    ];

    /** Merge company display metadata onto the record. */
    private static function decorate(array $emp): array
    {
        return array_merge($emp, [
            'company'     => 'transmas',
            'companyName' => self::COMPANY['name'],
            'companyFull' => self::COMPANY['full'],
            'website'     => self::COMPANY['website'],
            'location'    => self::COMPANY['location'],
        ]);
    }

    public function show(string $slug)
    {
        $employee = self::$employees[$slug] ?? null;

        if (! $employee) {
            abort(404);
        }

        return Inertia::render('website/StaffCard', [
            'employee' => self::decorate($employee),
        ]);
    }

    public function index()
    {
        $employees = [];
        foreach (self::$employees as $emp) {
            $employees[] = self::decorate($emp);
        }

        return Inertia::render('website/Team', [
            'groups' => [[
                'code'      => 'transmas',
                'name'      => self::COMPANY['name'],
                'employees' => $employees,
            ]],
        ]);
    }
}
