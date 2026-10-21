import { Head, Link } from '@inertiajs/react';
import { Box, Container, Title, Text, Stack, Badge, List, Anchor } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import WebsiteLayout from '../../layouts/WebsiteLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const EMAIL = 'info@shmaliklogistics.co.tz';
const PHONE = '+255 652 373 434';

const content = {
    en: {
        badge: 'Legal',
        title: 'Privacy Policy',
        updated: 'Last updated: 21 October 2026',
        intro: 'SH Malik Logistics Company Limited ("SH Malik", "we", "us") respects your privacy. This policy explains what personal data we collect, why we collect it, how we protect it and what rights you have. It applies to our website (shmaliklogistics.co.tz), our management system and customer portal, and the SH Malik Logistics mobile app for drivers, staff and customers. We process personal data in line with the Personal Data Protection Act, 2022 of Tanzania.',
        sections: [
            {
                h: '1. Who we are',
                p: ['SH Malik Logistics Company Limited is a freight and logistics company based in Handeni, Tanzania, operating cross-border routes from Tanzania to Zambia, DRC, Malawi and Mozambique. We are the data controller for the personal data described in this policy.'],
            },
            {
                h: '2. Information we collect',
                p: ['Depending on how you use our services, we may collect:'],
                l: [
                    'Account information: name, email address, phone number, role, profile photo and encrypted password.',
                    'Customer information: company name, TIN, contact details, quote requests, cargo and shipment details, invoices and payment records.',
                    'Driver and employee information: licence and identification details, employment and payroll records, guarantor details, next-of-kin and bank details, as needed for HR and compliance.',
                    'Location data: with your permission, the GPS location of the device when a driver records a check-in or a vehicle inspection.',
                    'Photos and files: images and documents you choose to upload, such as expense receipts, inspection photos and vehicle or cargo documents.',
                    'Biometric sign-in: if you enable Face ID or fingerprint login, verification is done by your device. We do not receive or store your fingerprint or face data.',
                    'Technical data: IP address, device and browser type, and usage logs, used for security and troubleshooting.',
                    'Messages: information you send through our contact form or by email or WhatsApp.',
                ],
            },
            {
                h: '3. How we use your information',
                l: [
                    'To provide freight, tracking and cargo services and to manage trips, vehicles, drivers and permits.',
                    'To prepare quotes, proforma and tax invoices, record payments and keep financial records.',
                    'To run payroll, leave and other HR processes for our employees and drivers.',
                    'To verify driver check-ins and vehicle inspections for safety and accountability.',
                    'To authenticate users, prevent fraud and secure our systems.',
                    'To respond to enquiries and send service notifications about your shipments and documents.',
                    'To meet legal, tax, customs and regulatory obligations.',
                ],
            },
            {
                h: '4. Location data',
                p: ['The mobile app asks for location permission only to attach the position of a check-in or inspection to its record. You can refuse or withdraw this permission in your device settings; some driver features that require a location may then be unavailable. We do not sell location data.'],
            },
            {
                h: '5. Sharing your information',
                p: ['We do not sell your personal data. We share it only when necessary:'],
                l: [
                    'With customers, for the shipments and invoices that concern them.',
                    'With customs, border, tax and other authorities where the law or a border crossing requires it.',
                    'With service providers who help us operate, such as hosting, email, SMS and WhatsApp messaging, who may process data only on our instructions.',
                    'With professional advisers, or in a business transfer, subject to confidentiality.',
                    'When required by law or to protect our rights, people or property.',
                ],
            },
            {
                h: '6. Data security and storage',
                p: ['We use access controls based on roles and permissions, encrypted connections (HTTPS), hashed passwords and secure on-device storage for sign-in tokens. No system is completely secure, but we work to protect your data against loss, misuse and unauthorised access. Our servers and service providers may be located outside your country; where this happens we take steps to protect your data.'],
            },
            {
                h: '7. Retention',
                p: ['We keep personal data only as long as needed for the purposes above and to meet legal, tax and accounting requirements. Financial and shipment records are normally kept for the period required by Tanzanian law, after which they are deleted or anonymised.'],
            },
            {
                h: '8. Your rights',
                p: ['Subject to applicable law, you may ask us to:'],
                l: [
                    'Access the personal data we hold about you.',
                    'Correct inaccurate or incomplete data.',
                    'Delete your data, where we are not required to keep it.',
                    'Object to or restrict certain processing, or withdraw consent you have given.',
                ],
                after: `To exercise these rights, contact us at ${EMAIL}. You may also complain to the Personal Data Protection Commission of Tanzania.`,
            },
            {
                h: '9. Children',
                p: ['Our services are for businesses and adults. We do not knowingly collect personal data from children under 18.'],
            },
            {
                h: '10. Cookies and local storage',
                p: ['The website stores small items in your browser, such as your language and light/dark preference, and uses session cookies to keep you signed in and protect forms. We do not use these for advertising.'],
            },
            {
                h: '11. Third-party links',
                p: ['Our site may link to other websites or messaging services (for example WhatsApp). We are not responsible for their privacy practices.'],
            },
            {
                h: '12. Changes to this policy',
                p: ['We may update this policy from time to time. The date at the top shows when it was last changed. Significant changes will be notified on our website or in the app.'],
            },
            {
                h: '13. Contact us',
                p: [`SH Malik Logistics Company Limited, Handeni, Tanzania`, `Email: ${EMAIL}`, `Phone: ${PHONE}`],
            },
        ],
    },
    sw: {
        badge: 'Kisheria',
        title: 'Sera ya Faragha',
        updated: 'Imesasishwa mwisho: 21 Oktoba 2026',
        intro: 'SH Malik Logistics Company Limited ("SH Malik", "sisi") tunaheshimu faragha yako. Sera hii inaeleza ni taarifa binafsi gani tunazokusanya, kwa nini, jinsi tunavyozilinda na haki ulizonazo. Inahusu tovuti yetu (shmaliklogistics.co.tz), mfumo wetu wa usimamizi na lango la wateja, pamoja na programu ya simu ya SH Malik Logistics kwa madereva, wafanyakazi na wateja. Tunachakata taarifa binafsi kwa mujibu wa Sheria ya Ulinzi wa Taarifa Binafsi ya mwaka 2022 ya Tanzania.',
        sections: [
            {
                h: '1. Sisi ni nani',
                p: ['SH Malik Logistics Company Limited ni kampuni ya usafirishaji na usafirishaji wa mizigo yenye makao yake Handeni, Tanzania, inayofanya safari za kuvuka mipaka kutoka Tanzania kwenda Zambia, DRC, Malawi na Msumbiji. Sisi ndio wadhibiti wa taarifa binafsi zilizoelezwa katika sera hii.'],
            },
            {
                h: '2. Taarifa tunazokusanya',
                p: ['Kulingana na jinsi unavyotumia huduma zetu, tunaweza kukusanya:'],
                l: [
                    'Taarifa za akaunti: jina, barua pepe, namba ya simu, jukumu, picha ya wasifu na nenosiri lililosimbwa.',
                    'Taarifa za mteja: jina la kampuni, TIN, mawasiliano, maombi ya bei, maelezo ya mizigo na safari, ankara na rekodi za malipo.',
                    'Taarifa za madereva na wafanyakazi: leseni na vitambulisho, rekodi za ajira na mishahara, taarifa za wadhamini, ndugu wa karibu na akaunti za benki, kadri inavyohitajika kwa rasilimali watu na kufuata sheria.',
                    'Taarifa za eneo: kwa idhini yako, eneo la GPS la kifaa dereva anaporekodi kuwasili (check-in) au ukaguzi wa gari.',
                    'Picha na mafaili: picha na nyaraka unazochagua kupakia, kama risiti za matumizi, picha za ukaguzi na nyaraka za gari au mizigo.',
                    'Kuingia kwa biometriki: ukiwasha Face ID au alama ya kidole, uthibitisho hufanywa na kifaa chako. Hatupokei wala kuhifadhi alama ya kidole au taarifa za uso wako.',
                    'Taarifa za kiufundi: anwani ya IP, aina ya kifaa na kivinjari, na kumbukumbu za matumizi kwa usalama na utatuzi wa matatizo.',
                    'Ujumbe: taarifa unazotuma kupitia fomu ya mawasiliano, barua pepe au WhatsApp.',
                ],
            },
            {
                h: '3. Jinsi tunavyotumia taarifa zako',
                l: [
                    'Kutoa huduma za usafirishaji, ufuatiliaji wa mizigo na kusimamia safari, magari, madereva na vibali.',
                    'Kuandaa nukuu, ankara za proforma na za kodi, kurekodi malipo na kutunza kumbukumbu za fedha.',
                    'Kuendesha mishahara, likizo na michakato mingine ya rasilimali watu kwa wafanyakazi na madereva wetu.',
                    'Kuthibitisha kuwasili na ukaguzi wa magari kwa usalama na uwajibikaji.',
                    'Kuthibitisha watumiaji, kuzuia udanganyifu na kulinda mifumo yetu.',
                    'Kujibu maswali yako na kutuma arifa za huduma kuhusu mizigo na nyaraka zako.',
                    'Kutimiza wajibu wa kisheria, kodi, forodha na udhibiti.',
                ],
            },
            {
                h: '4. Taarifa za eneo',
                p: ['Programu ya simu huomba ruhusa ya eneo kwa ajili ya kuambatanisha mahali pa kuwasili au ukaguzi na rekodi husika tu. Unaweza kukataa au kuondoa ruhusa hii kwenye mipangilio ya kifaa chako; baadhi ya huduma za dereva zinazohitaji eneo zinaweza kutopatikana. Hatuuzi taarifa za eneo.'],
            },
            {
                h: '5. Kushiriki taarifa zako',
                p: ['Hatuuzi taarifa zako binafsi. Tunazishiriki pale tu inapobidi:'],
                l: [
                    'Na wateja, kwa mizigo na ankara zinazowahusu.',
                    'Na mamlaka za forodha, mipaka, kodi na nyingine pale sheria au kuvuka mpaka kunapohitaji.',
                    'Na watoa huduma wanaotusaidia kuendesha shughuli zetu, kama huduma za mwenyeji wa mfumo, barua pepe, SMS na WhatsApp, ambao wanaruhusiwa kuchakata taarifa kwa maelekezo yetu tu.',
                    'Na washauri wa kitaalamu, au wakati wa uhamisho wa biashara, kwa usiri.',
                    'Inapohitajika kisheria au kulinda haki, watu au mali zetu.',
                ],
            },
            {
                h: '6. Usalama na uhifadhi wa taarifa',
                p: ['Tunatumia udhibiti wa ufikiaji kulingana na majukumu na ruhusa, miunganisho iliyosimbwa (HTTPS), manenosiri yaliyofichwa na hifadhi salama ya vitufe vya kuingia kwenye kifaa. Hakuna mfumo salama kwa asilimia 100, lakini tunajitahidi kulinda taarifa zako dhidi ya kupotea, matumizi mabaya na ufikiaji usioruhusiwa. Seva na watoa huduma wetu wanaweza kuwa nje ya nchi yako; hilo likitokea tunachukua hatua za kulinda taarifa zako.'],
            },
            {
                h: '7. Muda wa kuhifadhi',
                p: ['Tunahifadhi taarifa binafsi kwa muda unaohitajika kwa madhumuni yaliyotajwa na kutimiza mahitaji ya kisheria, kodi na uhasibu. Rekodi za fedha na mizigo kwa kawaida huhifadhiwa kwa kipindi kinachotakiwa na sheria za Tanzania, kisha hufutwa au kufanywa zisitambulike.'],
            },
            {
                h: '8. Haki zako',
                p: ['Kwa mujibu wa sheria husika, unaweza kutuomba:'],
                l: [
                    'Kuona taarifa binafsi tulizonazo kukuhusu.',
                    'Kusahihisha taarifa zisizo sahihi au pungufu.',
                    'Kufuta taarifa zako, pale ambapo hatulazimiki kuzihifadhi.',
                    'Kupinga au kuzuia uchakataji fulani, au kuondoa ridhaa uliyotoa.',
                ],
                after: `Ili kutumia haki hizi, wasiliana nasi kupitia ${EMAIL}. Pia unaweza kuwasilisha malalamiko kwa Tume ya Ulinzi wa Taarifa Binafsi ya Tanzania.`,
            },
            {
                h: '9. Watoto',
                p: ['Huduma zetu ni kwa biashara na watu wazima. Hatukusanyi kwa makusudi taarifa binafsi za watoto walio chini ya miaka 18.'],
            },
            {
                h: '10. Vidakuzi na hifadhi ya ndani',
                p: ['Tovuti huhifadhi vitu vidogo kwenye kivinjari chako, kama lugha na hali ya mwanga/giza uliyochagua, na hutumia vidakuzi vya kikao kukuweka umeingia na kulinda fomu. Hatuvitumii kwa matangazo.'],
            },
            {
                h: '11. Viungo vya nje',
                p: ['Tovuti yetu inaweza kuwa na viungo vya tovuti au huduma nyingine za ujumbe (kama WhatsApp). Hatuwajibiki kwa taratibu zao za faragha.'],
            },
            {
                h: '12. Mabadiliko ya sera hii',
                p: ['Tunaweza kusasisha sera hii mara kwa mara. Tarehe ya juu inaonyesha ilipobadilishwa mara ya mwisho. Mabadiliko makubwa yatatangazwa kwenye tovuti au programu.'],
            },
            {
                h: '13. Wasiliana nasi',
                p: [`SH Malik Logistics Company Limited, Handeni, Tanzania`, `Barua pepe: ${EMAIL}`, `Simu: ${PHONE}`],
            },
        ],
    },
};

