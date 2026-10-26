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
        tagline: 'With Hustles and Prayers We\'ll Reach Our Destination. Reliable, cost-effective logistics across East and Central Africa.',
        quickLinks: 'Quick Links', services: 'Services', activeRoutes: 'Active Routes',
        copyright: '© 2026 Trans-Mas Logistics Company Limited. All rights reserved.',
        privacy: 'Privacy Policy',
    },
    home: {
        quickStats: 'Quick Stats',
        slides: [
            { badge: 'With Hustles and Prayers We\'ll Reach Our Destination', title: 'Moving Your Cargo', highlight: 'Across Africa', desc: 'Reliable, efficient, and cost-effective transportation from Handeni, Tanzania to Zambia, DRC and beyond — with real-time tracking and full cost visibility on every trip.', features: ['GPS Fleet Tracking', 'Border Permit Management', 'Real-Time Cost Reporting'] },
            { badge: 'Trans-Mas Logistics Company Limited', title: 'Track Every Shipment', highlight: 'From Loading to Delivery', desc: 'Full cargo visibility with GPS tracking and live status updates. Your clients know exactly where their goods are — without calling the office.', features: ['Live GPS Location', 'Customer Self-Service Portal', 'Automated SMS Alerts'] },
            { badge: 'Road Freight · Cargo Handling · Last-Mile Delivery', title: 'Border Crossings', highlight: 'Made Simple', desc: 'We handle all transit permits, customs documentation and border logistics for Zambia and the DRC — professionally managed without third-party reliance.', features: ['Transit Permits Handled', 'COMESA/SADC Compliance', 'Expiry Date Alerts'] },
            { badge: 'Based in Handeni, Tanzania', title: 'A Fleet You Can', highlight: 'Rely On', desc: 'Well-maintained Scania trucks, experienced and trained drivers — ensuring safe and timely delivery across all routes with regular maintenance and safety checks.', features: ['Scheduled Maintenance Alerts', 'Experienced Drivers', 'Fuel Cost Monitoring'] },
        ],
        stats: [
            { icon: '🚛', value: '550K+', label: 'Shipments Completed' },
            { icon: '🌍', value: '20+', label: 'Clients Served' },
            { icon: '⭐', value: '1000+', label: 'Testimonials' },
            { icon: '✅', value: '24/7', label: 'Customer Support' },
        ],
        whyUs: {
            badge: 'Why Trans-Mas', title: 'Logistics Built on', highlight: 'Trust & Excellence',
            desc: 'Trans-Mas Logistics Company Limited is a reliable and customer-focused logistics company based in Handeni, Tanzania. We provide efficient, secure, and cost-effective transportation solutions tailored to meet the needs of modern businesses.',
            imageBadge: '🏆 Trusted across East Africa', imageSubBadge: 'Tanzania · Zambia · DRC',
            items: [
                { icon: '🚀', title: 'Fast & Reliable Deliveries', desc: 'Our operations are designed to minimize delays through efficient planning, coordinated execution, and strong communication. We ensure goods arrive on time and in perfect condition.' },
                { icon: '🌍', title: 'Global Network & Coverage', desc: 'Our growing network allows us to expand our services and support clients as their business reaches new markets. We continuously strengthen connections for wider coverage.' },
                { icon: '📡', title: 'Advanced Tracking Technology', desc: 'We utilize tracking methods that allow us to monitor the movement of goods, ensuring better coordination and timely deliveries across all routes.' },
                { icon: '📞', title: '24/7 Customer Support', desc: 'Our team acts quickly and efficiently to resolve any issues, minimizing disruptions. Our staff is trained and experienced in handling logistics operations with precision.' },
            ],
        },
        services: {
            badge: 'What We Do', title: 'Our', highlight: 'Core Services',
            desc: 'Reliable, efficient, and cost-effective logistics solutions for East and Central African trade routes.',
            items: [
                { icon: '🚛', title: 'Road Freight Transportation', desc: 'We provide reliable and efficient road freight services for the safe movement of goods across local and regional routes. We handle every shipment with professionalism and care, whether small or large consignments.', features: ['Full Truck Load (FTL)', 'Part Load (LTL)', 'Local & regional routes', 'Safety-first operations'] },
                { icon: '📦', title: 'Cargo Handling & Clearing', desc: 'We offer professional cargo handling services, ensuring goods are carefully managed during loading, unloading, and storage. Our clearing services include documentation assistance and customs coordination to reduce delays.', features: ['Loading & unloading supervision', 'Secure storage', 'Customs documentation', 'Regulatory compliance'] },
                { icon: '📍', title: 'Last-Mile Delivery Solutions', desc: 'Our last-mile delivery service ensures that goods reach their final destination quickly and efficiently. We focus on timely and accurate delivery to customers, businesses, and end users.', features: ['Timely final delivery', 'Business & residential delivery', 'Customer satisfaction focus', 'Real-time status updates'] },
                { icon: '📡', title: 'GPS Fleet Tracking', desc: 'Real-time location of every vehicle, accessible from any device. Know exactly where your cargo is at all times.', features: ['Live map view', 'Trip history & replay', 'Fuel monitoring', 'Geofence alerts'] },
                { icon: '🛂', title: 'Border & Customs', desc: 'End-to-end permit management for all border crossing points — with expiry alerts before documents lapse.', features: ['Transit permits', 'COMESA/SADC compliance', 'Customs documentation', 'Expiry tracking'] },
                { icon: '🤝', title: 'Customer Portal', desc: 'Clients track shipments and download invoices themselves — reducing support calls to zero.', features: ['Self-service tracking', 'Invoice downloads', 'Trip history', 'SMS notifications'] },
            ],
        },
        routes: {
            badge: 'Where We Operate', title: 'Our', highlight: 'Active Routes',
            desc: 'Regular departures on all major corridors from Handeni, Tanzania.',
            hub: '🇹🇿 Handeni, Tanzania Hub', hubSub: '· Origin of all routes',
            from: 'From', to: 'To', distance: 'Distance', transit: 'Transit',
            items: [
                { from: 'Handeni, Tanzania', to: 'Lubumbashi', country: 'DRC', flag: '🇨🇩', distance: '~2,100 km', time: '5–7 days' },
                { from: 'Handeni, Tanzania', to: 'Lusaka', country: 'Zambia', flag: '🇿🇲', distance: '~1,900 km', time: '4–6 days' },
                { from: 'Handeni, Tanzania', to: 'Lilongwe', country: 'Malawi', flag: '🇲🇼', distance: '~1,400 km', time: '3–5 days' },
                { from: 'Handeni, Tanzania', to: 'Maputo', country: 'Mozambique', flag: '🇲🇿', distance: '~2,200 km', time: '5–7 days' },
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
            desc: 'We are ready to support your logistics needs with reliable and efficient solutions. Get in touch with us today to discuss how we can help move your business forward.',
            contacts: [
                { icon: '📞', label: 'Phone / WhatsApp', value: '+255 652 373 434', sub: 'Call or WhatsApp anytime' },
                { icon: '📧', label: 'Email Us', value: 'info@transmaslogistics.co.tz', sub: 'We reply within 2 hours' },
                { icon: '📍', label: 'Location', value: 'Handeni, Tanzania', sub: 'Main operations base' },
            ],
        },
    },
    services: {
        hero: { badge: 'What We Offer', title: 'Our', highlight: 'Services', desc: 'Full-spectrum logistics built for East and Central African trade routes — from a single truck to a full fleet.' },
        highlights: [
            { value: '550K+', label: 'Shipments', icon: '🚛' },
            { value: '1000+', label: 'Testimonials', icon: '⭐' },
            { value: '20+', label: 'Clients', icon: '🤝' },
            { value: '24/7', label: 'Support Available', icon: '📞' },
        ],
        items: [
            { icon: '🚛', title: 'Road Freight Transportation', desc: 'We provide reliable and efficient road freight services for the safe movement of goods across local and regional routes. Our transportation solutions ensure timely delivery while maintaining the highest standards of safety and cargo protection.', features: ['Full Truck Load (FTL)', 'Part Load (LTL)', 'Local & regional routes', 'Safety & cargo protection', 'Professional handling'] },
            { icon: '📦', title: 'Cargo Handling & Clearing', desc: 'We offer professional cargo handling services, ensuring goods are carefully managed during loading, unloading, and storage. Our clearing services include documentation assistance and coordination to facilitate smooth customs processes.', features: ['Loading & unloading management', 'Secure storage solutions', 'Customs documentation', 'Regulatory compliance', 'Delay reduction'] },
            { icon: '📍', title: 'Last-Mile Delivery Solutions', desc: 'Our last-mile delivery service ensures that goods reach their final destination quickly and efficiently. We focus on timely and accurate delivery to customers, businesses, and end users, providing dependable solutions.', features: ['Final destination delivery', 'Business & residential', 'On-time accuracy', 'Customer satisfaction', 'Real-time updates'] },
            { icon: '📡', title: 'GPS Fleet Tracking', desc: 'Real-time location of every vehicle on the road, accessible from any device. Know exactly where your cargo is at all times.', features: ['Live map view', 'Trip history & replay', 'Fuel monitoring', 'Geofence alerts', 'Driver behaviour monitoring'] },
            { icon: '🛂', title: 'Border & Customs', desc: 'End-to-end permit and customs documentation management for all border crossing points — with expiry alerts before documents lapse.', features: ['Transit permits', 'COMESA/SADC compliance', 'Customs documentation', 'Expiry date tracking', 'Border crossing planning'] },
            { icon: '🤝', title: 'Customer Portal', desc: 'Your clients log in to track shipments, download invoices and view trip history — reducing support calls to zero.', features: ['Self-service shipment tracking', 'Invoice downloads', 'Trip & payment history', 'SMS/email notifications', 'Document access'] },
        ],
        cta: { title: 'Ready to Get Started?', desc: 'Contact us for a free quote on your next shipment. No hidden fees — ever.' },
    },
    about: {
        hero: {
            badge: 'Who We Are', title: 'About', highlight: 'Trans-Mas', title2: 'Logistics',
            desc: 'TRANS-MAS LOGISTICS COMPANY LIMITED is a reliable and customer-focused logistics company based in Handeni, Tanzania. We provide efficient, secure, and cost-effective transportation solutions tailored to meet the needs of modern businesses.',
            stats: [
                { value: '550K+', label: 'Shipments', icon: '🚛' }, { value: '20+', label: 'Clients', icon: '🤝' },
                { value: '1000+', label: 'Testimonials', icon: '⭐' }, { value: '24/7', label: 'Support', icon: '📞' },
            ],
        },
        story: {
            badge: 'Our Story', title: 'Built for', highlight: "Africa's Trade Routes",
            imageBadge: '📍 Based in Handeni, Tanzania',
            imageSubBadge: 'Serving Tanzania · Zambia · DRC',
            paragraphs: [
                'TRANS-MAS LOGISTICS COMPANY LIMITED is a reliable and customer-focused logistics company established in Handeni, Tanzania. We provide efficient, secure, and cost-effective transportation solutions tailored to meet the needs of modern businesses.',
                'We operate routes connecting Tanzania to neighboring countries including Zambia and the Democratic Republic of Congo (DRC), with a fleet of well-maintained Scania trucks managed by experienced and trained drivers. We have worked with established companies such as Hornest Expeditors, African Queen Logistics, and Transfreight Logistics.',
                'With Hustles and Prayers We\'ll Reach Our Destination — we are committed to delivering excellence and building long-term partnerships through reliable and professional logistics services.',
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
                { year: '2020', title: 'Company Founded', desc: 'Trans-Mas Logistics Company Limited established in Handeni, Tanzania, with a focus on road freight to Zambia and DRC.' },
                { year: '2021', title: 'Fleet Expanded', desc: 'Fleet grew to 20+ vehicles. Added Zambia and Malawi routes to regular operations.' },
                { year: '2023', title: 'Technology Integrated', desc: 'GPS tracking, fuel sensors, and digital operations management rolled out across the fleet.' },
                { year: '2025', title: 'Digital Platform', desc: 'Customer portal and route profitability system launched — giving clients full shipment visibility.' },
                { year: '2026', title: 'Full ERP System', desc: 'Complete logistics management system — 29 modules covering all operations from trips to HR.' },
            ],
        },
        team: {
            badge: 'Our Team', title: 'The People Behind', highlight: 'Every Delivery',
            items: [
                { role: 'CEO', name: 'Mohammed Ahmed', icon: '👔', desc: 'Leading Trans-Mas Logistics with vision and dedication, driving the company\'s mission to become a leading logistics provider in East Africa.' },
                { role: 'Head of Accounts', name: 'Salim Hilal', icon: '📊', desc: 'Managing financial operations and ensuring full cost transparency for clients across all logistics operations.' },
                { role: 'Head of IT', name: 'Towfiq Seif', icon: '💻', desc: 'Leading technology and digital systems, maintaining the tracking platform, client portal and IT infrastructure that keep operations running smoothly.' },
                { role: 'Customer Service', name: 'Support Team', icon: '📞', desc: 'Available 24/7 to answer client queries, provide real-time cargo updates and ensure smooth operations for every shipment.' },
            ],
        },
    },
    privacy: {
        hero: {
            badge: "Legal",
            title: "Privacy",
            highlight: "Policy",
            desc: "How Trans-Mas Logistics collects, uses and protects your information on our website and in our mobile app.",
            updated: "Last updated: 26 October 2026",
        },
        toc: "On this page",
        intro: "Your privacy matters to us. This policy explains what information Trans-Mas Logistics Company Limited (\"Trans-Mas\", \"we\", \"us\") collects when you visit our website or use our mobile app, why we collect it, how we protect it, and the choices you have. By using our website or app you agree to the practices described here.",
        sections: [
            {
                title: "Who we are",
                paras: [
                    "Trans-Mas Logistics Company Limited is a road-freight and logistics company based in Handeni, Tanzania (TIN 187-839-823). We are the party responsible for the personal information described in this policy.",
                ],
            },
            {
                title: "Information we collect",
                paras: ["Depending on how you use our services, we may collect the following:"],
                items: [
                    "Account details: your name, email address, phone number, role and the credentials you use to sign in. Drivers may also have a licence or card ID on record.",
                    "Operational records: trips, vehicles, cargo, inspections, check-ins, fuel and expense entries, receipts and documents you upload.",
                    "Location: the GPS position of your device at the moment you record a trip check-in or a vehicle inspection (see \"Mobile app permissions\").",
                    "Business and staff records: client contact details, quotes, invoices and payments; for staff, employment, leave, payroll and bank details that are managed by authorised personnel.",
                    "Website enquiries: the name, email, phone number and message you send through our contact form.",
                    "Technical data: device type, app version, IP address and basic logs needed to keep the service secure and working.",
                ],
            },
            {
                title: "Mobile app permissions",
                paras: ["Our app asks for permissions only for the features that need them, and you can change them at any time in your phone settings."],
                items: [
                    "Location: used to stamp check-ins and inspections with where they happened. We read your location when you record one; the app does not track you continuously in the background.",
                    "Fingerprint / Face ID: lets you sign in faster. Your biometric data is handled only by your phone\'s operating system; we never receive or store it. If you turn on biometric sign-in, your sign-in details are kept in your device\'s encrypted secure storage (Android Keystore / iOS Keychain).",
                    "Photos and files: used only when you choose to attach a receipt, contract or document.",
                    "Internet and network status: needed to load your data and to tell you when you are offline.",
                ],
            },
            {
                title: "How we use your information",
                items: [
                    "To provide and operate the platform: trips, fleet, billing, payroll and reporting.",
                    "To verify your identity and keep accounts secure.",
                    "To record where and when check-ins and inspections take place, for safety and accountability.",
                    "To prepare quotes, invoices and shipping or customs documents for our clients.",
                    "To respond to your enquiries and provide support.",
                    "To maintain, secure and improve our website and app, and to meet legal obligations.",
                ],
            },
            {
                title: "Cookies and local storage",
                paras: [
                    "Our website uses a session cookie that keeps you signed in and protects forms from forgery. It also remembers your language and light/dark preferences in your browser. We do not use advertising or cross-site tracking cookies. Some pages load images from third-party services such as Unsplash, and our app may download fonts from Google Fonts, which means those providers can see your IP address when the content loads.",
                ],
            },
            {
                title: "Who we share information with",
                paras: ["We do not sell your personal information. We share it only when necessary:"],
                items: [
                    "With our clients, for the shipments, quotes and invoices that concern them.",
                    "With border, customs and transport authorities, where required to move cargo legally.",
                    "With trusted service providers (for example hosting and email) who process data on our behalf and are bound to protect it.",
                    "With the authorities, when the law requires it or to protect our rights and safety.",
                ],
            },
            {
                title: "Data security",
                paras: [
                    "We protect information with encrypted connections (HTTPS), token-based sign-in, role-based permissions so people only see what their job requires, and secure storage on your device. No system is completely secure, so please keep your password private and tell us right away if you suspect misuse of your account.",
                ],
            },
            {
                title: "How long we keep information",
                paras: [
                    "We keep information only as long as needed for the purposes above and to meet accounting, tax, employment and legal record-keeping requirements. When it is no longer needed it is deleted or anonymised.",
                ],
            },
            {
                title: "Your rights",
                paras: ["In line with Tanzania\'s Personal Data Protection Act, 2022, you may ask us to:"],
                items: [
                    "Tell you what personal information we hold about you and give you a copy.",
                    "Correct information that is inaccurate or incomplete.",
                    "Delete your information, where we are not required to keep it.",
                    "Stop or limit certain uses, and withdraw consent you have given.",
                ],
                after: "To make a request, contact us using the details below. We may need to verify your identity first. You also have the right to complain to the Personal Data Protection Commission of Tanzania.",
            },
            {
                title: "Children\'s privacy",
                paras: ["Our services are intended for businesses and adults. We do not knowingly collect personal information from anyone under 18."],
            },
            {
                title: "Changes to this policy",
                paras: ["We may update this policy from time to time. The date at the top shows when it was last changed, and significant changes will be highlighted on our website or in the app."],
            },
            {
                title: "Contact us",
                paras: ["Questions or requests about this policy or your information:"],
                contact: [
                    { icon: "📧", text: "info@transmaslogistics.co.tz" },
                    { icon: "📞", text: "+255 652 373 434" },
                    { icon: "📍", text: "Trans-Mas Logistics Company Limited, Handeni, Tanzania" },
                ],
            },
        ],
    },
    contact: {
        hero: { badge: 'Get In Touch', title: "Let's", highlight: 'Move Your Cargo', desc: 'We are ready to support your logistics needs with reliable and efficient solutions. Get in touch with us today to discuss how we can help move your business forward.' },
        cards: [
            { icon: '📍', label: 'Address', value: 'Handeni, Tanzania', sub: 'Main operations base' },
            { icon: '📞', label: 'Phone / WhatsApp', value: '+255 652 373 434', sub: 'Call or WhatsApp anytime' },
            { icon: '📧', label: 'Email', value: 'info@transmaslogistics.co.tz', sub: 'We reply within 2 hours' },
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
        tagline: 'Kwa Bidii na Maombi Tutafikia Marudio Yetu. Usafirishaji wa kuaminika na bei nafuu Afrika Mashariki na Kati.',
        quickLinks: 'Viungo vya Haraka', services: 'Huduma', activeRoutes: 'Njia Zinazofanya Kazi',
        copyright: '© 2026 Trans-Mas Logistics Company Limited. Haki zote zimehifadhiwa.',
        privacy: 'Sera ya Faragha',
    },
    home: {
        quickStats: 'Takwimu za Haraka',
        slides: [
            { badge: 'Kwa Bidii na Maombi Tutafikia Marudio Yetu', title: 'Kusafirisha Mizigo Yako', highlight: 'Kote Afrika', desc: 'Usafirishaji wa kuaminika, bora na wa bei nafuu kutoka Handeni, Tanzania hadi Zambia, DRC na zaidi — na ufuatiliaji wa wakati halisi na uonekani kamili wa gharama kwa kila safari.', features: ['Ufuatiliaji wa GPS', 'Usimamizi wa Vibali vya Mpakani', 'Ripoti ya Gharama ya Wakati Halisi'] },
            { badge: 'Trans-Mas Logistics Company Limited', title: 'Fuatilia Kila Usafirishaji', highlight: 'Kutoka Kupakia Hadi Kutoa', desc: 'Uonekani kamili wa mizigo na ufuatiliaji wa GPS. Wateja wako wanajua hasa wapi bidhaa zao zipo — bila kupiga simu ofisini.', features: ['Mahali pa GPS kwa Wakati Halisi', 'Lango la Mteja la Kujisaidia', 'Arifa za SMS za Kiotomatiki'] },
            { badge: 'Usafirishaji · Ushughulikiaji wa Mizigo · Utoaji', title: 'Kuvuka Mipaka', highlight: 'Imefanywa Rahisi', desc: 'Tunashughulikia vibali vyote vya usafiri, nyaraka za forodha na usimamizi wa mipaka kwa Zambia na DRC — inayosimamiwa kitaalamu bila kutegemea washirika wa nje.', features: ['Vibali vya Usafiri Vimeshughulikiwa', 'Uzingatifu wa COMESA/SADC', 'Arifa za Tarehe ya Kuisha'] },
            { badge: 'Makao Makuu Handeni, Tanzania', title: 'Gari Unaloweza', highlight: 'Kuitegemea', desc: 'Malori ya Scania yaliyodumishwa vizuri, madereva wenye uzoefu na mafunzo — kuhakikisha utoaji salama na wa wakati kwenye njia zote na ukaguzi wa matengenezo mara kwa mara.', features: ['Arifa za Matengenezo Yaliyopangwa', 'Madereva Wenye Uzoefu', 'Ufuatiliaji wa Gharama za Mafuta'] },
        ],
        stats: [
            { icon: '🚛', value: '550K+', label: 'Usafirishaji Uliokamilika' },
            { icon: '🌍', value: '20+', label: 'Wateja Wanaohudumika' },
            { icon: '⭐', value: '1000+', label: 'Maoni ya Wateja' },
            { icon: '✅', value: '24/7', label: 'Msaada wa Wateja' },
        ],
        whyUs: {
            badge: 'Kwa Nini Trans-Mas', title: 'Usafirishaji Uliojengwa kwa', highlight: 'Uwazi na Uaminifu',
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
            desc: 'Kuondoka mara kwa mara kwenye njia kuu zote kutoka Handeni, Tanzania.',
            hub: '🇹🇿 Kitovu cha Handeni, Tanzania', hubSub: '· Chanzo cha njia zote',
            from: 'Kutoka', to: 'Kwenda', distance: 'Umbali', transit: 'Wakati wa Usafiri',
            items: [
                { from: 'Handeni, Tanzania', to: 'Lubumbashi', country: 'DRC', flag: '🇨🇩', distance: '~2,100 km', time: 'Siku 5–7' },
                { from: 'Handeni, Tanzania', to: 'Lusaka', country: 'Zambia', flag: '🇿🇲', distance: '~1,900 km', time: 'Siku 4–6' },
                { from: 'Handeni, Tanzania', to: 'Lilongwe', country: 'Malawi', flag: '🇲🇼', distance: '~1,400 km', time: 'Siku 3–5' },
                { from: 'Handeni, Tanzania', to: 'Maputo', country: 'Mozambique', flag: '🇲🇿', distance: '~2,200 km', time: 'Siku 5–7' },
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
            desc: 'Tuko tayari kusaidia mahitaji yako ya usafirishaji na suluhisho za kuaminika na bora. Wasiliana nasi leo kujadili jinsi tunavyoweza kusaidia biashara yako kusonga mbele.',
            contacts: [
                { icon: '📞', label: 'Simu / WhatsApp', value: '+255 652 373 434', sub: 'Piga simu au WhatsApp wakati wowote' },
                { icon: '📧', label: 'Tutumie Barua Pepe', value: 'info@transmaslogistics.co.tz', sub: 'Tunajibu ndani ya masaa 2' },
                { icon: '📍', label: 'Mahali', value: 'Handeni, Tanzania', sub: 'Kituo kikuu cha uendeshaji' },
            ],
        },
    },
    services: {
        hero: { badge: 'Tunachokutoa', title: 'Huduma', highlight: 'Zetu', desc: 'Usafirishaji wa wigo kamili uliojengwa kwa njia za biashara Afrika Mashariki na Kati — kutoka lori moja hadi gari zima.' },
        highlights: [
            { value: '550K+', label: 'Usafirishaji', icon: '🚛' },
            { value: '1000+', label: 'Maoni ya Wateja', icon: '⭐' },
            { value: '20+', label: 'Wateja', icon: '🤝' },
            { value: '24/7', label: 'Msaada Unapatikana', icon: '📞' },
        ],
        items: [
            { icon: '🚛', title: 'Usafirishaji wa Barabara', desc: 'Usafirishaji wa mzigo kamili na sehemu kwenye njia kuu — Handeni, Tanzania hadi DRC, Zambia na zaidi.', features: ['Mzigo Kamili wa Lori (FTL)', 'Mzigo wa Sehemu (LTL)', 'Mizigo ya baridi', 'Mizigo mizito na kubwa', 'Vifaa hatari'] },
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
            badge: 'Sisi ni Nani', title: 'Kuhusu', highlight: 'Trans-Mas', title2: 'Logistics',
            desc: 'TRANS-MAS LOGISTICS COMPANY LIMITED ni kampuni ya usafirishaji ya kuaminika na inayozingatia wateja, iliyoko Handeni, Tanzania. Tunatoa usafirishaji bora, salama, na wa bei nafuu.',
            stats: [
                { value: '550K+', label: 'Usafirishaji', icon: '🚛' }, { value: '20+', label: 'Wateja', icon: '🤝' },
                { value: '1000+', label: 'Maoni', icon: '⭐' }, { value: '24/7', label: 'Msaada', icon: '📞' },
            ],
        },
        story: {
            badge: 'Hadithi Yetu', title: 'Imejengwa kwa', highlight: 'Njia za Biashara za Afrika',
            imageBadge: '📍 Makao Makuu Handeni, Tanzania',
            imageSubBadge: 'Inahudumia Tanzania · Zambia · DRC',
            paragraphs: [
                'TRANS-MAS LOGISTICS COMPANY LIMITED ni kampuni ya usafirishaji ya kuaminika na inayozingatia wateja iliyoanzishwa Handeni, Tanzania. Tunatoa usafirishaji bora, salama, na wa bei nafuu ulioundwa kukidhi mahitaji ya biashara za kisasa.',
                'Tunafanya kazi kwenye njia zinazounganisha Tanzania na nchi jirani ikiwa ni pamoja na Zambia na Jamhuri ya Kidemokrasia ya Congo (DRC), na gari la malori ya Scania yaliyodumishwa vizuri yanayosimamiwa na madereva wenye uzoefu. Tumefanya kazi na makampuni kama Hornest Expeditors, African Queen Logistics, na Transfreight Logistics.',
                'Kwa Bidii na Maombi Tutafikia Marudio Yetu — tumejitolea kutoa ubora na kujenga ushirikiano wa muda mrefu kupitia huduma za usafirishaji za kuaminika na za kitaalamu.',
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
                { year: '2020', title: 'Kampuni Ilianzishwa', desc: 'Trans-Mas Logistics Company Limited ilianzishwa Handeni, Tanzania, ikiwa na lengo la usafirishaji wa barabara hadi Zambia na DRC.' },
                { year: '2021', title: 'Gari Lipanuliwa', desc: 'Gari lilikua hadi magari 20+. Njia za Zambia na Malawi ziliongezwa kwenye shughuli za kawaida.' },
                { year: '2023', title: 'Teknolojia Iliunganishwa', desc: 'Ufuatiliaji wa GPS, sensaa za mafuta, na usimamizi wa shughuli za kidijitali vilienezwa kwa gari zote.' },
                { year: '2025', title: 'Jukwaa la Kidijitali', desc: 'Lango la mteja na mfumo wa faida ya njia vilizinduliwa — kuwapa wateja uonekani kamili wa mizigo.' },
                { year: '2026', title: 'Mfumo Kamili wa ERP', desc: 'Mfumo kamili wa usimamizi wa usafirishaji — moduli 29 zinazoshughulikia shughuli zote kutoka safari hadi HR.' },
            ],
        },
        team: {
            badge: 'Timu Yetu', title: 'Watu Nyuma ya', highlight: 'Kila Utoaji',
            items: [
                { role: 'Mkurugenzi Mtendaji', name: 'Mohammed Ahmed', icon: '👔', desc: 'Kuongoza Trans-Mas Logistics kwa maono na kujitolea, akiendesha dhamira ya kampuni kuwa mtoaji mkuu wa usafirishaji Afrika Mashariki.' },
                { role: 'Mkuu wa Hesabu', name: 'Salim Hilal', icon: '📊', desc: 'Kusimamia shughuli za kifedha na kuhakikisha uwazi kamili wa gharama kwa wateja katika shughuli zote za usafirishaji.' },
                { role: 'Mkuu wa TEHAMA', name: 'Towfiq Seif', icon: '💻', desc: 'Kuongoza teknolojia na mifumo ya kidijitali, kudumisha jukwaa la ufuatiliaji, lango la mteja na miundombinu ya TEHAMA inayofanya shughuli ziende vizuri.' },
                { role: 'Huduma kwa Wateja', name: 'Timu ya Msaada', icon: '📞', desc: 'Inapatikana masaa 24/7 kujibu maswali ya wateja, kutoa masasisho ya mizigo kwa wakati halisi na kuhakikisha shughuli laini.' },
            ],
        },
    },
    privacy: {
        hero: {
            badge: "Kisheria",
            title: "Sera ya",
            highlight: "Faragha",
            desc: "Jinsi Trans-Mas Logistics inavyokusanya, kutumia na kulinda taarifa zako kwenye tovuti yetu na kwenye programu yetu ya simu.",
            updated: "Imesasishwa mwisho: 26 Oktoba 2026",
        },
        toc: "Kwenye ukurasa huu",
        intro: "Faragha yako ni muhimu kwetu. Sera hii inaeleza ni taarifa gani Trans-Mas Logistics Company Limited (\"Trans-Mas\", \"sisi\") hukusanya unapotembelea tovuti yetu au kutumia programu yetu ya simu, kwa nini tunazikusanya, jinsi tunavyozilinda, na chaguo ulizonazo. Kwa kutumia tovuti au programu yetu unakubali taratibu zilizoelezwa hapa.",
        sections: [
            {
                title: "Sisi ni nani",
                paras: [
                    "Trans-Mas Logistics Company Limited ni kampuni ya usafirishaji wa mizigo kwa barabara yenye makao yake Handeni, Tanzania (TIN 187-839-823). Sisi ndio tunaowajibika kwa taarifa binafsi zinazoelezwa kwenye sera hii.",
                ],
            },
            {
                title: "Taarifa tunazokusanya",
                paras: ["Kulingana na jinsi unavyotumia huduma zetu, tunaweza kukusanya yafuatayo:"],
                items: [
                    "Taarifa za akaunti: jina lako, barua pepe, namba ya simu, wadhifa na taarifa unazotumia kuingia. Madereva wanaweza pia kuwa na leseni au namba ya kitambulisho kwenye kumbukumbu.",
                    "Kumbukumbu za uendeshaji: safari, magari, mizigo, ukaguzi, kuripoti safari (check-ins), mafuta na matumizi, risiti na nyaraka unazopakia.",
                    "Mahali: nafasi ya GPS ya kifaa chako wakati unaporekodi check-in ya safari au ukaguzi wa gari (tazama \"Ruhusa za programu ya simu\").",
                    "Kumbukumbu za biashara na wafanyakazi: mawasiliano ya wateja, nukuu, ankara na malipo; kwa wafanyakazi, taarifa za ajira, likizo, mishahara na benki zinazosimamiwa na watumishi walioidhinishwa.",
                    "Maswali kupitia tovuti: jina, barua pepe, namba ya simu na ujumbe unaotuma kupitia fomu ya mawasiliano.",
                    "Taarifa za kiufundi: aina ya kifaa, toleo la programu, anwani ya IP na kumbukumbu za msingi zinazohitajika kuweka huduma salama na kufanya kazi.",
                ],
            },
            {
                title: "Ruhusa za programu ya simu",
                paras: ["Programu yetu huomba ruhusa kwa huduma zinazozihitaji tu, na unaweza kuzibadilisha wakati wowote kwenye mipangilio ya simu yako."],
                items: [
                    "Mahali: hutumika kuweka alama ya mahali check-in na ukaguzi vilipofanyika. Tunasoma mahali ulipo unaporekodi moja; programu haikufuatilii mfululizo nyuma ya pazia.",
                    "Alama ya kidole / Face ID: hukuwezesha kuingia haraka. Taarifa zako za kibayometriki zinashughulikiwa na mfumo wa uendeshaji wa simu yako pekee; sisi hatuzipokei wala kuzihifadhi. Ukiwasha kuingia kwa kibayometriki, taarifa zako za kuingia huhifadhiwa kwenye hifadhi salama iliyosimbwa ya kifaa chako (Android Keystore / iOS Keychain).",
                    "Picha na faili: hutumika tu unapochagua kuambatisha risiti, mkataba au nyaraka.",
                    "Intaneti na hali ya mtandao: zinahitajika kupakia data yako na kukujulisha unapokuwa nje ya mtandao.",
                ],
            },
            {
                title: "Jinsi tunavyotumia taarifa zako",
                items: [
                    "Kutoa na kuendesha jukwaa: safari, magari, malipo, mishahara na ripoti.",
                    "Kuthibitisha utambulisho wako na kuweka akaunti salama.",
                    "Kurekodi mahali na wakati check-in na ukaguzi unapofanyika, kwa usalama na uwajibikaji.",
                    "Kuandaa nukuu, ankara na nyaraka za usafirishaji au forodha kwa wateja wetu.",
                    "Kujibu maswali yako na kutoa msaada.",
                    "Kudumisha, kulinda na kuboresha tovuti na programu yetu, na kutimiza wajibu wa kisheria.",
                ],
            },
            {
                title: "Vidakuzi na hifadhi ya ndani",
                paras: [
                    "Tovuti yetu hutumia kidakuzi cha kikao (session) kinachokuweka umeingia na kulinda fomu dhidi ya udanganyifu. Pia hukumbuka lugha na mwonekano wako (mwanga/giza) kwenye kivinjari chako. Hatutumii vidakuzi vya matangazo wala vya kufuatilia kati ya tovuti. Baadhi ya kurasa hupakia picha kutoka huduma za wengine kama Unsplash, na programu yetu inaweza kupakua fonti kutoka Google Fonts, hivyo watoa huduma hao wanaweza kuona anwani yako ya IP maudhui yanapopakiwa.",
                ],
            },
            {
                title: "Tunashiriki taarifa na nani",
                paras: ["Hatuuzi taarifa zako binafsi. Tunazishiriki pale tu inapobidi:"],
                items: [
                    "Na wateja wetu, kwa shehena, nukuu na ankara zinazowahusu.",
                    "Na mamlaka za mipakani, forodha na usafirishaji, inapohitajika kusafirisha mizigo kisheria.",
                    "Na watoa huduma tunaowaamini (mfano mwenyeji wa mtandao na barua pepe) wanaochakata data kwa niaba yetu na wanaofungwa kuilinda.",
                    "Na mamlaka, pale sheria inapotutaka au kulinda haki na usalama wetu.",
                ],
            },
            {
                title: "Usalama wa data",
                paras: [
                    "Tunalinda taarifa kwa miunganisho iliyosimbwa (HTTPS), kuingia kwa tokeni, ruhusa kulingana na majukumu ili kila mtu aone kinachohusu kazi yake tu, na hifadhi salama kwenye kifaa chako. Hakuna mfumo ulio salama kabisa, kwa hiyo tafadhali linda nenosiri lako na utujulishe mara moja ukishuku matumizi mabaya ya akaunti yako.",
                ],
            },
            {
                title: "Muda tunaohifadhi taarifa",
                paras: [
                    "Tunahifadhi taarifa kwa muda unaohitajika tu kwa madhumuni yaliyotajwa na kutimiza mahitaji ya uhasibu, kodi, ajira na utunzaji wa kumbukumbu za kisheria. Zisipohitajika tena, hufutwa au kufanywa zisitambulike.",
                ],
            },
            {
                title: "Haki zako",
                paras: ["Kwa mujibu wa Sheria ya Ulinzi wa Taarifa Binafsi ya Tanzania ya mwaka 2022, unaweza kutuomba:"],
                items: [
                    "Kukueleza ni taarifa gani binafsi tunazo kuhusu wewe na kukupa nakala.",
                    "Kusahihisha taarifa zisizo sahihi au pungufu.",
                    "Kufuta taarifa zako, pale ambapo hatulazimiki kuzitunza.",
                    "Kusimamisha au kupunguza matumizi fulani, na kuondoa ridhaa uliyotoa.",
                ],
                after: "Kuwasilisha ombi, wasiliana nasi kwa njia zilizo hapa chini. Huenda tukahitaji kuthibitisha utambulisho wako kwanza. Pia una haki ya kulalamika kwa Tume ya Ulinzi wa Taarifa Binafsi ya Tanzania.",
            },
            {
                title: "Faragha ya watoto",
                paras: ["Huduma zetu zimelenga biashara na watu wazima. Hatukusanyi kwa makusudi taarifa binafsi za mtu yeyote aliye chini ya miaka 18."],
            },
            {
                title: "Mabadiliko ya sera hii",
                paras: ["Tunaweza kusasisha sera hii mara kwa mara. Tarehe iliyo juu inaonyesha ilipobadilishwa mara ya mwisho, na mabadiliko makubwa yataangaziwa kwenye tovuti yetu au kwenye programu."],
            },
            {
                title: "Wasiliana nasi",
                paras: ["Maswali au maombi kuhusu sera hii au taarifa zako:"],
                contact: [
                    { icon: "📧", text: "info@transmaslogistics.co.tz" },
                    { icon: "📞", text: "+255 652 373 434" },
                    { icon: "📍", text: "Trans-Mas Logistics Company Limited, Handeni, Tanzania" },
                ],
            },
        ],
    },
    contact: {
        hero: { badge: 'Wasiliana Nasi', title: 'Hebu', highlight: 'Tusafirisha Mizigo Yako', desc: 'Tuko tayari kusaidia mahitaji yako ya usafirishaji na suluhisho za kuaminika na bora. Wasiliana nasi leo kujadili jinsi tunavyoweza kusaidia biashara yako kusonga mbele.' },
        cards: [
            { icon: '📍', label: 'Anwani', value: 'Handeni, Tanzania', sub: 'Kituo kikuu cha uendeshaji' },
            { icon: '📞', label: 'Simu / WhatsApp', value: '+255 652 373 434', sub: 'Piga simu au WhatsApp wakati wowote' },
            { icon: '📧', label: 'Barua Pepe', value: 'info@transmaslogistics.co.tz', sub: 'Tunajibu ndani ya masaa 2' },
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
