import { createContext, useContext, useState, useEffect } from 'react';

const en = {
    nav: {
        home: 'Home', services: 'Services', about: 'About', contact: 'Contact',
        login: 'Login',
        logout: 'Logout',
    },
    common: {
        getQuote: 'Get a Quote', freeQuote: 'Get a Free Quote', viewServices: 'View Services',
        contactUs: 'Contact Us', ourServices: 'Our Services', aboutUs: 'About Us',
    },
    footer: {
        tagline: "Tanzania's trusted freight partner for cross-border logistics across East and Central Africa.",
        quickLinks: 'Quick Links', services: 'Services', activeRoutes: 'Active Routes',
        copyright: '© 2026 SH Malik Logistics Company Limited. All rights reserved.',
    },
    home: {
        quickStats: 'Quick Stats',
        slides: [
            { badge: "Tanzania's Trusted Logistics Partner", title: 'Moving Your Cargo', highlight: 'Across Africa', desc: 'Reliable, transparent freight from Dar es Salaam to DRC, Zambia, Malawi and beyond — with real-time tracking and full cost visibility on every trip.', features: ['GPS Fleet Tracking', 'Border Permit Management', 'Real-Time Cost Reporting'] },
            { badge: 'Real-Time Cargo Visibility', title: 'Track Every Shipment', highlight: 'From Loading to Delivery', desc: 'Full cargo visibility with GPS tracking and live status updates. Your clients know exactly where their goods are — without calling the office.', features: ['Live GPS Location', 'Customer Self-Service Portal', 'Automated SMS Alerts'] },
            { badge: 'Cross-Border Expertise', title: 'Border Crossings', highlight: 'Made Simple', desc: 'We handle all transit permits, customs documentation and border logistics for DRC, Zambia and Malawi — so your cargo keeps moving.', features: ['Transit Permits Handled', 'COMESA/SADC Compliance', 'Expiry Date Alerts'] },
            { badge: 'Modern Fleet Management', title: 'A Fleet You Can', highlight: 'Rely On', desc: 'Well-maintained vehicles, experienced drivers and scheduled servicing — every trip planned and tracked for on-time, safe delivery.', features: ['Scheduled Maintenance Alerts', 'Driver Performance Tracking', 'Fuel Cost Monitoring'] },
        ],
        stats: [
            { icon: '🚛', value: '500+', label: 'Trips Completed' },
            { icon: '🚗', value: '50+', label: 'Vehicles in Fleet' },
            { icon: '🌍', value: '6', label: 'Countries Served' },
            { icon: '✅', value: '98%', label: 'On-Time Delivery' },
        ],
        whyUs: {
            badge: 'Why SH Malik', title: 'Logistics Built on', highlight: 'Transparency & Trust',
            desc: 'Most logistics problems in Africa come from hidden costs, zero visibility, and unreliable communication. We built our operation to solve exactly those problems.',
            imageBadge: '🏆 Trusted across East Africa', imageSubBadge: 'DRC · Zambia · Malawi · Mozambique',
            items: [
                { icon: '🎯', title: 'Full Cost Transparency', desc: 'Every shilling accounted for — fuel, driver allowance, border fees, maintenance. No hidden charges.' },
                { icon: '⏱️', title: '98% On-Time Delivery', desc: 'Disciplined route planning, real-time driver monitoring and proactive communication.' },
                { icon: '🌍', title: 'Regional Expertise', desc: 'Deep knowledge of East and Central African border requirements, road conditions and customs.' },
                { icon: '📱', title: 'Technology-Driven', desc: 'GPS tracking, digital documents, customer portal and automated alerts — managed from your phone.' },
            ],
        },
        services: {
            badge: 'What We Do', title: 'Our', highlight: 'Core Services',
            desc: 'End-to-end logistics for East and Central African trade routes.',
            items: [
                { icon: '🚛', title: 'Long Haul Freight', desc: 'Full and part-load trucking on major East and Central African corridors.', features: ['Full Truck Load (FTL)', 'Part Load (LTL)', 'Refrigerated cargo', 'Oversize & heavy loads'] },
                { icon: '📍', title: 'GPS Fleet Tracking', desc: 'Real-time location of every vehicle, accessible from any device.', features: ['Live map view', 'Trip history & replay', 'Fuel sensor integration', 'Geofence alerts'] },
                { icon: '🛂', title: 'Border & Customs', desc: 'End-to-end permit management for all border crossing points.', features: ['Transit permits', 'COMESA/SADC compliance', 'Customs documentation', 'Expiry tracking'] },
                { icon: '📊', title: 'Route Profitability', desc: 'See the true profit of every trip — revenue vs all costs.', features: ['Cost per km', 'Driver KPIs', 'Fuel efficiency', 'Monthly P&L'] },
                { icon: '📦', title: 'Cargo Management', desc: 'Complete cargo handling from loading supervision to delivery.', features: ['Loading supervision', 'Weight verification', 'Cargo insurance', 'Digital delivery proof'] },
                { icon: '🤝', title: 'Customer Portal', desc: 'Clients track shipments and download invoices themselves.', features: ['Self-service tracking', 'Invoice downloads', 'Trip history', 'SMS notifications'] },
            ],
        },
        routes: {
            badge: 'Where We Operate', title: 'Our', highlight: 'Active Routes',
            desc: 'Regular departures on all major corridors from Dar es Salaam.',
            hub: '🇹🇿 Dar es Salaam Hub', hubSub: '· Origin of all routes',
            from: 'From', to: 'To', distance: 'Distance', transit: 'Transit',
            items: [
                { from: 'Dar es Salaam', to: 'Lubumbashi', country: 'DRC', flag: '🇨🇩', distance: '~2,100 km', time: '5–7 days' },
                { from: 'Dar es Salaam', to: 'Lusaka', country: 'Zambia', flag: '🇿🇲', distance: '~1,900 km', time: '4–6 days' },
                { from: 'Dar es Salaam', to: 'Lilongwe', country: 'Malawi', flag: '🇲🇼', distance: '~1,400 km', time: '3–5 days' },
                { from: 'Dar es Salaam', to: 'Maputo', country: 'Mozambique', flag: '🇲🇿', distance: '~2,200 km', time: '5–7 days' },
            ],
        },
        howItWorks: {
            badge: 'Simple Process', title: 'How It Works',
            desc: 'From first contact to final delivery in 4 clear steps.',
            steps: [
                { n: '01', icon: '💬', title: 'Get a Quote', desc: 'Contact us with route, cargo type and weight. We respond within 2 hours with a full cost breakdown.' },
                { n: '02', icon: '📋', title: 'Booking Confirmed', desc: 'We assign a vehicle and driver, prepare documents and schedule loading with you.' },
                { n: '03', icon: '📡', title: 'Track in Real Time', desc: 'Follow your cargo live on GPS. Get SMS updates at loading, border crossing and delivery.' },
                { n: '04', icon: '✅', title: 'Delivery & Invoice', desc: 'Cargo delivered with signed proof. Invoice sent digitally with full trip cost breakdown.' },
            ],
        },
        cta: {
            badge: 'Get Started Today', title: 'Ready to Move', highlight: 'Your Cargo?',
            desc: 'Contact us for a free quote. We respond within 2 hours with a full cost breakdown — no hidden fees, ever.',
            contacts: [
                { icon: '📞', label: 'Phone / WhatsApp', value: '+255 789 511 234', sub: 'Call or WhatsApp anytime' },
                { icon: '📧', label: 'Email Us', value: 'info@shmalik.co.tz', sub: 'We reply within 2 hours' },
                { icon: '📍', label: 'Location', value: 'Buza, Kwa Mama Kibonge, Dar es Salaam', sub: 'Main operations base' },
            ],
        },
    },
    services: {
        hero: { badge: 'What We Offer', title: 'Our', highlight: 'Services', desc: 'Full-spectrum logistics built for East and Central African trade routes — from a single truck to a full fleet.' },
        highlights: [
            { value: '500+', label: 'Trips Completed', icon: '🚛' },
            { value: '50+', label: 'Vehicles in Fleet', icon: '🚗' },
            { value: '4', label: 'Active Countries', icon: '🌍' },
            { value: '24/7', label: 'Support Available', icon: '📞' },
        ],
        items: [
            { icon: '🚛', title: 'Long Haul Freight', desc: 'Full and part-load trucking on major East and Central African corridors — Dar es Salaam to DRC, Zambia, Malawi and Mozambique.', features: ['Full Truck Load (FTL)', 'Part Load (LTL)', 'Refrigerated cargo', 'Oversize & heavy loads', 'Hazardous materials'] },
            { icon: '📍', title: 'GPS Fleet Tracking', desc: 'Real-time location of every vehicle on the road, accessible from any device. Know exactly where your cargo is at all times.', features: ['Live map view', 'Trip history & replay', 'Fuel sensor integration', 'Geofence alerts', 'Driver behaviour monitoring'] },
            { icon: '🛂', title: 'Border & Customs', desc: 'End-to-end permit and customs documentation management for all border crossing points — with expiry alerts before documents lapse.', features: ['Transit permits', 'COMESA/SADC compliance', 'Customs documentation', 'Expiry date tracking', 'Border crossing planning'] },
            { icon: '📊', title: 'Route Profitability', desc: 'See the true profit of every trip — revenue vs all costs (fuel, allowances, border fees, maintenance) per route and per vehicle.', features: ['Cost per km analysis', 'Driver performance KPIs', 'Fuel efficiency reports', 'Monthly P&L per route', 'Vehicle ROI tracking'] },
            { icon: '📦', title: 'Cargo Management', desc: 'Complete cargo handling from loading supervision to delivery confirmation — with weight verification and full cargo insurance.', features: ['Loading supervision', 'Weight & seal verification', 'Cargo insurance', 'Digital delivery proof', 'Claims management'] },
            { icon: '🤝', title: 'Customer Portal', desc: 'Your clients log in to track shipments, download invoices and view trip history — reducing support calls to zero.', features: ['Self-service shipment tracking', 'Invoice downloads', 'Trip & payment history', 'SMS/email notifications', 'Document access'] },
        ],
        cta: { title: 'Ready to Get Started?', desc: 'Contact us for a free quote on your next shipment. No hidden fees — ever.' },
    },
    about: {
        hero: {
            badge: 'Who We Are', title: 'About', highlight: 'SH Malik', title2: 'Logistics',
            desc: 'A Tanzanian logistics company built on trust, technology, and deep regional knowledge of East and Central African trade routes.',
            stats: [
                { value: '500+', label: 'Trips', icon: '🚛' }, { value: '50+', label: 'Vehicles', icon: '🚗' },
                { value: '4', label: 'Countries', icon: '🌍' }, { value: '98%', label: 'On Time', icon: '⏱️' },
            ],
        },
        story: {
            badge: 'Our Story', title: 'Built for', highlight: "Africa's Trade Routes",
            imageBadge: '📍 Based in Dar es Salaam, Tanzania',
            imageSubBadge: 'Serving DRC · Zambia · Malawi · Mozambique',
            paragraphs: [
                'SH Malik Logistics was established to solve the real challenges of cross-border freight in East and Central Africa — unreliable transport, hidden costs, and zero visibility on cargo.',
                'Based in Buza, Dar es Salaam, we operate on major corridors including Dar es Salaam to Lubumbashi (DRC), Lusaka (Zambia), Lilongwe (Malawi) and Maputo (Mozambique) — with a fleet managed by experienced drivers and supported by modern logistics technology.',
                'Every trip is tracked, every cost is recorded, and every client gets full transparency from loading to delivery.',
            ],
            contactBtn: 'Contact Us', servicesBtn: 'Our Services',
        },
        values: {
            badge: 'Our Values', title: 'What', highlight: 'Drives Us',
            items: [
                { icon: '🎯', title: 'Reliability', desc: 'Every trip planned and tracked to ensure on-time delivery, every time.' },
                { icon: '🔍', title: 'Transparency', desc: 'Full cost visibility on every trip — no hidden charges, ever.' },
                { icon: '🌍', title: 'Regional Expertise', desc: 'Deep knowledge of East and Central African trade routes and border requirements.' },
                { icon: '🤝', title: 'Partnership', desc: 'We treat your cargo and your business as our own.' },
                { icon: '📱', title: 'Technology', desc: 'GPS tracking, digital documents, and automated alerts keep everything connected.' },
                { icon: '🛡️', title: 'Compliance', desc: 'COMESA/SADC compliant with all transit permits and customs requirements handled.' },
            ],
        },
        milestones: {
            badge: 'Our Journey', title: 'Company Milestones',
            items: [
                { year: '2020', title: 'Company Founded', desc: 'SH Malik Logistics established in Dar es Salaam with a focus on DRC corridor freight.' },
                { year: '2021', title: 'Fleet Expanded', desc: 'Fleet grew to 20+ vehicles. Added Zambia and Malawi routes to regular operations.' },
                { year: '2023', title: 'Technology Integrated', desc: 'GPS tracking, fuel sensors, and digital operations management rolled out across the fleet.' },
                { year: '2025', title: 'Digital Platform', desc: 'Customer portal and route profitability system launched — giving clients full shipment visibility.' },
                { year: '2026', title: 'Full ERP System', desc: 'Complete logistics management system — 29 modules covering all operations from trips to HR.' },
            ],
        },
        team: {
            badge: 'Our Team', title: 'The People Behind', highlight: 'Every Delivery',
            items: [
                { role: 'Operations', icon: '🚛', desc: 'Experienced dispatch team managing route planning, driver assignments and border logistics daily.' },
                { role: 'Technology', icon: '💻', desc: 'Tech team ensuring GPS tracking, customer portal and digital tools are always running.' },
                { role: 'Compliance', icon: '📋', desc: 'Dedicated permits and customs team handling all cross-border documentation.' },
                { role: 'Customer Service', icon: '📞', desc: 'Support team available to answer client queries and provide real-time cargo updates.' },
            ],
        },
    },
    contact: {
        hero: { badge: 'Get In Touch', title: "Let's", highlight: 'Move Your Cargo', desc: "Ready to ship? Send us a message and we'll get back to you within 2 hours with a full cost breakdown." },
        cards: [
            { icon: '📍', label: 'Address', value: 'Buza, Kwa Mama Kibonge', sub: 'Dar es Salaam, Tanzania' },
            { icon: '📞', label: 'Phone / WhatsApp', value: '+255 789 511 234', sub: 'Call or WhatsApp anytime' },
            { icon: '📧', label: 'Email', value: 'info@shmalik.co.tz', sub: 'We reply within 2 hours' },
        ],
        form: {
            title: 'Send a Message', subtitle: 'We respond within 2 hours',
            name: 'Full Name', namePlaceholder: 'Your name',
            phone: 'Phone', phonePlaceholder: '+255 ...',
            email: 'Email Address', emailPlaceholder: 'your@email.com',
            message: 'Message', messagePlaceholder: 'Tell us about your shipment — route, cargo type, weight, timeline...',
            submit: 'Send Message →',
        },
        faq: {
            badge: 'Common Questions', title: 'Frequently Asked', highlight: 'Questions',
            desc: 'Quick answers to the most common questions about our services.',
            items: [
                { q: 'How long does Dar to Lubumbashi take?', a: 'Typically 5–7 days depending on border conditions and cargo type. We provide real-time updates throughout.' },
                { q: 'Do you handle customs documentation?', a: 'Yes — we manage all transit permits, COMESA/SADC compliance documents and customs paperwork for every route.' },
                { q: 'Can I track my cargo in real time?', a: 'Yes. Every vehicle has GPS tracking. You can follow your cargo on our customer portal or receive SMS updates.' },
                { q: 'What cargo types do you carry?', a: 'General goods, industrial equipment, refrigerated cargo, oversized loads, and hazardous materials (with proper permits).' },
            ],
        },
    },
};

