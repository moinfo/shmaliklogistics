<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ── Clear transactional tables (keep lookup tables seeded in migrations) ──
        $isMySQL = DB::getDriverName() === 'mysql';
        if ($isMySQL) {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        } else {
            DB::statement('PRAGMA foreign_keys = OFF');
        }

        foreach ([
            'appraisals',
            'job_applications','job_vacancies',
            'inventory_movements','purchase_order_items','purchase_orders',
            'inventory_items','inventory_categories',
            'suppliers',
            'fuel_logs',
            'cargo_status_logs',
            'portal_quote_requests',
            'leave_requests',
            'attendance_logs','attendance_devices',
            'payroll_slips','payroll_runs',
            'employee_advances','employee_loans',
            'employee_allowances','employee_deductions','employee_bank_details',
            'employees',
            'cargos',
            'payments','billing_items','billing_documents',
            'documents',
            'service_records',
            'expenses',
            'permits',
            'trips',
            'clients',
            'drivers',
            'vehicles',
            'users',
        ] as $t) {
            DB::table($t)->truncate();
        }

        if ($isMySQL) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        } else {
            DB::statement('PRAGMA foreign_keys = ON');
        }

        $now = now()->toDateTimeString();

        // ── Helpers ────────────────────────────────────────────────────────
        $paye = function (float $taxable): float {
            if ($taxable <= 270000)  return 0;
            if ($taxable <= 520000)  return ($taxable - 270000)  * 0.08;
            if ($taxable <= 760000)  return 20000  + ($taxable - 520000)  * 0.20;
            if ($taxable <= 1000000) return 68000  + ($taxable - 760000)  * 0.25;
            return 128000 + ($taxable - 1000000) * 0.30;
        };

        $nhif = function (float $gross): float {
            if ($gross < 1000000) return 0;
            if ($gross < 2000000) return 30000;
            if ($gross < 3000000) return 60000;
            return 90000;
        };

        $d = fn(string $y_m_d) => Carbon::createFromFormat('Y-m-d', $y_m_d)->toDateString();

        // ── Users ──────────────────────────────────────────────────────────
        $adminId = DB::table('users')->insertGetId([
            'name' => 'System Administrator', 'email' => 'admin@shmalik.co.tz',
            'password' => Hash::make('password'), 'role_id' => 1,
            'created_at' => $now, 'updated_at' => $now,
        ]);

        // ── Vehicles ───────────────────────────────────────────────────────
        $vData = [
            ['T 123 AAA','Flatbed',  'MAN',     'TGX 26.480','on_road',    30,2021],
            ['T 456 BBB','Container','Mercedes','Actros 2545','idle',       26,2020],
            ['T 789 CCC','Lowboy',   'Volvo',   'FH 500',    'on_road',    40,2022],
            ['T 321 DDD','Flatbed',  'Scania',  'R 500',     'at_border',  28,2019],
            ['T 654 EEE','Container','Isuzu',   'Giga CYH',  'idle',       20,2021],
            ['T 987 FFF','Reefer',   'Hino',    '700 Series','maintenance',22,2020],
            ['T 147 GGG','Flatbed',  'MAN',     'TGS 26.440','on_road',    32,2022],
            ['T 258 HHH','Tanker',   'Volvo',   'FM 450',    'idle',       28,2018],
            ['T 369 III','Container','Mercedes','Actros 2548','on_road',   25,2021],
            ['T 741 JJJ','Flatbed',  'Scania',  'P 410',     'idle',       30,2020],
            ['T 852 KKK','Lowboy',   'MAN',     'TGX 33.540','active',     45,2023],
            ['T 963 LLL','Reefer',   'Isuzu',   'Giga EXZ',  'on_road',   18,2022],
        ];
        $vehicleIds = [];
        foreach ($vData as [$plate,$type,$make,$model,$status,$payload,$year]) {
            $vehicleIds[] = DB::table('vehicles')->insertGetId([
                'plate' => $plate, 'type' => $type, 'make' => $make, 'model_name' => $model,
                'year' => $year, 'status' => $status, 'payload_tons' => $payload,
                'fuel_type' => 'Diesel', 'fuel_tank_capacity_l' => rand(500,800),
                'mileage_km' => rand(60000,280000),
                'insurance_expiry' => $d('2026-' . str_pad(rand(6,12),2,'0',STR_PAD_LEFT) . '-01'),
                'road_licence_expiry' => $d('2026-' . str_pad(rand(6,12),2,'0',STR_PAD_LEFT) . '-01'),
                'fitness_expiry' => $d('2026-' . str_pad(rand(6,12),2,'0',STR_PAD_LEFT) . '-01'),
                'owner_name' => 'SH Malik Logistics Ltd',
                'created_by' => $adminId, 'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        // ── Drivers ────────────────────────────────────────────────────────
        $dNames = [
            ['Juma Mwangi',     '+255 712 100 001'],
            ['Hassan Ally',     '+255 712 100 002'],
            ['Peter Odhiambo',  '+255 712 100 003'],
            ['Ali Mvungi',      '+255 712 100 004'],
            ['George Mwamba',   '+255 712 100 005'],
            ['David Kiprotich', '+255 712 100 006'],
            ['Mohamed Salim',   '+255 712 100 007'],
            ['Rashid Hamisi',   '+255 712 100 008'],
            ['Saidi Mzee',      '+255 712 100 009'],
            ['Frank Mwangi',    '+255 712 100 010'],
            ['John Masanja',    '+255 712 100 011'],
            ['Emmanuel Mchau',  '+255 712 100 012'],
        ];
        $driverIds = [];
        foreach ($dNames as $i => [$name, $phone]) {
            $did = DB::table('drivers')->insertGetId([
                'name' => $name, 'phone' => $phone, 'status' => 'active',
                'license_number' => 'DL' . str_pad($i+1,6,'0',STR_PAD_LEFT),
                'license_class'  => 'Class C',
                'license_expiry' => $d('2027-' . str_pad(rand(1,12),2,'0',STR_PAD_LEFT) . '-01'),
                'national_id'    => '198501' . str_pad($i+1,9,'0',STR_PAD_LEFT),
                'address'        => 'Dar es Salaam, Tanzania',
                'created_by'     => $adminId, 'created_at' => $now, 'updated_at' => $now,
            ]);
            $driverIds[] = $did;
            DB::table('vehicles')->where('id',$vehicleIds[$i])->update(['driver_id'=>$did]);
        }

        // ── Clients ────────────────────────────────────────────────────────
        $cData = [
            ['James Mkwawa',     'Dangote Cement Tanzania',    'procurement@dangote.co.tz', '022 211 0001'],
            ['Sarah Mwasimba',   'Tanzania Breweries Ltd',     'logistics@tbl.co.tz',       '022 211 0002'],
            ['Omar Rashidi',     'Azam Industries Ltd',        'supply@azam.co.tz',         '022 211 0003'],
            ['Linda Kimaro',     'CRDB Bank Plc',              'transport@crdb.co.tz',      '022 211 0004'],
            ['Emmanuel Ngowi',   'Vodacom Tanzania',           'logistics@vodacom.co.tz',   '022 211 0005'],
            ['Rehema Ally',      'Unilever Tanzania Ltd',      'supply@unilever.co.tz',     '022 211 0006'],
            ['Patrick Munuo',    'NMB Bank Plc',               'procurement@nmb.co.tz',     '022 211 0007'],
            ['Happiness Mbwana', 'Sumaria Group Tanzania',     'logistics@sumaria.co.tz',   '022 211 0008'],
            ['Vincent Nduka',    'Simba SC',                   'equipment@simba.co.tz',     '022 211 0009'],
            ['Amina Hassan',     'Export Trading Group',       'shipping@etg.co.tz',        '022 211 0010'],
        ];
        $clientIds = [];
        foreach ($cData as [$cname,$company,$email,$phone]) {
            $clientIds[] = DB::table('clients')->insertGetId([
                'name' => $cname, 'company_name' => $company, 'email' => $email,
                'phone' => '+255 ' . $phone, 'address' => 'Dar es Salaam, Tanzania',
                'status' => 'active', 'created_by' => $adminId,
                'created_at' => $now, 'updated_at' => $now,
            ]);
        }

        // ── Trips ──────────────────────────────────────────────────────────
        $routes = [
            ['Dar es Salaam','Lubumbashi, DRC',    7,  'Industrial Equipment'],
            ['Dar es Salaam','Lusaka, Zambia',      5,  'FMCG Goods'],
            ['Dar es Salaam','Lilongwe, Malawi',    4,  'Food Products'],
            ['Dar es Salaam','Maputo, Mozambique',  5,  'Construction Materials'],
            ['Dar es Salaam','Nairobi, Kenya',      3,  'Electronics'],
            ['Dar es Salaam','Kampala, Uganda',     6,  'Textiles'],
            ['Dar es Salaam','Harare, Zimbabwe',    8,  'Agricultural Produce'],
        ];
        $today    = Carbon::create(2026,4,30);
        $tripIds  = [];
        $seq      = 1;
        $date     = Carbon::create(2026,1,2);

        while ($date->lte($today)) {
            if ($date->isWeekend()) { $date->addDay(); continue; }
            if (rand(0,2) === 0)   { $date->addDay(); continue; } // ~2 trips every 3 days

            [$from,$to,$days,$cargoDesc] = $routes[array_rand($routes)];
            $driverRow  = $dNames[array_rand($dNames)];
            $vehicleRow = $vData[array_rand($vData)];
            $dep = $date->copy();
            $arr = $dep->copy()->addDays($days);

            if ($arr->lt($today)) {
                $status = rand(0,9) < 8 ? (rand(0,1) ? 'completed' : 'delivered') : 'cancelled';
            } elseif ($dep->lte($today)) {
                $status = ['loading','in_transit','in_transit','at_border','delivered'][rand(0,4)];
            } else {
                $status = 'planned';
            }

            $freight = rand(1500, 9000) * 1000;
            $fuel    = rand(500,  2500) * 1000;
            $allowance = rand(200,600) * 1000;
            $border  = rand(50,  400) * 1000;
            $other   = rand(50,  200) * 1000;

            $tripIds[] = DB::table('trips')->insertGetId([
                'trip_number'       => 'TRP-2026-' . str_pad($seq++,3,'0',STR_PAD_LEFT),
                'status'            => $status,
                'route_from'        => $from,
                'route_to'          => $to,
                'departure_date'    => $dep->toDateString(),
                'arrival_date'      => $arr->toDateString(),
                'driver_name'       => $driverRow[0],
                'vehicle_plate'     => $vehicleRow[0],
                'cargo_description' => $cargoDesc,
                'cargo_weight_tons' => rand(100,300) / 10.0,
                'freight_amount'    => $freight,
                'fuel_cost'         => $fuel,
                'driver_allowance'  => $allowance,
                'border_costs'      => $border,
                'other_costs'       => $other,
                'created_by'        => $adminId,
                'created_at'        => $dep->copy()->subDays(rand(1,3))->toDateTimeString(),
                'updated_at'        => $dep->copy()->subDays(rand(1,3))->toDateTimeString(),
            ]);

            $date->addDays(rand(1,3));
        }

        // ── Permits ────────────────────────────────────────────────────────
        $pTypes    = ['Transit Permit','Single Journey Permit','COMESA Permit','SADC Permit','Goods Vehicle Permit'];
        $countries = ['Tanzania','Zambia','Malawi','Mozambique','Kenya','Uganda','Zimbabwe','DRC'];
        for ($i = 0; $i < 28; $i++) {
            $iss = Carbon::create(2026, rand(1,4), rand(1,25));
            DB::table('permits')->insert([
                'trip_id'          => $i < count($tripIds) ? $tripIds[$i] : null,
                'vehicle_plate'    => $vData[array_rand($vData)][0],
                'permit_type'      => $pTypes[array_rand($pTypes)],
                'permit_number'    => 'PMT-2026-' . str_pad($i+1,4,'0',STR_PAD_LEFT),
                'issuing_country'  => $countries[array_rand($countries)],
                'issuing_authority'=> 'Road Transport Authority',
                'issue_date'       => $iss->toDateString(),
                'expiry_date'      => $iss->copy()->addMonths(rand(1,12))->toDateString(),
                'cost'             => rand(50,600) * 1000,
                'currency'         => rand(0,1) ? 'USD' : 'TZS',
                'status'           => rand(0,4) < 4 ? 'active' : 'expired',
                'created_by'       => $adminId,
                'created_at'       => $iss->toDateTimeString(),
                'updated_at'       => $iss->toDateTimeString(),
            ]);
        }

        // ── Expenses ───────────────────────────────────────────────────────
        $expCats = ['Fuel','Maintenance','Toll Fees','Driver Allowance','Border Fees','Office Supplies','Communication','Tyres & Parts','Insurance','Miscellaneous'];
        for ($i = 0; $i < 50; $i++) {
            $ed = Carbon::create(2026, rand(1,4), rand(1,28));
            DB::table('expenses')->insert([
                'trip_id'      => rand(0,1) && count($tripIds) ? $tripIds[array_rand($tripIds)] : null,
                'vehicle_plate'=> rand(0,1) ? $vData[array_rand($vData)][0] : null,
                'category'     => $expCats[array_rand($expCats)],
                'description'  => $expCats[array_rand($expCats)] . ' expense — ' . $ed->format('M Y'),
                'amount'       => rand(50,3000) * 1000,
                'currency'     => 'TZS',
                'expense_date' => $ed->toDateString(),
                'receipt_number'=> 'RCP-' . str_pad($i+1,4,'0',STR_PAD_LEFT),
                'created_by'   => $adminId,
                'created_at'   => $ed->toDateTimeString(),
                'updated_at'   => $ed->toDateTimeString(),
            ]);
        }

        // ── Service Records ────────────────────────────────────────────────
        $svcTypes = ['Oil Change','Tyre Rotation','Brake Service','Engine Tune-Up','Transmission Service','Full Inspection','Battery Replacement','Air Filter','Coolant Flush','Suspension Service'];
        foreach ($vehicleIds as $j => $vid) {
            $svcCount = rand(1,3);
            for ($k = 0; $k < $svcCount; $k++) {
                $sd = Carbon::create(2026, rand(1,4), rand(1,25));
                DB::table('service_records')->insert([
                    'vehicle_id'     => $vid,
                    'service_type'   => $svcTypes[array_rand($svcTypes)],
                    'service_date'   => $sd->toDateString(),
                    'mileage_km'     => rand(60000,280000),
                    'workshop_name'  => ['Dar Auto Centre','Mwanzo Garage','TZ Truck Service','Capital Motors'][rand(0,3)],
                    'description'    => 'Routine service and inspection',
                    'cost'           => rand(100,1500) * 1000,
                    'currency'       => 'TZS',
                    'next_service_date' => $sd->copy()->addMonths(3)->toDateString(),
                    'created_by'     => $adminId,
                    'created_at'     => $sd->toDateTimeString(),
                    'updated_at'     => $sd->toDateTimeString(),
                ]);
            }
        }

        // ── Billing Documents ──────────────────────────────────────────────
        $billingItems = [
            ['Freight Transportation Services','Trip',1],
            ['Border Clearance & Documentation','Service',1],
            ['Fuel Surcharge','Service',1],
            ['Insurance — Cargo in Transit','Policy',1],
            ['Loading & Offloading','Service',1],
        ];
        $billingDocIds = ['quote'=>[], 'proforma'=>[], 'invoice'=>[]];
        $docSeq = ['QTE'=>1,'PRF'=>1,'INV'=>1];

        for ($b = 0; $b < 35; $b++) {
            $type     = ['quote','quote','proforma','proforma','invoice','invoice','invoice'][rand(0,6)];
            $prefix   = ['quote'=>'QTE','proforma'=>'PRF','invoice'=>'INV'][$type];
            $status   = match($type) {
                'quote'    => ['draft','sent','accepted','rejected'][rand(0,3)],
                'proforma' => ['draft','sent','accepted'][rand(0,2)],
                'invoice'  => ['draft','sent','partial','paid','overdue'][rand(0,4)],
            };
            $issDate  = Carbon::create(2026, rand(1,4), rand(1,25));
            $clientId = $clientIds[array_rand($clientIds)];
            $tripId   = rand(0,1) && count($tripIds) ? $tripIds[array_rand($tripIds)] : null;
            $currency = rand(0,2) < 2 ? 'USD' : 'TZS';
            $vatRate  = 18;
            $subtotal = 0;

            $bdId = DB::table('billing_documents')->insertGetId([
                'type'           => $type,
                'document_number'=> $prefix . '-2026-' . str_pad($docSeq[$prefix]++,4,'0',STR_PAD_LEFT),
                'client_id'      => $clientId,
                'trip_id'        => $tripId,
                'status'         => $status,
                'issue_date'     => $issDate->toDateString(),
                'due_date'       => $issDate->copy()->addDays(30)->toDateString(),
                'valid_until'    => $issDate->copy()->addDays(14)->toDateString(),
                'currency'       => $currency,
                'subtotal'       => 0,
                'tax_rate'       => $vatRate,
                'tax_amount'     => 0,
                'total'          => 0,
                'discount_amount'=> 0,
                'notes'          => 'Thank you for choosing SH Malik Logistics.',
                'terms_conditions'=> 'Payment due within 30 days. Late payment attracts 2% monthly interest.',
                'created_by'     => $adminId,
                'created_at'     => $issDate->toDateTimeString(),
                'updated_at'     => $issDate->toDateTimeString(),
            ]);

            $itemCount = rand(2,4);
            for ($ii = 0; $ii < $itemCount; $ii++) {
                [$desc,$unit,$qty] = $billingItems[$ii % count($billingItems)];
                $unitPrice = $currency === 'USD' ? rand(500,5000) : rand(500000,5000000);
                $lineTotal = $qty * $unitPrice;
                $subtotal += $lineTotal;
                DB::table('billing_items')->insert([
                    'billing_document_id' => $bdId,
                    'description' => $desc,
                    'quantity'    => $qty,
                    'unit'        => $unit,
                    'unit_price'  => $unitPrice,
                    'total'       => $lineTotal,
                    'sort_order'  => $ii + 1,
                    'created_at'  => $issDate->toDateTimeString(),
                    'updated_at'  => $issDate->toDateTimeString(),
                ]);
            }

            $taxAmt = round($subtotal * $vatRate / 100);
            $total  = $subtotal + $taxAmt;
            DB::table('billing_documents')->where('id',$bdId)->update([
                'subtotal'   => $subtotal,
                'tax_amount' => $taxAmt,
                'total'      => $total,
            ]);

            $billingDocIds[$type][] = ['id'=>$bdId,'total'=>$total,'date'=>$issDate];

            // Add payment for paid invoices
            if ($type === 'invoice' && in_array($status,['paid','partial'])) {
                $payAmt = $status === 'paid' ? $total : round($total * 0.5);
                DB::table('payments')->insert([
                    'billing_document_id' => $bdId,
                    'amount'              => $payAmt,
                    'payment_date'        => $issDate->copy()->addDays(rand(5,25))->toDateString(),
                    'payment_method'      => ['bank_transfer','cheque','mobile_money'][rand(0,2)],
                    'reference_number'    => 'TXN-' . strtoupper(substr(md5($bdId),0,8)),
                    'notes'               => 'Payment received via bank transfer.',
                    'created_by'          => $adminId,
                    'created_at'          => $now,
                    'updated_at'          => $now,
                ]);
            }
        }

        // ── GPS positions for on-road vehicles ────────────────────────────
        $gpsSpots = [
            [-8.9333,  33.4667, 'Mbeya Weighbridge'],
            [-9.3667,  32.8833, 'Tunduma Border, Tanzania'],
            [-9.4000,  32.9000, 'Nakonde Border, Zambia'],
            [-11.8067, 28.6483, 'Kitwe, Zambia'],
            [-4.0435,  39.6682, 'Mombasa Port, Kenya'],
            [-3.3869,  36.6830, 'Arusha Bypass'],
            [-6.7924,  39.2083, 'Dar es Salaam Port'],
        ];
        $gpsIdx = 0;
        foreach ($vData as $vi => [, , , , $vstatus]) {
            if (in_array($vstatus, ['on_road','at_border']) && $gpsIdx < count($gpsSpots)) {
                [$lat, $lng, $locName] = $gpsSpots[$gpsIdx++];
                DB::table('vehicles')->where('id', $vehicleIds[$vi])->update([
                    'gps_lat'           => $lat,
                    'gps_lng'           => $lng,
                    'gps_location_name' => $locName,
                    'gps_last_seen'     => Carbon::create(2026,4,30,rand(6,22),rand(0,59))->toDateTimeString(),
                ]);
            }
        }

        // ── Cargo ──────────────────────────────────────────────────────────
        $cargoTypes    = ['general','refrigerated','hazardous','bulk','oversized','perishable'];
        $packingTypes  = ['pallets','loose','crates','drums','bags','containers'];
        $cargoDescs    = ['Cement bags 50kg','Beer & beverages','Cooking oil 20L','Machinery parts','FMCG goods','Construction steel','Textiles & clothing','Agricultural produce','Chemical drums','Electronics'];
        $cargoCurrencies = ['USD','TZS'];
        for ($c = 0; $c < 30; $c++) {
            $cd = Carbon::create(2026, rand(1,4), rand(1,28));
            DB::table('cargos')->insert([
                'cargo_number'    => 'CGO-2026-' . str_pad($c+1,4,'0',STR_PAD_LEFT),
                'trip_id'         => rand(0,1) && count($tripIds) ? $tripIds[array_rand($tripIds)] : null,
                'client_id'       => rand(0,1) ? $clientIds[array_rand($clientIds)] : null,
                'description'     => $cargoDescs[array_rand($cargoDescs)],
                'type'            => $cargoTypes[array_rand($cargoTypes)],
                'weight_kg'       => rand(500,25000),
                'volume_m3'       => rand(5,80),
                'pieces'          => rand(1,500),
                'packing_type'    => $packingTypes[array_rand($packingTypes)],
                'origin'          => 'Dar es Salaam, Tanzania',
                'destination'     => ['Lubumbashi, DRC','Lusaka, Zambia','Lilongwe, Malawi','Maputo, Mozambique','Nairobi, Kenya'][rand(0,4)],
                'consignee_name'  => $cData[array_rand($cData)][1],
                'consignee_contact'=> '+255 7' . rand(10,99) . ' ' . rand(100,999) . ' ' . rand(100,999),
                'status'          => ['registered','loaded','in_transit','in_transit','at_border','cleared','delivered','delivered'][rand(0,7)],
                'declared_value'  => rand(10,500) * 1000,
                'currency'        => $cargoCurrencies[rand(0,1)],
                'created_by'      => $adminId,
                'created_at'      => $cd->toDateTimeString(),
                'updated_at'      => $cd->toDateTimeString(),
            ]);
        }

        // ── Employees ──────────────────────────────────────────────────────
        $empData = [
            // [name, dept, position, salary, hire_date_offset_months, emp_num]
            ['Mwanajuma Ramadhani', 'Management',    'General Manager',        3500000, 36, 'EMP-001'],
            ['Ahmed Khalid',        'Finance',       'Finance Manager',        2800000, 30, 'EMP-002'],
            ['Grace Makundi',       'Administration','HR Manager',             1800000, 24, 'EMP-003'],
            ['Peter Mshana',        'Operations',    'Operations Manager',     2200000, 28, 'EMP-004'],
            ['Ali Hassan',          'Logistics',     'Senior Driver',          800000,  18, 'EMP-005'],
            ['Fatuma Juma',         'Finance',       'Senior Accountant',      1400000, 20, 'EMP-006'],
            ['David Omondi',        'Administration','IT Officer',             1500000, 15, 'EMP-007'],
            ['Mele Nkosi',          'Administration','Admin Officer',          950000,  12, 'EMP-008'],
            ['John Mtembei',        'Mechanical',    'Lead Mechanic',          900000,  22, 'EMP-009'],
            ['Amina Rashid',        'Finance',       'Sales & Marketing Officer',1100000,10,'EMP-010'],
            ['Bernard Owino',       'Security',      'Security Supervisor',    750000,  14, 'EMP-011'],
            ['Stella Kimaro',       'Administration','Office Assistant',       600000,  8,  'EMP-012'],
            ['Hassan Ngowi',        'Logistics',     'Transport Coordinator',  1050000, 16, 'EMP-013'],
            ['Mary Kisanga',        'Management',    'Legal & Compliance Officer',1600000,25,'EMP-014'],
            ['Bakari Salehe',       'Logistics',     'Logistics Officer',      1000000, 18, 'EMP-015'],
        ];
        $employeeIds = [];
        foreach ($empData as [$ename,$dept,$position,$salary,$hireMonths,$empNum]) {
            $hireDate = Carbon::create(2026,1,1)->subMonths($hireMonths)->toDateString();
            $employeeIds[] = DB::table('employees')->insertGetId([
                'employee_number' => $empNum,
                'name'            => $ename,
                'department'      => $dept,
                'position'        => $position,
                'phone'           => '+255 7' . rand(10,99) . ' ' . rand(100,999) . ' ' . rand(100,999),
                'email'           => strtolower(str_replace(' ','.',explode(' ',$ename)[0])) . '@shmaliklogistics.co.tz',
                'national_id'     => '198' . rand(0,9) . rand(0,9) . '01' . str_pad(rand(1,999999),9,'0',STR_PAD_LEFT),
                'address'         => 'Dar es Salaam, Tanzania',
                'hire_date'       => $hireDate,
                'birth_date'      => Carbon::create(1990, rand(1,12), rand(1,28))->toDateString(),
                'salary'          => $salary,
                'salary_currency' => 'TZS',
                'status'          => 'active',
                'created_by'      => $adminId,
                'created_at'      => $now,
                'updated_at'      => $now,
            ]);
        }

        // ── Employee Bank Details ──────────────────────────────────────────
        $banks = ['CRDB Bank','NMB Bank','Stanbic Bank','NBC Bank','Equity Bank','DTB Bank','I&M Bank'];
        foreach ($employeeIds as $idx => $eid) {
            DB::table('employee_bank_details')->insert([
                'employee_id'    => $eid,
                'bank_name'      => $banks[array_rand($banks)],
                'account_number' => rand(10000000,99999999),
                'branch'         => 'Dar es Salaam Main Branch',
                'account_name'   => $empData[$idx][0],
                'is_primary'     => true,
                'created_at'     => $now,
                'updated_at'     => $now,
            ]);
        }

        // ── Employee Allowances ────────────────────────────────────────────
        // Tier by salary: Managers(≥2M)=450K, Senior(≥1.2M)=300K, Officers=230K, Others=160K
        $allowanceTiers = [
            [3500000, 300000, 150000],  // 0  GM
            [2800000, 300000, 150000],  // 1  Finance Mgr
            [1800000, 200000, 100000],  // 2  HR Mgr
            [2200000, 300000, 150000],  // 3  Ops Mgr
            [800000,  150000, 80000],   // 4  Driver
            [1400000, 200000, 100000],  // 5  Accountant
            [1500000, 200000, 100000],  // 6  IT
            [950000,  150000, 80000],   // 7  Admin
            [900000,  150000, 80000],   // 8  Mechanic
            [1100000, 150000, 80000],   // 9  Sales
            [750000,  100000, 60000],   // 10 Security
            [600000,  100000, 60000],   // 11 Office Asst
            [1050000, 150000, 80000],   // 12 Transport Coord
            [1600000, 200000, 100000],  // 13 Legal
            [1000000, 150000, 80000],   // 14 Logistics
        ];
        foreach ($employeeIds as $idx => $eid) {
            [,$housing,$transport] = $allowanceTiers[$idx];
            DB::table('employee_allowances')->insert([
                ['employee_id'=>$eid,'name'=>'Housing Allowance',  'type'=>'FIXED','amount'=>$housing,  'is_taxable'=>false,'is_active'=>true,'created_at'=>$now,'updated_at'=>$now],
                ['employee_id'=>$eid,'name'=>'Transport Allowance','type'=>'FIXED','amount'=>$transport,'is_taxable'=>false,'is_active'=>true,'created_at'=>$now,'updated_at'=>$now],
            ]);
        }

        // ── Employee Deductions (HESLB) ────────────────────────────────────
        // HESLB deduction type id = 5 (from migration seeding order)
        $heslbTypeId = DB::table('deduction_types')->where('abbreviation','HESLB')->value('id');
        $heslbEmp = [
            0 => [30000,  'HESLB-2026-001'],  // GM
            1 => [40000,  'HESLB-2026-002'],  // Finance Mgr
            2 => [25000,  'HESLB-2026-003'],  // HR Mgr
            5 => [20000,  'HESLB-2026-004'],  // Accountant
            6 => [25000,  'HESLB-2026-005'],  // IT
            13=> [30000,  'HESLB-2026-006'],  // Legal
        ];
        foreach ($heslbEmp as $idx => [$amount,$memberNum]) {
            DB::table('employee_deductions')->insert([
                'employee_id'       => $employeeIds[$idx],
                'deduction_type_id' => $heslbTypeId,
                'membership_number' => $memberNum,
                'fixed_amount'      => $amount,
                'is_active'         => true,
                'created_at'        => $now,
                'updated_at'        => $now,
            ]);
        }

        // ── Payroll: 4 runs (Jan–Apr) ──────────────────────────────────────
        // Pre-define which employees have loans/advances per month
        $loanMonthlyAmt = [8=>100000, 11=>80000];   // emp idx => installment
        $advanceByMonth = [
            2 => [4=>400000],   // Feb: emp idx 4 (Ali Hassan)
            3 => [7=>300000],   // Mar: emp idx 7 (Mele Nkosi)
        ];

        foreach ([1,2,3,4] as $runSeq => $month) {
            $runId = DB::table('payroll_runs')->insertGetId([
                'document_number' => "PRL/2026/{$runSeq}",
                'payroll_number'  => strval(mktime(0,0,0,$month,28,2026)),
                'year'  => 2026,
                'month' => $month,
                'status'=> $month < 4 ? 'closed' : 'processed',
                'notes' => 'Payroll for ' . Carbon::create(2026,$month,1)->format('F Y'),
                'created_by' => $adminId,
                'created_at' => Carbon::create(2026,$month,28)->toDateTimeString(),
                'updated_at' => Carbon::create(2026,$month,28)->toDateTimeString(),
            ]);

            foreach ($employeeIds as $idx => $eid) {
                [$ename,$dept,$pos,$basicSalary] = $empData[$idx];
                [,$housing,$transport] = $allowanceTiers[$idx];
                $allowances = $housing + $transport;
                $gross      = $basicSalary + $allowances;

                $nssfEmp  = round($gross * 0.10);
                $nssfEmpr = round($gross * 0.10);
                $taxable  = $gross - $nssfEmp;
                $payeTax  = round($paye($taxable));
                $nhifAmt  = $nhif($gross);
                $heslbAmt = isset($heslbEmp[$idx]) ? $heslbEmp[$idx][0] : 0;
                $advAmt   = $advanceByMonth[$month][$idx] ?? 0;
                $loanAmt  = $loanMonthlyAmt[$idx] ?? 0;
                $sdlEmpr  = round($gross * 0.045);
                $wcfEmpr  = round($gross * 0.005);

                $totalDed = $nssfEmp + $payeTax + $nhifAmt + $heslbAmt + $advAmt + $loanAmt;
                $netSal   = $gross - $totalDed;
                $totEmpCost = $gross + $nssfEmpr + $sdlEmpr + $wcfEmpr;

                // Running loan balance (simple: starts at principal - installments paid)
                $loanBalance = 0;
                if (isset($loanMonthlyAmt[$idx])) {
                    $principal     = $idx === 8 ? 2000000 : 1200000;
                    $monthsPaid    = $runSeq; // 1-indexed run (Jan=1, Apr=4)
                    $loanBalance   = max(0, $principal - ($loanMonthlyAmt[$idx] * $monthsPaid));
                }

                DB::table('payroll_slips')->insert([
                    'payroll_run_id'  => $runId,
                    'employee_id'     => $eid,
                    'basic_salary'    => $basicSalary,
                    'allowances'      => $allowances,
                    'overtime'        => 0,
                    'gross_salary'    => $gross,
                    'paye'            => $payeTax,
                    'nssf_employee'   => $nssfEmp,
                    'nhif_employee'   => $nhifAmt,
                    'heslb'           => $heslbAmt,
                    'other_deductions'=> 0,
                    'advance_deduction'=> $advAmt,
                    'loan_deduction'  => $loanAmt,
                    'loan_balance'    => $loanBalance,
                    'adjustment'      => 0,
                    'total_deductions'=> $totalDed,
                    'net_salary'      => $netSal,
                    'nssf_employer'   => $nssfEmpr,
                    'sdl_employer'    => $sdlEmpr,
                    'wcf_employer'    => $wcfEmpr,
                    'total_employer_cost' => $totEmpCost,
                    'created_at'      => Carbon::create(2026,$month,28)->toDateTimeString(),
                    'updated_at'      => Carbon::create(2026,$month,28)->toDateTimeString(),
                ]);
            }
        }

        // ── Employee Advances ──────────────────────────────────────────────
        $advanceRows = [
            [4,  400000,'Emergency medical expenses',  '2026-01-20','2026-02-01','approved', $adminId],
            [7,  300000,'School fees payment',         '2026-02-10','2026-03-01','approved', $adminId],
            [11, 200000,'House rent deposit',          '2026-03-05','2026-04-01','approved', $adminId],
            [1,  500000,'Vehicle repair',              '2026-01-15',null,        'approved', $adminId],
            [9,  250000,'Medical expenses',            '2026-02-25',null,        'pending',  null],
            [2,  350000,'School fees',                 '2026-04-01',null,        'rejected', $adminId],
        ];
        foreach ($advanceRows as [$empIdx,$amount,$purpose,$reqDate,$dedMonth,$status,$approvedBy]) {
            DB::table('employee_advances')->insert([
                'employee_id'    => $employeeIds[$empIdx],
                'amount'         => $amount,
                'purpose'        => $purpose,
                'requested_date' => $reqDate,
                'deduction_month'=> $dedMonth,
                'status'         => $status,
                'approved_by'    => $approvedBy,
                'created_by'     => $adminId,
                'created_at'     => $now,
                'updated_at'     => $now,
            ]);
        }

        // ── Employee Loans ─────────────────────────────────────────────────
        $loanRows = [
            [8,  2000000, 100000, 20, '2026-01-01','active',  'Home improvement loan',  $adminId],
            [11, 1200000, 80000,  15, '2026-01-01','active',  'Education loan',          $adminId],
            [4,  1500000, 125000, 12, '2026-02-01','active',  'Business capital',        $adminId],
            [6,  3000000, 150000, 20, '2026-03-01','pending', 'Land purchase',           null],
        ];
        foreach ($loanRows as $li => [$empIdx,$principal,$installment,$months,$startDate,$status,$purpose,$approvedBy]) {
            $start = Carbon::createFromFormat('Y-m-d',$startDate);
            DB::table('employee_loans')->insert([
                'employee_id'        => $employeeIds[$empIdx],
                'loan_number'        => 'LN-2026-' . str_pad($li+1,3,'0',STR_PAD_LEFT),
                'principal'          => $principal,
                'balance_remaining'  => $status === 'active' ? $principal - ($installment * 2) : $principal,
                'monthly_installment'=> $installment,
                'total_months'       => $months,
                'months_paid'        => $status === 'active' ? 2 : 0,
                'start_date'         => $startDate,
                'expected_end_date'  => $start->copy()->addMonths($months)->toDateString(),
                'purpose'            => $purpose,
                'status'             => $status,
                'approved_by'        => $approvedBy,
                'created_by'         => $adminId,
                'created_at'         => $now,
                'updated_at'         => $now,
            ]);
        }

        // ── Attendance Device ──────────────────────────────────────────────
        $deviceId = DB::table('attendance_devices')->insertGetId([
            'name'           => 'Main Office ZK Device',
            'ip_address'     => '192.168.1.100',
            'port'           => 4370,
            'serial_number'  => 'ZK20241015001',
            'location'       => 'Main Office — Ground Floor',
            'model'          => 'ZKTeco F18',
            'firmware'       => 'Ver 6.60 Sep 28 2023',
            'is_active'      => true,
            'last_sync_at'   => Carbon::create(2026,4,30,8,0,0)->toDateTimeString(),
            'last_sync_count'=> 1840,
            'created_at'     => $now,
            'updated_at'     => $now,
        ]);

        // ── Attendance Logs (Jan–Apr, working days) ────────────────────────
        $logs  = [];
        $start = Carbon::create(2026,1,2);
        $end   = Carbon::create(2026,4,30);
        $cur   = $start->copy();
        $logNow = $now;

        while ($cur->lte($end)) {
            if ($cur->isWeekend()) { $cur->addDay(); continue; }

            foreach ($employeeIds as $zi => $eid) {
                if (rand(0,19) === 0) { continue; } // ~5% absent rate

                $inH  = rand(7,8);
                $inM  = rand(15,59);
                $outH = rand(17,18);
                $outM = rand(0,45);

                $inTime  = $cur->copy()->setTime($inH,  $inM,  0);
                $outTime = $cur->copy()->setTime($outH, $outM, 0);

                $logs[] = [
                    'employee_id'    => $eid,
                    'device_id'      => $deviceId,
                    'punch_time'     => $inTime->toDateTimeString(),
                    'punch_type'     => 'in',
                    'source'         => 'device',
                    'device_user_id' => str_pad($zi+1,4,'0',STR_PAD_LEFT),
                    'verify_type'    => 'fingerprint',
                    'created_at'     => $logNow,
                    'updated_at'     => $logNow,
                ];
                $logs[] = [
                    'employee_id'    => $eid,
                    'device_id'      => $deviceId,
                    'punch_time'     => $outTime->toDateTimeString(),
                    'punch_type'     => 'out',
                    'source'         => 'device',
                    'device_user_id' => str_pad($zi+1,4,'0',STR_PAD_LEFT),
                    'verify_type'    => 'fingerprint',
                    'created_at'     => $logNow,
                    'updated_at'     => $logNow,
                ];

                // Batch insert every 500 rows
                if (count($logs) >= 500) {
                    DB::table('attendance_logs')->insert($logs);
                    $logs = [];
                }
            }
            $cur->addDay();
        }
        if (count($logs)) {
            DB::table('attendance_logs')->insert($logs);
        }

        // ── Suppliers ──────────────────────────────────────────────────────
        $supplierData = [
            ['Puma Energy Tanzania',           'Ahmed Osman',    '+255 22 211 5000', 'orders@puma.co.tz',         'fuel',        '123-456-789-A'],
            ['Total Energies Tanzania',        'Grace Mwangi',   '+255 22 212 0001', 'supply@totalenergies.co.tz','fuel',        '234-567-890-B'],
            ['Toyota Tanzania Ltd',            'James Kimaro',   '+255 22 286 0600', 'parts@toyota.co.tz',        'spare_parts',  '345-678-901-C'],
            ['NBC Auto Parts',                 'Peter Makoni',   '+255 22 219 0100', 'sales@nbcauto.co.tz',       'spare_parts',  '456-789-012-D'],
            ['Bridgestone Tanzania',           'Sarah Ally',     '+255 22 260 0300', 'tyres@bridgestone.co.tz',   'spare_parts',  '567-890-123-E'],
            ['Staples East Africa Ltd',        'Linda Hassan',   '+255 22 215 0200', 'orders@staples.co.tz',      'office',       '678-901-234-F'],
            ['Office World Tanzania',          'Emmanuel Ngowi', '+255 22 218 0400', 'sales@officeworld.co.tz',   'office',       '789-012-345-G'],
        ];
        $supplierIds = [];
        foreach ($supplierData as [$name,$contact,$phone,$email,$cat,$tin]) {
            $supplierIds[] = DB::table('suppliers')->insertGetId([
                'name'         => $name,
                'contact_name' => $contact,
                'phone'        => $phone,
                'email'        => $email,
                'address'      => 'Dar es Salaam, Tanzania',
                'tin_number'   => $tin,
                'category'     => $cat,
                'is_active'    => true,
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);
        }

        // ── Inventory Categories & Items ───────────────────────────────────
        $catIds = [];
        foreach ([
            ['Fuel & Lubricants',  '#F59E0B'],
            ['Spare Parts',        '#2196F3'],
            ['Tyres',              '#10B981'],
            ['Office Supplies',    '#A855F7'],
            ['Safety Equipment',   '#EF4444'],
        ] as [$cname, $ccolor]) {
            $catIds[] = DB::table('inventory_categories')->insertGetId([
                'name'       => $cname,
                'color'      => $ccolor,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // [name, part_number, unit, category_idx, current_stock, reorder_level, unit_cost, location]
        $itemData = [
            ['Diesel Fuel',              'FUEL-DSL-001',  'litre',   0, 15000, 5000,    2800,    'Fuel Tank A'],
            ['Engine Oil 15W-40 (20L)',  'OIL-15W40-20',  'drum',    0, 42,    10,      85000,   'Store Room 1'],
            ['Gear Box Oil 80W-90',      'OIL-80W90-4',   'drum',    0, 18,    5,       45000,   'Store Room 1'],
            ['Grease Cartridge',         'GRS-CART-001',  'unit',    1, 120,   30,      8500,    'Store Room 1'],
            ['Air Filter — MAN TGX',     'AFT-MAN-001',   'unit',    1, 8,     4,       65000,   'Shelf A1'],
            ['Oil Filter — Scania R',    'OFT-SCA-001',   'unit',    1, 6,     4,       42000,   'Shelf A2'],
            ['Brake Pad Set — Front',    'BRK-FRT-001',   'set',     1, 5,     3,       120000,  'Shelf B1'],
            ['Fan Belt — Universal',     'FBT-UNV-001',   'unit',    1, 12,    5,       18000,   'Shelf B2'],
            ['Fuel Filter',             'FFT-GEN-001',   'unit',    1, 15,    6,       28000,   'Shelf B3'],
            ['Tyre 12.00R20 (Truck)',    'TYR-1200R20',   'unit',    2, 24,    8,       380000,  'Tyre Bay'],
            ['Tyre 295/80R22.5',        'TYR-29580R',    'unit',    2, 16,    6,       420000,  'Tyre Bay'],
            ['Tyre Repair Kit',         'TYR-RPK-001',   'kit',     2, 10,    4,       45000,   'Tyre Bay'],
            ['A4 Paper (500 sheets)',    'OFC-A4-500',    'ream',    3, 80,    20,      12000,   'Office Store'],
            ['Printer Cartridge — HP',  'OFC-HP-INK',    'unit',    3, 6,     3,       55000,   'Office Store'],
            ['Safety Vest (Hi-Vis)',     'SFT-VEST-001',  'unit',    4, 30,    10,      18000,   'Safety Store'],
            ['Fire Extinguisher 9kg',   'SFT-FEXT-9KG',  'unit',    4, 12,    4,       85000,   'Safety Store'],
        ];
        $inventoryItemIds = [];
        foreach ($itemData as [$iname,$partNum,$unit,$catIdx,$stock,$reorder,$cost,$location]) {
            $inventoryItemIds[] = DB::table('inventory_items')->insertGetId([
                'category_id'  => $catIds[$catIdx],
                'name'         => $iname,
                'part_number'  => $partNum,
                'unit'         => $unit,
                'current_stock'=> $stock,
                'reorder_level'=> $reorder,
                'unit_cost'    => $cost,
                'location'     => $location,
                'is_active'    => true,
                'created_by'   => $adminId,
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);
        }

        // Opening balance movements for each item
        foreach ($inventoryItemIds as $zi => $iid) {
            [$iname,,$unit,,$stock,,$cost] = $itemData[$zi];
            DB::table('inventory_movements')->insert([
                'item_id'      => $iid,
                'type'         => 'in',
                'quantity'     => $stock,
                'unit_cost'    => $cost,
                'balance_after'=> $stock,
                'reference'    => 'Opening Balance',
                'notes'        => 'Initial stock entry',
                'created_by'   => $adminId,
                'created_at'   => Carbon::create(2026,1,1)->toDateTimeString(),
                'updated_at'   => Carbon::create(2026,1,1)->toDateTimeString(),
            ]);
        }

        // Some stock-out movements (fuel usage, parts used)
        $stockOuts = [
            [0, 8000, 'TRP-2026-001 — Dar–Lubumbashi fuel'],
            [0, 5200, 'TRP-2026-002 — Dar–Lusaka fuel'],
            [1, 4,    'Oil change — T 123 AAA, T 789 CCC'],
            [4, 2,    'Air filter replacement — T 321 DDD'],
            [6, 1,    'Brake pad replacement — T 456 BBB'],
            [9, 4,    'Tyre replacement — T 987 FFF'],
            [12, 5,   'Office supplies — Apr 2026'],
        ];
        foreach ($stockOuts as [$itemIdx, $qty, $ref]) {
            $iid   = $inventoryItemIds[$itemIdx];
            $cost  = $itemData[$itemIdx][6];
            $newBalance = $itemData[$itemIdx][4] - $qty;
            // Update the item's stock
            DB::table('inventory_items')->where('id', $iid)->decrement('current_stock', $qty);
            DB::table('inventory_movements')->insert([
                'item_id'      => $iid,
                'type'         => 'out',
                'quantity'     => $qty,
                'unit_cost'    => $cost,
                'balance_after'=> max(0, $newBalance),
                'reference'    => $ref,
                'notes'        => null,
                'created_by'   => $adminId,
                'created_at'   => Carbon::create(2026, rand(1,4), rand(2,28))->toDateTimeString(),
                'updated_at'   => $now,
            ]);
        }

        // ── Purchase Orders ────────────────────────────────────────────────
        $poData = [
            // [supplier_idx, status, order_date, expected_date, [[item_idx, desc, qty, unit_price], ...]]
            [0, 'received', '2026-01-10', '2026-01-15', [
                [0, 'Diesel Fuel',            20000, 2800],
                [1, 'Engine Oil 15W-40 (20L)', 20,   85000],
            ]],
            [2, 'received', '2026-01-20', '2026-01-28', [
                [4, 'Air Filter — MAN TGX',   10,   65000],
                [5, 'Oil Filter — Scania R',  10,   42000],
                [7, 'Fan Belt — Universal',   15,   18000],
            ]],
            [4, 'received', '2026-02-05', '2026-02-12', [
                [9, 'Tyre 12.00R20 (Truck)',  12,   380000],
                [10,'Tyre 295/80R22.5',        8,   420000],
            ]],
            [1, 'sent',    '2026-03-01', '2026-03-10', [
                [0, 'Diesel Fuel',            30000, 2850],
            ]],
            [3, 'partial', '2026-03-15', '2026-03-25', [
                [6, 'Brake Pad Set — Front',   8,   120000],
                [8, 'Fuel Filter',            20,    28000],
                [3, 'Grease Cartridge',       50,     8500],
            ]],
            [5, 'draft',   '2026-04-10', '2026-04-20', [
                [12,'A4 Paper (500 sheets)',   30,   12000],
                [13,'Printer Cartridge — HP',  6,   55000],
                [14,'Safety Vest (Hi-Vis)',    20,   18000],
            ]],
            [0, 'draft',   '2026-04-25', '2026-05-05', [
                [0, 'Diesel Fuel',            25000, 2850],
                [2, 'Gear Box Oil 80W-90',    10,   45000],
            ]],
        ];

        foreach ($poData as $poi => [$supIdx, $poStatus, $orderDate, $expDate, $lines]) {
            $year = 2026;
            $seq  = $poi + 1;
            $poNumber = 'PO-' . $year . '-' . str_pad($seq, 4, '0', STR_PAD_LEFT);

            $subtotal = 0;
            foreach ($lines as [$_i, $_d, $qty, $price]) {
                $subtotal += $qty * $price;
            }
            $taxAmt = round($subtotal * 0.18, 2);
            $total  = $subtotal + $taxAmt;

            $poId = DB::table('purchase_orders')->insertGetId([
                'po_number'     => $poNumber,
                'supplier_id'   => $supplierIds[$supIdx],
                'status'        => $poStatus,
                'order_date'    => $orderDate,
                'expected_date' => $expDate,
                'subtotal'      => $subtotal,
                'tax_amount'    => $taxAmt,
                'total'         => $total,
                'notes'         => null,
                'created_by'    => $adminId,
                'created_at'    => Carbon::createFromFormat('Y-m-d', $orderDate)->toDateTimeString(),
                'updated_at'    => Carbon::createFromFormat('Y-m-d', $orderDate)->toDateTimeString(),
            ]);

            foreach ($lines as [$itemIdx, $desc, $qty, $unitPrice] ) {
                $receivedQty = match($poStatus) {
                    'received' => $qty,
                    'partial'  => (int) floor($qty * 0.5),
                    default    => 0,
                };
                DB::table('purchase_order_items')->insert([
                    'purchase_order_id' => $poId,
                    'inventory_item_id' => $inventoryItemIds[$itemIdx],
                    'description'       => $desc,
                    'quantity'          => $qty,
                    'unit'              => $itemData[$itemIdx][2],
                    'unit_price'        => $unitPrice,
                    'total'             => $qty * $unitPrice,
                    'received_qty'      => $receivedQty,
                ]);

                // For received/partial POs, create matching inventory movement
                if ($receivedQty > 0) {
                    $iid = $inventoryItemIds[$itemIdx];
                    DB::table('inventory_items')->where('id', $iid)->increment('current_stock', $receivedQty);
                    DB::table('inventory_movements')->insert([
                        'item_id'      => $iid,
                        'type'         => 'in',
                        'quantity'     => $receivedQty,
                        'unit_cost'    => $unitPrice,
                        'balance_after'=> DB::table('inventory_items')->where('id', $iid)->value('current_stock'),
                        'reference'    => $poNumber,
                        'notes'        => 'Goods received from PO',
                        'created_by'   => $adminId,
                        'created_at'   => Carbon::createFromFormat('Y-m-d', $expDate)->toDateTimeString(),
                        'updated_at'   => $now,
                    ]);
                }
            }
        }

        // ── Job Vacancies ──────────────────────────────────────────────────
        $vacancyData = [
            ['Transport Coordinator',          'Logistics',     3, 'open',   '2026-05-31'],
            ['Senior Accountant',              'Finance',       1, 'open',   '2026-05-15'],
            ['Fleet Mechanic',                 'Mechanical',    2, 'open',   '2026-06-30'],
            ['HR & Admin Officer',             'Administration',1, 'closed', '2026-03-31'],
            ['Driver — Long Haul (Class C)',   'Logistics',     5, 'filled', '2026-02-28'],
        ];
        $vacancyIds = [];
        foreach ($vacancyData as [$vtitle, $vdept, $openings, $vstatus, $closing]) {
            $vacancyIds[] = DB::table('job_vacancies')->insertGetId([
                'title'        => $vtitle,
                'department'   => $vdept,
                'description'  => "We are seeking a qualified {$vtitle} to join our growing team at SH Malik Logistics Ltd.",
                'requirements' => "• Minimum 3 years experience in {$vdept}\n• Excellent communication skills\n• Must be Tanzanian national or holder of valid work permit",
                'openings'     => $openings,
                'status'       => $vstatus,
                'closing_date' => $closing,
                'created_by'   => $adminId,
                'created_at'   => $now,
                'updated_at'   => $now,
            ]);
        }

        // ── Job Applications ───────────────────────────────────────────────
        $appData = [
            // vacancy_idx, full_name, phone, email, stage
            [0, 'Samson Mwenda',       '+255 712 201 001', 'samson.mwenda@email.com',   'applied'],
            [0, 'Fatuma Kisenge',      '+255 712 201 002', 'fatuma.k@gmail.com',         'shortlisted'],
            [0, 'Ali Juma Rashid',     '+255 712 201 003', null,                         'interview'],
            [0, 'Elizabeth Mchama',    '+255 712 201 004', 'liz.mchama@yahoo.com',       'applied'],
            [0, 'George Owino',        '+255 712 201 005', null,                         'rejected'],
            [1, 'Neema Mapunda',       '+255 712 201 010', 'neema.mapunda@gmail.com',    'interview'],
            [1, 'Patrick Sanga',       '+255 712 201 011', 'p.sanga@hotmail.com',        'shortlisted'],
            [1, 'Charity Nkosi',       '+255 712 201 012', 'charity.n@email.com',        'applied'],
            [1, 'Raymond Mlaki',       '+255 712 201 013', null,                         'offer'],
            [2, 'John Mwaseba',        '+255 712 201 020', 'jmwaseba@gmail.com',         'applied'],
            [2, 'Hussein Ally',        '+255 712 201 021', null,                         'shortlisted'],
            [2, 'Dorothy Odhiambo',    '+255 712 201 022', 'dorothy.o@email.com',        'interview'],
            [3, 'Stella Wambua',       '+255 712 201 030', 'stella.w@gmail.com',         'rejected'],
            [3, 'Hamisi Mwaijande',    '+255 712 201 031', null,                         'hired'],
            [4, 'Musa Salum',          '+255 712 201 040', null,                         'hired'],
            [4, 'Bakari Kiango',       '+255 712 201 041', 'bakari.k@email.com',         'hired'],
            [4, 'Joel Mtanda',         '+255 712 201 042', null,                         'hired'],
            [4, 'Francis Mwanga',      '+255 712 201 043', 'fmwanga@gmail.com',          'rejected'],
        ];
        foreach ($appData as [$vacIdx, $appName, $appPhone, $appEmail, $appStage]) {
            $interviewDate  = in_array($appStage, ['interview','offer','hired']) ? Carbon::create(2026, rand(2,4), rand(5,25))->toDateTimeString() : null;
            $offerAmount    = in_array($appStage, ['offer','hired']) ? rand(8,20) * 100000 : null;
            DB::table('job_applications')->insert([
                'vacancy_id'       => $vacancyIds[$vacIdx],
                'full_name'        => $appName,
                'phone'            => $appPhone,
                'email'            => $appEmail,
                'stage'            => $appStage,
                'interview_date'   => $interviewDate,
                'interview_notes'  => $interviewDate ? 'Candidate presented well. Follow-up required.' : null,
                'offer_amount'     => $offerAmount,
                'notes'            => null,
                'created_at'       => $now,
                'updated_at'       => $now,
            ]);
        }

        // ── Appraisals ─────────────────────────────────────────────────────
        // Columns: period_from, period_to, rating_punctuality, rating_conduct,
        //          rating_cargo_care, rating_compliance, manager_rating, manager_notes
        $appraisalData = [
            // [emp_idx, from, to, trips, on_time_pct, fuel_eff, incidents, [punct,conduct,cargo_care,compliance], mgr_rating, status]
            [4,  '2026-01-01','2026-03-31', 18, 88.5, 2.8, 0, [4,4,4,5], 4, 'published'],
            [4,  '2026-04-01','2026-06-30', 22, 91.2, 3.1, 1, [4,5,4,4], 4, 'draft'],
            [8,  '2026-01-01','2026-03-31', 0,  null, null, 0, [4,4,5,4], 4, 'published'],
            [8,  '2026-04-01','2026-06-30', 0,  null, null, 0, [5,5,4,5], 5, 'draft'],
            [3,  '2026-01-01','2026-03-31', 0,  null, null, 0, [5,4,5,5], 5, 'published'],
            [5,  '2026-01-01','2026-03-31', 0,  null, null, 0, [4,5,4,4], 4, 'published'],
            [6,  '2026-01-01','2026-03-31', 0,  null, null, 0, [4,3,4,4], 4, 'published'],
            [12, '2026-01-01','2026-03-31', 25, 85.0, 2.6, 2, [3,4,3,4], 4, 'published'],
        ];

        $computeScore = function (array $ratings, int $incidents): float {
            $valid = array_filter($ratings, fn ($v) => $v !== null);
            if (empty($valid)) return 0.0;
            $avg     = array_sum($valid) / count($valid);
            $penalty = min($incidents * 0.2, 1.0);
            return round(max(0, min(5, $avg - $penalty)), 2);
        };

        foreach ($appraisalData as [$empIdx, $pFrom, $pTo, $trips, $onTime, $fuelEff, $incidents, $ratings, $mgrRating, $aprStatus]) {
            $score = $computeScore(array_merge($ratings, [$mgrRating]), $incidents);
            $label = Carbon::createFromFormat('Y-m-d', $pFrom)->format('Q\1 Y');
            DB::table('appraisals')->insert([
                'employee_id'        => $employeeIds[$empIdx],
                'period_from'        => $pFrom,
                'period_to'          => $pTo,
                'trips_count'        => $trips,
                'on_time_pct'        => $onTime,
                'fuel_eff_kml'       => $fuelEff,
                'incidents'          => $incidents,
                'rating_punctuality' => $ratings[0],
                'rating_conduct'     => $ratings[1],
                'rating_cargo_care'  => $ratings[2],
                'rating_compliance'  => $ratings[3],
                'manager_rating'     => $mgrRating,
                'overall_score'      => $score,
                'manager_notes'      => "Performance review {$pFrom} – {$pTo}. Employee demonstrates commitment to company values.",
                'status'             => $aprStatus,
                'created_by'         => $adminId,
                'created_at'         => $now,
                'updated_at'         => $now,
            ]);
        }

        // ── Leave Requests ─────────────────────────────────────────────────
        $leaveData = [
            // [emp_idx, type, start, days, status, approved_by_admin]
            [4,  'annual',    '2026-01-06', 7,  'approved', true],
            [7,  'sick',      '2026-02-10', 3,  'approved', true],
            [2,  'maternity', '2026-03-01', 84, 'approved', true],
            [10, 'annual',    '2026-03-17', 5,  'approved', true],
            [5,  'emergency', '2026-04-02', 2,  'approved', true],
            [11, 'annual',    '2026-04-14', 5,  'pending',  false],
            [8,  'sick',      '2026-04-22', 2,  'pending',  false],
            [0,  'annual',    '2026-05-05', 10, 'pending',  false],
            [6,  'annual',    '2026-05-12', 7,  'rejected', false],
            [9,  'unpaid',    '2026-04-28', 3,  'pending',  false],
        ];
        foreach ($leaveData as [$empIdx, $lType, $lStart, $lDays, $lStatus, $approved]) {
            $startDate = Carbon::createFromFormat('Y-m-d', $lStart);
            DB::table('leave_requests')->insert([
                'employee_id'    => $employeeIds[$empIdx],
                'type'           => $lType,
                'start_date'     => $lStart,
                'end_date'       => $startDate->copy()->addDays($lDays - 1)->toDateString(),
                'days'           => $lDays,
                'reason'         => match($lType) {
                    'annual'    => 'Annual rest leave as per contract.',
                    'sick'      => 'Medical condition — doctor\'s certificate attached.',
                    'maternity' => 'Maternity leave as per Tanzania Employment Act.',
                    'emergency' => 'Family emergency — bereavement.',
                    'unpaid'    => 'Personal matters requiring extended absence.',
                    default     => 'Leave request.',
                },
                'status'         => $lStatus,
                'approved_by'    => $approved ? $adminId : null,
                'approval_notes' => $approved ? 'Approved. Cover arrangements made.' : null,
                'created_by'     => $adminId,
                'created_at'     => $now,
                'updated_at'     => $now,
            ]);
        }

        // ── Cargo Status Logs ──────────────────────────────────────────────
        $cargoIds = DB::table('cargos')->pluck('id')->all();
        $statusProgression = [
            ['registered', 'Dar es Salaam Warehouse', 'Cargo received and registered'],
            ['loading',     'Dar es Salaam Port',      'Loading onto vehicle commenced'],
            ['in_transit',  'Morogoro Checkpoint',     'Departed Dar. Transit underway'],
            ['at_border',   'Tunduma Border',          'Vehicle at border — customs clearance'],
        ];
        foreach (array_slice($cargoIds, 0, 15) as $cgIdx => $cgId) {
            $currentStatus = DB::table('cargos')->where('id', $cgId)->value('status');
            $statusOrder   = ['registered','loading','in_transit','at_border','cleared','delivered'];
            $currentPos    = array_search($currentStatus, $statusOrder);
            if ($currentPos === false) continue;

            for ($si = 0; $si <= min($currentPos, count($statusProgression) - 1); $si++) {
                [$sStatus, $sLocation, $sNotes] = $statusProgression[$si];
                DB::table('cargo_status_logs')->insert([
                    'cargo_id'   => $cgId,
                    'status'     => $sStatus,
                    'location'   => $sLocation,
                    'notes'      => $sNotes,
                    'user_id'    => $adminId,
                    'created_at' => Carbon::create(2026, rand(1,4), rand(1,28), rand(8,17))->toDateTimeString(),
                    'updated_at' => $now,
                ]);
            }
        }

        // ── Fuel Logs ──────────────────────────────────────────────────────
        $stations = ['Total Kariakoo','Shell Morogoro','TotalEnergies Mbeya','PUMA Tunduma','Total Ubungo','Oryx Changanyikeni','GAPCO Mwananyamala'];
        for ($fl = 0; $fl < 40; $fl++) {
            $fVehicleId = $vehicleIds[array_rand($vehicleIds)];
            $fDriverId  = $driverIds[array_rand($driverIds)];
            $fLiters    = rand(200, 600);
            $fCostL     = rand(2600, 3200);
            $fDate      = Carbon::create(2026, rand(1,4), rand(1,28))->toDateString();
            DB::table('fuel_logs')->insert([
                'vehicle_id'     => $fVehicleId,
                'driver_id'      => $fDriverId,
                'trip_id'        => null,
                'log_date'       => $fDate,
                'liters'         => $fLiters,
                'cost_per_liter' => $fCostL,
                'odometer_km'    => rand(50000, 300000),
                'station_name'   => $stations[array_rand($stations)],
                'fuel_type'      => 'diesel',
                'currency'       => 'TZS',
                'notes'          => null,
                'created_by'     => $adminId,
                'created_at'     => $fDate . ' 08:00:00',
                'updated_at'     => $fDate . ' 08:00:00',
            ]);
        }

        // ── Portal Quote Requests ──────────────────────────────────────────
        $portalClients = DB::table('clients')->whereNotNull('email')->take(4)->pluck('id')->all();
        $pqData = [
            ['Dar es Salaam', 'Lusaka, Zambia',      'Cement bags — 40 tons',         40.0,  80,  '2026-05-15', 'pending',  null],
            ['Dar es Salaam', 'Lubumbashi, DRC',     'Construction steel & rebar',    22.5,  45,  '2026-05-20', 'quoted',   'We can accommodate this shipment. Quote sent via email.'],
            ['Mombasa, Kenya','Dar es Salaam',       'Electronics & appliances',      8.0,   20,  '2026-06-01', 'reviewed', 'Under review. Will provide quote within 24h.'],
            ['Dar es Salaam', 'Lilongwe, Malawi',    'FMCG goods — beverages',        15.0,  30,  '2026-06-10', 'pending',  null],
            ['Dar es Salaam', 'Nairobi, Kenya',      'Pharmaceutical cold chain',     3.5,   10,  '2026-06-05', 'cancelled','Client withdrew the request.'],
        ];
        foreach ($pqData as $pqi => [$pqFrom, $pqTo, $pqCargo, $pqWeight, $pqVol, $pqDate, $pqStatus, $pqNotes]) {
            $clientId = count($portalClients) ? $portalClients[$pqi % count($portalClients)] : $clientIds[0];
            DB::table('portal_quote_requests')->insert([
                'client_id'          => $clientId,
                'route_from'         => $pqFrom,
                'route_to'           => $pqTo,
                'cargo_description'  => $pqCargo,
                'cargo_weight_kg'    => $pqWeight * 1000,
                'cargo_volume_m3'    => $pqVol,
                'preferred_date'     => $pqDate,
                'status'             => $pqStatus,
                'reviewed_by'        => in_array($pqStatus, ['reviewed','quoted','cancelled']) ? $adminId : null,
                'staff_notes'        => $pqNotes,
                'created_at'         => $now,
                'updated_at'         => $now,
            ]);
        }

        $this->command->info('✅ Seed complete. ' . count($tripIds) . ' trips, ' . (count($employeeIds) * 4) . ' payroll slips.');
    }
}
