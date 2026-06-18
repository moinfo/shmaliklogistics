import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, Switch } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useCan } from '../../../lib/can';

// One read-only guarantor row with its documents and (optional) house address.
function GuarantorRow({ g, driverId, idTypes, isDark, canDelete }) {
    const textPri = isDark ? '#E2E8F0' : '#1E293B';
    const textSec = isDark ? 'var(--c-text-secondary)' : '#64748B';
    const divider = isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0';
    const chipBg  = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const remove = () => {
        if (confirm(`Remove guarantor ${g.name}?`)) {
            router.delete(`/system/drivers/${driverId}/guarantors/${g.id}`, { preserveScroll: true });
        }
    };

    const DocLink = ({ url, label }) => url
        ? <Box component="a" href={url} target="_blank" rel="noreferrer" style={{ color: '#60A5FA', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>{label} ↗</Box>
        : <Text size="xs" style={{ color: isDark ? 'var(--c-text-muted)' : '#94A3B8' }}>{label}: —</Text>;

    return (
        <Box style={{ border: `1px solid ${divider}`, borderRadius: 12, padding: '14px 16px', background: chipBg }}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={4} style={{ minWidth: 0 }}>
                    <Group gap="sm" wrap="wrap">
                        <Text fw={700} size="sm" style={{ color: textPri }}>{g.name}</Text>
                        {g.owns_house && (
                            <Box style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: 20, padding: '2px 10px' }}>
                                <Text size="xs" fw={700} style={{ color: '#22C55E' }}>🏠 Mwenye nyumba</Text>
                            </Box>
                        )}
                    </Group>
                    <Text size="xs" style={{ color: textSec }}>📞 {g.phone} · {g.address}</Text>
                    <Text size="xs" style={{ color: textSec }}>{idTypes[g.id_type] ?? g.id_type}: <b>{g.id_number}</b></Text>
                    {g.owns_house && g.house_address && (
                        <Text size="xs" style={{ color: textSec }}>🏠 Anuani ya nyumba: {g.house_address}</Text>
                    )}
                    <Group gap="md" mt={4}>
                        <DocLink url={g.id_doc_url} label="Kitambulisho" />
                        <DocLink url={g.letter_doc_url} label="Barua" />
                    </Group>
                </Stack>
                {canDelete && (
                    <Box component="button" onClick={remove}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12, padding: '2px 6px', opacity: 0.75, flexShrink: 0 }}>
                        ✕ Ondoa
                    </Box>
                )}
            </Group>
        </Box>
    );
}