export default function PrivacyPolicy() {
    const { lang } = useLanguage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const c = content[lang] ?? content.en;

    return (
        <WebsiteLayout>
            <Head title={`${c.title} — SH Malik Logistics`} />

            <Box
                style={{
                    background: isDark ? 'linear-gradient(135deg, #0A1628 0%, #0E4FA0 100%)' : 'linear-gradient(135deg, #FCF8F6 0%, #FCE9E9 100%)',
                }}
                pt={110} pb={50}
            >
                <Container size="md">
                    <Stack align="center" gap="sm">
                        <Badge color="brand.2" variant="light" size="lg" radius="xl">{c.badge}</Badge>
                        <Title order={1} ta="center" c={isDark ? 'white' : '#0A1628'} style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900 }}>
                            {c.title}
                        </Title>
                        <Text size="sm" c={isDark ? 'gray.4' : 'gray.7'}>{c.updated}</Text>
                    </Stack>
                </Container>
            </Box>

            <Container size="md" py={50}>
                <Stack gap="xl">
                    <Text lh={1.8}>{c.intro}</Text>

                    {c.sections.map((s) => (
                        <Stack key={s.h} gap="xs">
                            <Title order={3} c={isDark ? 'white' : '#0A1628'}>{s.h}</Title>
                            {s.p?.map((t) => (
                                <Text key={t} lh={1.8}>
                                    {t.includes(EMAIL)
                                        ? <>{t.split(EMAIL)[0]}<Anchor href={`mailto:${EMAIL}`}>{EMAIL}</Anchor></>
                                        : t}
                                </Text>
                            ))}
                            {s.l && (
                                <List spacing="xs" lh={1.7}>
                                    {s.l.map((i) => <List.Item key={i}>{i}</List.Item>)}
                                </List>
                            )}
                            {s.after && <Text lh={1.8}>{s.after}</Text>}
                        </Stack>
                    ))}
                </Stack>
            </Container>
        </WebsiteLayout>
    );
}
