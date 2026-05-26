<?php

namespace Database\Seeders;

use App\Models\Lease;
use App\Models\Property;
use App\Models\PropertyExpense;
use App\Models\PropertyUnit;
use App\Models\RentInvoice;
use App\Models\RentPayment;
use App\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RealEstateSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $isMySQL = DB::getDriverName() === 'mysql';
        $isMySQL ? DB::statement('SET FOREIGN_KEY_CHECKS=0') : DB::statement('PRAGMA foreign_keys = OFF');
        foreach (['rent_payments', 'rent_invoices', 'leases', 'property_units', 'property_expenses', 'tenants', 'properties'] as $t) {
            DB::table($t)->truncate();
        }
        $isMySQL ? DB::statement('SET FOREIGN_KEY_CHECKS=1') : DB::statement('PRAGMA foreign_keys = ON');

        $adminId = DB::table('users')->value('id');
        $today   = Carbon::create(2026, 5, 26);

        // Demo Real Estate Manager login (role created in migration). Recreated here
        // so it survives DatabaseSeeder truncating the users table.
        $reRoleId = DB::table('roles')->where('slug', 'real-estate-manager')->value('id');
        if ($reRoleId) {
            DB::table('users')->updateOrInsert(
                ['email' => 'realestate@shmalik.co.tz'],
                [
                    'name'       => 'Real Estate Manager',
                    'password'   => Hash::make('password'),
                    'role_id'    => $reRoleId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // ── Properties + units ──────────────────────────────────────────────
        // [code, name, type, status, ownership, address, region, district, purchase_price, acq_date, market_value]
        $propsData = [
            ['name' => 'Mikocheni Apartments',  'type' => 'apartment',  'status' => 'partially_occupied', 'ownership' => 'owned',   'address' => 'Mikocheni B, Plot 45',      'region' => 'Dar es Salaam', 'district' => 'Kinondoni', 'purchase_price' => 480000000, 'acquisition_date' => '2023-03-01', 'market_value' => 620000000],
            ['name' => 'Buza Family House',      'type' => 'room_block', 'status' => 'partially_occupied', 'ownership' => 'owned',   'address' => 'Buza, Temeke',              'region' => 'Dar es Salaam', 'district' => 'Temeke',    'purchase_price' => 95000000,  'acquisition_date' => '2021-08-15', 'market_value' => 140000000],
            ['name' => 'Kariakoo Shops',         'type' => 'commercial', 'status' => 'occupied',           'ownership' => 'owned',   'address' => 'Msimbazi St, Kariakoo',     'region' => 'Dar es Salaam', 'district' => 'Ilala',     'purchase_price' => 320000000, 'acquisition_date' => '2022-11-10', 'market_value' => 410000000],
            ['name' => 'Tegeta Rehab House',     'type' => 'house',      'status' => 'under_renovation',   'ownership' => 'owned',   'address' => 'Tegeta Nyuki',              'region' => 'Dar es Salaam', 'district' => 'Kinondoni', 'purchase_price' => 72000000,  'acquisition_date' => '2026-02-01', 'market_value' => 110000000],
            ['name' => 'Bagamoyo Plot',          'type' => 'farm',       'status' => 'available',          'ownership' => 'owned',   'address' => 'Bagamoyo Road, Km 28',      'region' => 'Pwani',         'district' => 'Bagamoyo',  'purchase_price' => 45000000,  'acquisition_date' => '2024-06-20', 'market_value' => 68000000],
        ];

        $properties = [];
        foreach ($propsData as $p) {
            $properties[] = Property::create(array_merge($p, [
                'code'              => Property::nextNumber(),
                'purchase_currency' => 'TZS',
                'created_by'        => $adminId,
            ]));
        }

        // units: property index => [ [unit_number, type, status, rent, cycle, beds, baths], ... ]
        $unitsData = [
            0 => [
                ['Apt A1', 'apartment', 'occupied', 650000, 'monthly', 3, 2],
                ['Apt A2', 'apartment', 'occupied', 650000, 'monthly', 3, 2],
                ['Apt B1', 'apartment', 'vacant',   550000, 'monthly', 2, 1],
                ['Apt B2', 'apartment', 'occupied', 550000, 'monthly', 2, 1],
            ],
            1 => [
                ['Room 1', 'room', 'occupied', 120000, 'monthly', 1, 0],
                ['Room 2', 'room', 'occupied', 120000, 'monthly', 1, 0],
                ['Room 3', 'room', 'vacant',   120000, 'monthly', 1, 0],
                ['Room 4', 'self_contained', 'occupied', 200000, 'monthly', 1, 1],
                ['Room 5', 'self_contained', 'vacant',   200000, 'monthly', 1, 1],
                ['Room 6', 'room', 'occupied', 120000, 'monthly', 1, 0],
            ],
            2 => [
                ['Shop 1', 'shop', 'occupied', 1800000, 'semi_annual', null, 1],
                ['Shop 2', 'shop', 'occupied', 1500000, 'annual',      null, 1],
                ['Shop 3', 'shop', 'occupied', 1200000, 'quarterly',   null, 1],
            ],
            3 => [
                ['Main House', 'whole_house', 'maintenance', 900000, 'semi_annual', 4, 3],
            ],
            4 => [
                ['Plot', 'plot', 'vacant', 350000, 'annual', null, null],
            ],
        ];

        $units = [];
        foreach ($unitsData as $pIdx => $rows) {
            foreach ($rows as [$num, $type, $status, $rent, $cycle, $beds, $baths]) {
                $units[] = PropertyUnit::create([
                    'property_id'           => $properties[$pIdx]->id,
                    'unit_number'           => $num,
                    'type'                  => $type,
                    'status'                => $status,
                    'bedrooms'              => $beds,
                    'bathrooms'             => $baths,
                    'rent_amount'           => $rent,
                    'rent_currency'         => 'TZS',
                    'default_billing_cycle' => $cycle,
                ]);
            }
        }

        // ── Tenants ─────────────────────────────────────────────────────────
        $tenantsData = [
            ['Juma Athumani',       'individual', '+255 713 200 101', '19880512100001', null],
            ['Neema Mwakalebela',   'individual', '+255 754 200 102', '19920304100002', null],
            ['Said Bakari',         'individual', '+255 765 200 103', '19850820100003', null],
            ['Grace Mushi',         'individual', '+255 786 200 104', '19900101100004', null],
            ['Azam Mini Market',    'company',    '+255 222 200 105', null,             'Azam Mini Market Ltd'],
            ['Faraja Pharmacy',     'company',    '+255 222 200 106', null,             'Faraja Pharmacy Co'],
            ['Mohamed Salehe',      'individual', '+255 713 200 107', '19870715100007', null],
            ['Tatu Electronics',    'company',    '+255 222 200 108', null,             'Tatu Electronics Ltd'],
        ];
        $tenants = [];
        foreach ($tenantsData as [$name, $type, $phone, $nida, $company]) {
            $tenants[] = Tenant::create([
                'code'         => Tenant::nextNumber(),
                'name'         => $name,
                'type'         => $type,
                'phone'        => $phone,
                'national_id'  => $nida,
                'company_name' => $company,
                'status'       => 'active',
                'address'      => 'Dar es Salaam, Tanzania',
                'created_by'   => $adminId,
            ]);
        }

        // ── Leases (assign tenants to occupied units) ───────────────────────
        // map: unit index => [tenant index, start_date, months_ago_start]
        $leaseMap = [
            0  => [0, '2025-09-01'],   // Apt A1
            1  => [1, '2025-11-01'],   // Apt A2
            3  => [2, '2026-01-01'],   // Apt B2
            4  => [3, '2025-06-01'],   // Room 1
            5  => [6, '2026-02-01'],   // Room 2
            7  => [3, '2025-10-01'],   // Room 4 (Grace also? use tenant 3) -> change to tenant 6
            9  => [0, '2025-08-01'],   // Room 6 (reuse) -> tenant 0 already has Apt; ok different lease
            10 => [4, '2025-07-01'],   // Shop 1 -> Azam (semi_annual)
            11 => [5, '2025-03-01'],   // Shop 2 -> Faraja (annual)
            12 => [7, '2026-03-01'],   // Shop 3 -> Tatu (quarterly)
        ];

        $leases = [];
        foreach ($leaseMap as $uIdx => [$tIdx, $start]) {
            $unit  = $units[$uIdx];
            $lease = Lease::create([
                'lease_number'     => Lease::nextNumber(),
                'property_unit_id' => $unit->id,
                'tenant_id'        => $tenants[$tIdx]->id,
                'start_date'       => $start,
                'end_date'         => Carbon::parse($start)->copy()->addYear()->toDateString(),
                'billing_cycle'    => $unit->default_billing_cycle,
                'rent_amount'      => $unit->rent_amount,
                'rent_currency'    => 'TZS',
                'deposit_amount'   => $unit->rent_amount,
                'payment_day'      => 5,
                'status'           => 'active',
                'created_by'       => $adminId,
            ]);
            $unit->update(['status' => 'occupied']);
            $leases[] = $lease;
        }

        // ── Rent invoices + payments ────────────────────────────────────────
        // Generate consecutive periods from lease start up to "today", mark older
        // ones paid, the latest partial/unpaid to create realistic arrears.
        $cycleMonths = ['monthly' => 1, 'quarterly' => 3, 'semi_annual' => 6, 'annual' => 12];
        foreach ($leases as $lease) {
            $months   = $cycleMonths[$lease->billing_cycle];
            $periodStart = Carbon::parse($lease->start_date);
            $invoices = [];
            $guard = 0;
            while ($periodStart->lte($today) && $guard < 36) {
                $guard++;
                $periodEnd = $periodStart->copy()->addMonthsNoOverflow($months)->subDay();
                $due       = $periodStart->copy()->day(min(5, $periodStart->daysInMonth));
                $invoices[] = RentInvoice::create([
                    'invoice_number'   => RentInvoice::nextNumber(),
                    'lease_id'         => $lease->id,
                    'property_unit_id' => $lease->property_unit_id,
                    'tenant_id'        => $lease->tenant_id,
                    'period_start'     => $periodStart->toDateString(),
                    'period_end'       => $periodEnd->toDateString(),
                    'due_date'         => $due->toDateString(),
                    'amount'           => $lease->rent_amount,
                    'currency'         => $lease->rent_currency,
                    'status'           => 'unpaid',
                    'created_by'       => $adminId,
                ]);
                $periodStart = $periodEnd->copy()->addDay();
            }

            // Pay all but the last invoice; last one: ~40% partial / 60% leave unpaid (overdue if past due)
            $count = count($invoices);
            foreach ($invoices as $i => $inv) {
                $isLast = $i === $count - 1;
                if (! $isLast) {
                    RentPayment::create([
                        'rent_invoice_id' => $inv->id,
                        'lease_id'        => $lease->id,
                        'amount'          => $inv->amount,
                        'currency'        => $inv->currency,
                        'payment_date'    => Carbon::parse($inv->due_date)->addDays(rand(0, 6))->toDateString(),
                        'payment_method'  => ['cash', 'bank_transfer', 'mobile_money'][rand(0, 2)],
                        'reference_number'=> 'RRC-' . strtoupper(substr(md5($inv->id), 0, 8)),
                        'created_by'      => $adminId,
                    ]);
                    $inv->recalcStatus();
                } else {
                    if (rand(0, 1) === 0) {
                        RentPayment::create([
                            'rent_invoice_id' => $inv->id,
                            'lease_id'        => $lease->id,
                            'amount'          => round($inv->amount * 0.4),
                            'currency'        => $inv->currency,
                            'payment_date'    => Carbon::parse($inv->due_date)->addDays(2)->toDateString(),
                            'payment_method'  => 'mobile_money',
                            'created_by'      => $adminId,
                        ]);
                        $inv->recalcStatus();
                    } elseif (Carbon::parse($inv->due_date)->lt($today)) {
                        $inv->update(['status' => 'overdue']);
                    }
                }
            }
        }

        // ── Property expenses (incl. the buy→renovate flow on Tegeta) ───────
        $expenses = [
            // Tegeta Rehab House (idx 3) — renovation phase
            [3, null, 'renovation', 'Roofing replacement & waterproofing', 8500000, '2026-02-15', 'acquisition_renov', 'Mbezi Hardware'],
            [3, null, 'renovation', 'Plumbing & bathroom refit',           4200000, '2026-03-02', 'renovation',        'Juma Plumbers'],
            [3, null, 'renovation', 'Electrical rewiring',                 3100000, '2026-03-20', 'renovation',        'Sparks Electrical'],
            [3, null, 'furnishing', 'Kitchen cabinets & tiling',           5600000, '2026-04-10', 'renovation',        'Tegeta Fundis'],
            [3, null, 'repair',     'Boundary wall repair',                1800000, '2026-04-25', 'renovation',        'BlockWorks'],
            // Operating expenses on income properties
            [0, null, 'utility',    'Water & common-area electricity (Apr)', 320000, '2026-04-30', 'operating', 'DAWASA / TANESCO'],
            [0, null, 'security',   'Security guard — monthly',              450000, '2026-05-01', 'operating', 'Ultimate Security'],
            [1, null, 'maintenance','Septic tank pumping',                   180000, '2026-03-18', 'operating', 'Clean Waste Co'],
            [2, null, 'tax',        'Property rates — Ilala MC',             900000, '2026-02-28', 'operating', 'Ilala Municipal'],
            [2, null, 'agent_fee',  'Letting agent commission',              250000, '2026-03-05', 'operating', 'Prime Estates'],
            [4, null, 'land_rent',  'Land rent — annual',                    140000, '2026-01-20', 'operating', 'Ardhi / Bagamoyo DC'],
        ];
        foreach ($expenses as [$pIdx, $uIdx, $cat, $desc, $amount, $date, $phase, $vendor]) {
            // normalise the one mislabeled phase value
            $phase = in_array($phase, ['acquisition', 'renovation', 'operating']) ? $phase : 'renovation';
            PropertyExpense::create([
                'property_id'      => $properties[$pIdx]->id,
                'property_unit_id' => $uIdx !== null ? $units[$uIdx]->id : null,
                'category'         => $cat,
                'description'      => $desc,
                'amount'           => $amount,
                'currency'         => 'TZS',
                'amount_tzs'       => $amount,
                'expense_date'     => $date,
                'phase'            => $phase,
                'vendor'           => $vendor,
                'created_by'       => $adminId,
            ]);
        }
    }
}