export default function DriverGuarantorsCard({ driver, summary, idTypes, max }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#0F1E32' : '#ffffff';
    const cardBorder = isDark ? 'var(--c-border-color)' : '#E2E8F0';
    const textPri    = isDark ? '#E2E8F0' : '#1E293B';
    const textSec    = isDark ? 'var(--c-text-secondary)' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const can = useCan();
    const canEdit = can('drivers.edit');
    const canDelete = can('drivers.delete');

    const guarantors = driver.guarantors ?? [];
    const full = summary.slots_left <= 0;

    const idRef = useRef();
    const letterRef = useRef();
    const blank = { name: '', phone: '', address: '', id_type: 'nida', id_number: '', owns_house: false, house_address: '' };
    const [form, setForm] = useState(blank);
    const [idFile, setIdFile] = useState(null);
    const [letterFile, setLetterFile] = useState(null);
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState({});
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const submit = () => {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, k === 'owns_house' ? (v ? 1 : 0) : v));
        if (idFile) fd.append('id_doc', idFile);
        if (letterFile) fd.append('letter_doc', letterFile);
        setBusy(true);
        router.post(`/system/drivers/${driver.id}/guarantors`, fd, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setForm(blank); setIdFile(null); setLetterFile(null); setErrors({});
                if (idRef.current) idRef.current.value = '';
                if (letterRef.current) letterRef.current.value = '';
            },
            onError: (e) => setErrors(e),
            onFinish: () => setBusy(false),
        });
    };

    const inputStyles = {
        label: { color: textSec, fontSize: 13, marginBottom: 4 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` },
    };

    // Status banner reflecting the business rule (driver->guarantorsSummary()).
    const banner = summary.is_complete
        ? { bg: 'rgba(34,197,94,0.12)', bd: 'rgba(34,197,94,0.3)', c: '#22C55E', text: `✓ Masharti yamekamilika — wadhamini ${summary.count}/${max}, mwenye nyumba yupo.` }
        : { bg: 'rgba(245,158,11,0.12)', bd: 'rgba(245,158,11,0.3)', c: '#F59E0B',
            text: summary.count === 0
                ? '⚠ Hakuna mdhamini bado. Ongeza angalau mmoja, na mmoja wao awe na nyumba.'
                : (!summary.has_homeowner
                    ? `⚠ Wadhamini ${summary.count}/${max} — lakini hakuna mwenye nyumba. Ongeza/weka mdhamini mmoja kuwa mwenye nyumba.`
                    : `⚠ Wadhamini ${summary.count}/${max}.`) };

    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #0E7490, #06B6D4)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group justify="space-between">
                    <Text fw={700} size="sm" style={{ color: textPri }}>🤝 Wadhamini (Guarantors)</Text>
                    <Text size="xs" fw={700} style={{ color: textSec }}>{summary.count}/{max}</Text>
                </Group>
            </Box>

            <Box style={{ padding: 20 }}>
                <Box style={{ background: banner.bg, border: `1px solid ${banner.bd}`, borderRadius: 10, padding: '8px 14px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: banner.c }}>{banner.text}</Text>
                </Box>

                <Stack gap="sm">
                    {guarantors.length === 0
                        ? <Text size="sm" style={{ color: textSec }}>Bado hakuna wadhamini waliosajiliwa.</Text>
                        : guarantors.map(g => (
                            <GuarantorRow key={g.id} g={g} driverId={driver.id} idTypes={idTypes} isDark={isDark} canDelete={canDelete} />
                        ))}
                </Stack>

                {canEdit && !full && (
                    <Box style={{ borderTop: `1px solid ${divider}`, marginTop: 18, paddingTop: 16 }}>
                        <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>Ongeza Mdhamini</Text>
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                            <TextInput label="Jina" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} styles={inputStyles} />
                            <TextInput label="Namba ya simu" value={form.phone} onChange={e => set('phone', e.target.value)} error={errors.phone} styles={inputStyles} />
                            <TextInput label="Anuani (Address)" value={form.address} onChange={e => set('address', e.target.value)} error={errors.address} styles={inputStyles} />
                            <Select label="Aina ya kitambulisho" value={form.id_type} onChange={v => set('id_type', v || 'nida')} allowDeselect={false}
                                data={Object.entries(idTypes).map(([k, v]) => ({ value: k, label: v }))} styles={inputStyles} />
                            <TextInput label="Namba ya kitambulisho" value={form.id_number} onChange={e => set('id_number', e.target.value)} error={errors.id_number} styles={inputStyles} />
                            <Box>
                                <Text size="13px" style={{ color: textSec, marginBottom: 4 }}>Ana nyumba?</Text>
                                <Switch checked={form.owns_house} onChange={e => set('owns_house', e.currentTarget.checked)}
                                    label={form.owns_house ? 'Ndiyo, ana nyumba' : 'Hapana'} color="teal" styles={{ label: { color: textSec, fontSize: 13 } }} />
                            </Box>
                            {form.owns_house && (
                                <TextInput label="Anuani ya nyumba aliyojenga" value={form.house_address} onChange={e => set('house_address', e.target.value)}
                                    error={errors.house_address} styles={inputStyles} />
                            )}
                        </SimpleGrid>

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="sm">
                            <Box>
                                <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>Scan ya kitambulisho</Text>
                                <Box style={{ background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '8px 12px' }}>
                                    <input ref={idRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setIdFile(e.target.files[0] || null)}
                                        style={{ width: '100%', fontSize: 12, color: textSec, background: 'none', border: 'none', outline: 'none' }} />
                                </Box>
                                {errors.id_doc && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>{errors.id_doc}</Text>}
                            </Box>
                            <Box>
                                <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>Barua ya udhamini</Text>
                                <Box style={{ background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '8px 12px' }}>
                                    <input ref={letterRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setLetterFile(e.target.files[0] || null)}
                                        style={{ width: '100%', fontSize: 12, color: textSec, background: 'none', border: 'none', outline: 'none' }} />
                                </Box>
                                {errors.letter_doc && <Text size="xs" style={{ color: '#EF4444', marginTop: 4 }}>{errors.letter_doc}</Text>}
                            </Box>
                        </SimpleGrid>

                        <Group justify="flex-end" mt="md">
                            <motion.div whileTap={{ scale: 0.97 }}>
                                <Box component="button" type="button" onClick={submit} disabled={busy}
                                    style={{ padding: '9px 22px', borderRadius: 8, border: 'none', cursor: busy ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #0E7490, #06B6D4)', color: '#fff', fontWeight: 700, fontSize: 14, opacity: busy ? 0.7 : 1 }}>
                                    {busy ? 'Inahifadhi…' : '+ Ongeza Mdhamini'}
                                </Box>
                            </motion.div>
                        </Group>
                    </Box>
                )}

                {full && (
                    <Text size="xs" style={{ color: textSec, marginTop: 14 }}>Umefikia kiwango cha juu cha wadhamini {max}.</Text>
                )}
            </Box>
        </Box>
    );
}