const sw = {
    nav: {
        home: 'Nyumbani', services: 'Huduma', about: 'Kuhusu', contact: 'Mawasiliano',
        login: 'Ingia',
        logout: 'Toka',
    },
    common: {
        getQuote: 'Pata Bei', freeQuote: 'Pata Bei ya Bure', viewServices: 'Angalia Huduma',
        contactUs: 'Wasiliana Nasi', ourServices: 'Huduma Zetu', aboutUs: 'Kuhusu Sisi',
    },
    footer: {
        tagline: 'Mshirika wako wa usafirishaji Tanzania kwa biashara ya kimataifa Afrika Mashariki na Kati.',
        quickLinks: 'Viungo vya Haraka', services: 'Huduma', activeRoutes: 'Njia Zinazofanya Kazi',
        copyright: '© 2026 SH Malik Logistics Company Limited. Haki zote zimehifadhiwa.',
    },
    home: {
        quickStats: 'Takwimu za Haraka',
        slides: [
            { badge: 'Mshirika Wako wa Usafirishaji Tanzania', title: 'Kusafirisha Mizigo Yako', highlight: 'Kote Afrika', desc: 'Usafirishaji wa kuaminika na uwazi kutoka Dar es Salaam hadi DRC, Zambia, Malawi na zaidi — na ufuatiliaji wa wakati halisi na uonekani kamili wa gharama kwa kila safari.', features: ['Ufuatiliaji wa GPS', 'Usimamizi wa Vibali vya Mpakani', 'Ripoti ya Gharama ya Wakati Halisi'] },
            { badge: 'Uonekani wa Mizigo kwa Wakati Halisi', title: 'Fuatilia Kila Usafirishaji', highlight: 'Kutoka Kupakia Hadi Kutoa', desc: 'Uonekani kamili wa mizigo na ufuatiliaji wa GPS. Wateja wako wanajua hasa wapi bidhaa zao zipo — bila kupiga simu ofisini.', features: ['Mahali pa GPS kwa Wakati Halisi', 'Lango la Mteja la Kujisaidia', 'Arifa za SMS za Kiotomatiki'] },
            { badge: 'Uzoefu wa Mpakani', title: 'Kuvuka Mipaka', highlight: 'Imefanywa Rahisi', desc: 'Tunashughulikia vibali vyote vya usafiri, nyaraka za forodha na usimamizi wa mipaka kwa DRC, Zambia na Malawi — ili mizigo yako iendelee kusonga.', features: ['Vibali vya Usafiri Vimeshughulikiwa', 'Uzingatifu wa COMESA/SADC', 'Arifa za Tarehe ya Kuisha'] },
            { badge: 'Usimamizi wa Kisasa wa Gari', title: 'Gari Unaloweza', highlight: 'Kuitegemea', desc: 'Magari yaliyodumishwa vizuri, madereva wenye uzoefu na huduma zilizopangwa — kila safari imepangwa na kufuatiliwa kwa utoaji salama na wa wakati.', features: ['Arifa za Matengenezo Yaliyopangwa', 'Ufuatiliaji wa Utendaji wa Dereva', 'Ufuatiliaji wa Gharama za Mafuta'] },
        ],
        stats: [
            { icon: '🚛', value: '500+', label: 'Safari Zilizokamilika' },
            { icon: '🚗', value: '50+', label: 'Magari Katika Gari' },
            { icon: '🌍', value: '6', label: 'Nchi Zinazohudumika' },
            { icon: '✅', value: '98%', label: 'Utoaji kwa Wakati' },
        ],
        whyUs: {
            badge: 'Kwa Nini SH Malik', title: 'Usafirishaji Uliojengwa kwa', highlight: 'Uwazi na Uaminifu',
            desc: 'Matatizo mengi ya usafirishaji Afrika yanatoka kwa gharama zilizofichwa, kutokuwa na uonekani, na mawasiliano yasiyoaminika. Tulijenga shughuli yetu ili kutatua matatizo hayo.',
            imageBadge: '🏆 Inayoaminiwa Afrika Mashariki', imageSubBadge: 'DRC · Zambia · Malawi · Mozambique',
            items: [
                { icon: '🎯', title: 'Uwazi Kamili wa Gharama', desc: 'Kila shilingi imehesabiwa — mafuta, posho ya dereva, ada za mpakani, matengenezo. Hakuna malipo ya siri.' },
                { icon: '⏱️', title: '98% Utoaji kwa Wakati', desc: 'Upangaji madhubuti wa njia, ufuatiliaji wa madereva kwa wakati halisi na mawasiliano ya mapema.' },
                { icon: '🌍', title: 'Uzoefu wa Kikanda', desc: 'Maarifa ya kina ya mahitaji ya mpakani Afrika Mashariki na Kati, hali za barabara na forodha.' },
                { icon: '📱', title: 'Inayoendeshwa na Teknolojia', desc: 'Ufuatiliaji wa GPS, nyaraka za kidijitali, lango la mteja na arifa za kiotomatiki — inayosimamiwa kutoka simu yako.' },
            ],
        },
        services: {
            badge: 'Tunachofanya', title: 'Huduma Zetu', highlight: 'Kuu',
            desc: 'Usafirishaji wa mwisho hadi mwisho kwa njia za biashara Afrika Mashariki na Kati.',
            items: [
                { icon: '🚛', title: 'Usafirishaji wa Masafa Marefu', desc: 'Usafirishaji wa mzigo kamili na sehemu kwenye njia kuu za Afrika Mashariki na Kati.', features: ['Mzigo Kamili wa Lori (FTL)', 'Mzigo wa Sehemu (LTL)', 'Mizigo ya baridi', 'Mizigo mizito na kubwa'] },
                { icon: '📍', title: 'Ufuatiliaji wa GPS', desc: 'Mahali pa wakati halisi pa kila gari, linalopatikana kutoka kifaa chochote.', features: ['Mtazamo wa ramani ya moja kwa moja', 'Historia ya safari', 'Ushirikiano wa sensaa ya mafuta', 'Arifa za Geofence'] },
                { icon: '🛂', title: 'Mpakani na Forodha', desc: 'Usimamizi kamili wa vibali kwa vituo vyote vya kuvuka mpaka.', features: ['Vibali vya usafiri', 'Uzingatifu wa COMESA/SADC', 'Nyaraka za forodha', 'Ufuatiliaji wa tarehe ya kuisha'] },
                { icon: '📊', title: 'Faida ya Njia', desc: 'Ona faida halisi ya kila safari — mapato dhidi ya gharama zote.', features: ['Gharama kwa km', 'KPIs za Dereva', 'Ufanisi wa mafuta', 'P&L ya kila mwezi'] },
                { icon: '📦', title: 'Usimamizi wa Mizigo', desc: 'Ushughulikiaji kamili wa mizigo kutoka usimamizi wa kupakia hadi utoaji.', features: ['Usimamizi wa kupakia', 'Uthibitishaji wa uzito', 'Bima ya mizigo', 'Uthibitisho wa utoaji wa kidijitali'] },
                { icon: '🤝', title: 'Lango la Mteja', desc: 'Wateja hufuatilia mizigo na kupakua ankara wenyewe.', features: ['Ufuatiliaji wa kujisaidia', 'Upakuaji wa ankara', 'Historia ya safari', 'Arifa za SMS'] },
            ],
        },
        routes: {
            badge: 'Tunakohudumia', title: 'Njia Zetu', highlight: 'Zinazofanya Kazi',
            desc: 'Kuondoka mara kwa mara kwenye njia kuu zote kutoka Dar es Salaam.',
            hub: '🇹🇿 Kitovu cha Dar es Salaam', hubSub: '· Chanzo cha njia zote',
            from: 'Kutoka', to: 'Kwenda', distance: 'Umbali', transit: 'Wakati wa Usafiri',
            items: [
                { from: 'Dar es Salaam', to: 'Lubumbashi', country: 'DRC', flag: '🇨🇩', distance: '~2,100 km', time: 'Siku 5–7' },
                { from: 'Dar es Salaam', to: 'Lusaka', country: 'Zambia', flag: '🇿🇲', distance: '~1,900 km', time: 'Siku 4–6' },
                { from: 'Dar es Salaam', to: 'Lilongwe', country: 'Malawi', flag: '🇲🇼', distance: '~1,400 km', time: 'Siku 3–5' },
                { from: 'Dar es Salaam', to: 'Maputo', country: 'Mozambique', flag: '🇲🇿', distance: '~2,200 km', time: 'Siku 5–7' },
            ],
        },
        howItWorks: {
            badge: 'Mchakato Rahisi', title: 'Jinsi Inavyofanya Kazi',
            desc: 'Kutoka mawasiliano ya kwanza hadi utoaji wa mwisho katika hatua 4 wazi.',
            steps: [
                { n: '01', icon: '💬', title: 'Pata Bei', desc: 'Wasiliana nasi na njia, aina ya mizigo na uzito. Tunajibu ndani ya masaa 2 na muhtasari kamili wa gharama.' },
                { n: '02', icon: '📋', title: 'Uthibitisho wa Uhifadhi', desc: 'Tunamteua gari na dereva, tunaandaa nyaraka na kupanga upakiaji nawe.' },
                { n: '03', icon: '📡', title: 'Fuatilia kwa Wakati Halisi', desc: 'Fuata mizigo yako kwa GPS. Pata masasisho ya SMS wakati wa kupakia, kuvuka mpaka na utoaji.' },
                { n: '04', icon: '✅', title: 'Utoaji na Ankara', desc: 'Mizigo imetolewa na uthibitisho uliosainwa. Ankara imetumwa kidijitali na muhtasari kamili wa gharama.' },
            ],
        },
        cta: {
            badge: 'Anza Leo', title: 'Uko Tayari Kusafirisha', highlight: 'Mizigo Yako?',
            desc: 'Wasiliana nasi kwa bei ya bure. Tunajibu ndani ya masaa 2 na muhtasari kamili wa gharama — hakuna ada zilizofichwa, kamwe.',
            contacts: [
                { icon: '📞', label: 'Simu / WhatsApp', value: '+255 789 511 234', sub: 'Piga simu au WhatsApp wakati wowote' },
                { icon: '📧', label: 'Tutumie Barua Pepe', value: 'info@shmalik.co.tz', sub: 'Tunajibu ndani ya masaa 2' },
                { icon: '📍', label: 'Mahali', value: 'Buza, Kwa Mama Kibonge, Dar es Salaam', sub: 'Kituo kikuu cha uendeshaji' },
            ],
        },
    },
    services: {
        hero: { badge: 'Tunachokutoa', title: 'Huduma', highlight: 'Zetu', desc: 'Usafirishaji wa wigo kamili uliojengwa kwa njia za biashara Afrika Mashariki na Kati — kutoka lori moja hadi gari zima.' },
        highlights: [
            { value: '500+', label: 'Safari Zilizokamilika', icon: '🚛' },
            { value: '50+', label: 'Magari Katika Gari', icon: '🚗' },
            { value: '4', label: 'Nchi Zinazofanya Kazi', icon: '🌍' },
            { value: '24/7', label: 'Msaada Unapatikana', icon: '📞' },
        ],
        items: [
            { icon: '🚛', title: 'Usafirishaji wa Masafa Marefu', desc: 'Usafirishaji wa mzigo kamili na sehemu kwenye njia kuu — Dar es Salaam hadi DRC, Zambia, Malawi na Mozambique.', features: ['Mzigo Kamili wa Lori (FTL)', 'Mzigo wa Sehemu (LTL)', 'Mizigo ya baridi', 'Mizigo mizito na kubwa', 'Vifaa hatari'] },
            { icon: '📍', title: 'Ufuatiliaji wa GPS wa Gari', desc: 'Mahali pa wakati halisi pa kila gari barabarani, linalopatikana kutoka kifaa chochote.', features: ['Mtazamo wa ramani ya moja kwa moja', 'Historia ya safari na mchezaji', 'Ushirikiano wa sensaa ya mafuta', 'Arifa za Geofence', 'Ufuatiliaji wa tabia ya dereva'] },
            { icon: '🛂', title: 'Mpakani na Forodha', desc: 'Usimamizi kamili wa vibali na nyaraka za forodha kwa vituo vyote vya kuvuka mpaka.', features: ['Vibali vya usafiri', 'Uzingatifu wa COMESA/SADC', 'Nyaraka za forodha', 'Ufuatiliaji wa tarehe ya kuisha', 'Upangaji wa kuvuka mpaka'] },
            { icon: '📊', title: 'Faida ya Njia', desc: 'Ona faida halisi ya kila safari — mapato dhidi ya gharama zote (mafuta, posho, ada za mpakani, matengenezo).', features: ['Uchambuzi wa gharama kwa km', 'KPIs za utendaji wa dereva', 'Ripoti za ufanisi wa mafuta', 'P&L ya kila mwezi kwa njia', 'Ufuatiliaji wa ROI ya gari'] },
            { icon: '📦', title: 'Usimamizi wa Mizigo', desc: 'Ushughulikiaji kamili wa mizigo kutoka usimamizi wa kupakia hadi uthibitisho wa utoaji.', features: ['Usimamizi wa kupakia', 'Uthibitishaji wa uzito na muhuri', 'Bima ya mizigo', 'Uthibitisho wa utoaji wa kidijitali', 'Usimamizi wa madai'] },
            { icon: '🤝', title: 'Lango la Mteja', desc: 'Wateja wako wanaingia kufuatilia mizigo, kupakua ankara na kuona historia ya safari.', features: ['Ufuatiliaji wa mizigo wa kujisaidia', 'Upakuaji wa ankara', 'Historia ya safari na malipo', 'Arifa za SMS/barua pepe', 'Ufikiaji wa nyaraka'] },
        ],
        cta: { title: 'Uko Tayari Kuanza?', desc: 'Wasiliana nasi kwa bei ya bure ya usafirishaji wako ujao. Hakuna ada zilizofichwa — kamwe.' },
    },
    about: {
        hero: {
            badge: 'Sisi ni Nani', title: 'Kuhusu', highlight: 'SH Malik', title2: 'Logistics',
            desc: 'Kampuni ya usafirishaji Tanzania iliyojengwa kwa uaminifu, teknolojia, na maarifa ya kina ya kikanda ya njia za biashara Afrika Mashariki na Kati.',
            stats: [
                { value: '500+', label: 'Safari', icon: '🚛' }, { value: '50+', label: 'Magari', icon: '🚗' },
                { value: '4', label: 'Nchi', icon: '🌍' }, { value: '98%', label: 'kwa Wakati', icon: '⏱️' },
            ],
        },
        story: {
            badge: 'Hadithi Yetu', title: 'Imejengwa kwa', highlight: 'Njia za Biashara za Afrika',
            imageBadge: '📍 Makao Makuu Dar es Salaam, Tanzania',
            imageSubBadge: 'Inahudumia DRC · Zambia · Malawi · Mozambique',
            paragraphs: [
                'SH Malik Logistics ilianzishwa kutatua changamoto za kweli za usafirishaji wa mpaka Afrika Mashariki na Kati — usafirishaji usioaminika, gharama zilizofichwa, na kutokuwa na uonekani wa mizigo.',
                'Makao makuu yake Buza, Dar es Salaam, tunafanya kazi kwenye njia kuu ikiwa ni pamoja na Dar es Salaam hadi Lubumbashi (DRC), Lusaka (Zambia), Lilongwe (Malawi) na Maputo (Mozambique) — na gari linalosimamiwa na madereva wenye uzoefu na kuungwa mkono na teknolojia ya kisasa ya usafirishaji.',
                'Kila safari inafuatiliwa, kila gharama inarekodiwa, na kila mteja anapata uwazi kamili kutoka kupakia hadi utoaji.',
            ],
            contactBtn: 'Wasiliana Nasi', servicesBtn: 'Huduma Zetu',
        },
        values: {
            badge: 'Maadili Yetu', title: 'Kinachotuen', highlight: 'desha',
            items: [
                { icon: '🎯', title: 'Uaminifu', desc: 'Kila safari imepangwa na kufuatiliwa kuhakikisha utoaji wa wakati, kila wakati.' },
                { icon: '🔍', title: 'Uwazi', desc: 'Uonekani kamili wa gharama kwa kila safari — hakuna malipo ya siri, kamwe.' },
                { icon: '🌍', title: 'Uzoefu wa Kikanda', desc: 'Maarifa ya kina ya njia za biashara Afrika Mashariki na Kati na mahitaji ya mpakani.' },
                { icon: '🤝', title: 'Ushirikiano', desc: 'Tunashughulikia mizigo yako na biashara yako kama yetu wenyewe.' },
                { icon: '📱', title: 'Teknolojia', desc: 'Ufuatiliaji wa GPS, nyaraka za kidijitali, na arifa za kiotomatiki huweka kila kitu kimeunganishwa.' },
                { icon: '🛡️', title: 'Uzingatifu', desc: 'Inazingatia COMESA/SADC na vibali vyote vya usafiri na mahitaji ya forodha yaliyoshughulikiwa.' },
            ],
        },
        milestones: {
            badge: 'Safari Yetu', title: 'Hatua Muhimu za Kampuni',
            items: [
                { year: '2020', title: 'Kampuni Ilianzishwa', desc: 'SH Malik Logistics ilianzishwa Dar es Salaam ikiwa na lengo la usafirishaji wa njia ya DRC.' },
                { year: '2021', title: 'Gari Lipanuliwa', desc: 'Gari lilikua hadi magari 20+. Njia za Zambia na Malawi ziliongezwa kwenye shughuli za kawaida.' },
                { year: '2023', title: 'Teknolojia Iliunganishwa', desc: 'Ufuatiliaji wa GPS, sensaa za mafuta, na usimamizi wa shughuli za kidijitali vilienezwa kwa gari zote.' },
                { year: '2025', title: 'Jukwaa la Kidijitali', desc: 'Lango la mteja na mfumo wa faida ya njia vilizinduliwa — kuwapa wateja uonekani kamili wa mizigo.' },
                { year: '2026', title: 'Mfumo Kamili wa ERP', desc: 'Mfumo kamili wa usimamizi wa usafirishaji — moduli 29 zinazoshughulikia shughuli zote kutoka safari hadi HR.' },
            ],
        },
        team: {
            badge: 'Timu Yetu', title: 'Watu Nyuma ya', highlight: 'Kila Utoaji',
            items: [
                { role: 'Uendeshaji', icon: '🚛', desc: 'Timu ya ujumbe wenye uzoefu inayosimamia upangaji wa njia, mgawanyo wa madereva na usafirishaji wa mpakani kila siku.' },
                { role: 'Teknolojia', icon: '💻', desc: 'Timu ya teknolojia inayohakikisha ufuatiliaji wa GPS, lango la mteja na zana za kidijitali zinafanya kazi daima.' },
                { role: 'Uzingatifu', icon: '📋', desc: 'Timu iliyojitolea ya vibali na forodha inayoshughulikia nyaraka zote za kuvuka mpaka.' },
                { role: 'Huduma kwa Wateja', icon: '📞', desc: 'Timu ya msaada inayopatikana kujibu maswali ya wateja na kutoa masasisho ya mizigo kwa wakati halisi.' },
            ],
        },
    },
    contact: {
        hero: { badge: 'Wasiliana Nasi', title: 'Hebu', highlight: 'Tusafirisha Mizigo Yako', desc: 'Uko tayari kutuma? Tuma ujumbe na tutawasiliana nawe ndani ya masaa 2 na muhtasari kamili wa gharama.' },
        cards: [
            { icon: '📍', label: 'Anwani', value: 'Buza, Kwa Mama Kibonge', sub: 'Dar es Salaam, Tanzania' },
            { icon: '📞', label: 'Simu / WhatsApp', value: '+255 789 511 234', sub: 'Piga simu au WhatsApp wakati wowote' },
            { icon: '📧', label: 'Barua Pepe', value: 'info@shmalik.co.tz', sub: 'Tunajibu ndani ya masaa 2' },
        ],
        form: {
            title: 'Tuma Ujumbe', subtitle: 'Tunajibu ndani ya masaa 2',
            name: 'Jina Kamili', namePlaceholder: 'Jina lako',
            phone: 'Simu', phonePlaceholder: '+255 ...',
            email: 'Anwani ya Barua Pepe', emailPlaceholder: 'barua@pepe.com',
            message: 'Ujumbe', messagePlaceholder: 'Tuambie kuhusu usafirishaji wako — njia, aina ya mizigo, uzito, ratiba...',
            submit: 'Tuma Ujumbe →',
        },
        faq: {
            badge: 'Maswali ya Kawaida', title: 'Maswali', highlight: 'Yanayoulizwa Mara Kwa Mara',
            desc: 'Majibu ya haraka ya maswali ya kawaida zaidi kuhusu huduma zetu.',
            items: [
                { q: 'Dar hadi Lubumbashi inachukua muda gani?', a: 'Kawaida siku 5–7 kulingana na hali ya mpakani na aina ya mizigo. Tunatoa masasisho ya wakati halisi kwa wakati wote.' },
                { q: 'Je, mnashughulikia nyaraka za forodha?', a: 'Ndio — tunasimamia vibali vyote vya usafiri, nyaraka za uzingatifu wa COMESA/SADC na nyaraka za forodha kwa kila njia.' },
                { q: 'Je, ninaweza kufuatilia mizigo yangu kwa wakati halisi?', a: 'Ndio. Kila gari lina ufuatiliaji wa GPS. Unaweza kufuata mizigo yako kwenye lango la mteja wetu au kupokea masasisho ya SMS.' },
                { q: 'Mnabeba aina gani za mizigo?', a: 'Bidhaa za jumla, vifaa vya viwanda, mizigo ya baridi, mizigo ya nje ya kawaida, na vifaa hatari (na vibali sahihi).' },
            ],
        },
    },
};

const translations = { en, sw };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        try { return localStorage.getItem('lang') || 'en'; } catch { return 'en'; }
    });

    useEffect(() => {
        try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, T: translations[lang] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
