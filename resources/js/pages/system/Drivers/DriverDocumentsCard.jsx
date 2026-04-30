import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';

function DocStatus({ path, label, expiry, isDark, onDelete }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#E2E8F0' : '#1E293B';

    let expiryColor = textPri;
    let expiryDisplay = null;
    if (expiry) {
        const days = Math.floor((new Date(expiry) - new Date()) / 86400000);
        expiryDisplay = new Date(expiry).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' });
        if (days < 0)        { expiryDisplay += ' — EXPIRED';        expiryColor = '#EF4444'; }
        else if (days <= 30) { expiryDisplay += ` — ${days}d left`;  expiryColor = '#F59E0B'; }
        else                 { expiryColor = '#22C55E'; }
    }

    return (
        <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={2}>
                <Text size="xs" fw={700} style={{ color: textSec, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Text>
                {path ? (
                    <Group gap="xs">
                        <Text size="xs" style={{ color: '#22C55E' }}>✓ Uploaded</Text>
                        <Box component="a" href={`/storage/${path}`} target="_blank" rel="noreferrer"
                            style={{ color: '#60A5FA', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>View ↗</Box>
                    </Group>
                ) : (
                    <Text size="xs" style={{ color: isDark ? '#475569' : '#94A3B8' }}>Not uploaded</Text>
                )}
                {expiryDisplay && (
                    <Text size="xs" fw={600} style={{ color: expiryColor }}>{expiryDisplay}</Text>
                )}
            </Stack>
            {path && (
                <Box component="button" onClick={onDelete}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12, padding: '2px 6px', opacity: 0.7, flexShrink: 0, marginTop: 2 }}>
                    ✕ Remove
                </Box>
            )}
        </Group>
    );
}

export default function DriverDocumentsCard({ driver }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#0F1E32' : '#ffffff';
    const cardBorder = isDark ? 'var(--c-border-color)' : '#E2E8F0';
    const textPri    = isDark ? '#E2E8F0' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const divider    = isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const licRef = useRef();
    const visRef = useRef();
    const [licFile, setLicFile] = useState(null);
    const [visFile, setVisFile] = useState(null);
    const [visaExpiry, setVisaExpiry] = useState(
        driver.visa_expiry ? new Date(driver.visa_expiry).toISOString().slice(0, 10) : ''
    );
    const [busy, setBusy] = useState({ lic: false, vis: false });

    const uploadLicense = () => {
        if (!licFile) return;
        const fd = new FormData();
        fd.append('file', licFile);
        setBusy(p => ({ ...p, lic: true }));
        router.post(`/system/drivers/${driver.id}/documents/license`, fd, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => { setBusy(p => ({ ...p, lic: false })); setLicFile(null); if (licRef.current) licRef.current.value = ''; },
        });
    };

    const uploadVisa = () => {
        const fd = new FormData();
        if (visFile) fd.append('file', visFile);
        if (visaExpiry) fd.append('visa_expiry', visaExpiry);
        setBusy(p => ({ ...p, vis: true }));
        router.post(`/system/drivers/${driver.id}/documents/visa`, fd, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => { setBusy(p => ({ ...p, vis: false })); setVisFile(null); if (visRef.current) visRef.current.value = ''; },
        });
    };

    const deleteDoc = (type) => {
        if (confirm('Remove this document?')) {
            router.delete(`/system/drivers/${driver.id}/documents/${type}`, { preserveScroll: true });
        }
    };

    const btnBase = {
        padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', border: 'none', transition: 'opacity 0.15s',
    };

    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ height: 3, background: 'linear-gradient(90deg, #7C3AED, #A855F7)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Text fw={700} size="sm" style={{ color: textPri }}>🛂 Documents</Text>
            </Box>

            <SimpleGrid cols={{ base: 1, sm: 2 }} style={{ padding: '20px' }} spacing="xl">
                {/* Driving Licence */}
                <Stack gap="md">
                    <DocStatus
                        label="Driving Licence" path={driver.license_doc_path}
                        isDark={isDark} onDelete={() => deleteDoc('license')} />

                    <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 12 }}>
                        <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 8 }}>Upload Licence Document</Text>
                        <Stack gap="sm">
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 10, background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '8px 12px' }}>
                                <input ref={licRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                                    style={{ flex: 1, fontSize: 12, color: textSec, background: 'none', border: 'none', outline: 'none' }}
                                    onChange={e => setLicFile(e.target.files[0] || null)} />
                            </Box>
                            {licFile && (
                                <Text size="xs" style={{ color: '#60A5FA' }}>
                                    Selected: {licFile.name} ({(licFile.size / 1024).toFixed(0)} KB)
                                </Text>
                            )}
                            <motion.div whileTap={{ scale: 0.97 }}>
                                <Box component="button" type="button" onClick={uploadLicense}
                                    disabled={!licFile || busy.lic}
                                    style={{ ...btnBase, background: licFile && !busy.lic ? 'linear-gradient(135deg, #1565C0, #2196F3)' : (isDark ? 'rgba(255,255,255,0.07)' : '#E2E8F0'), color: licFile && !busy.lic ? '#fff' : (isDark ? '#475569' : '#94A3B8'), width: '100%', textAlign: 'center', opacity: busy.lic ? 0.6 : 1 }}>
                                    {busy.lic ? 'Uploading…' : '↑ Upload Licence'}
                                </Box>
                            </motion.div>
                        </Stack>
                    </Box>
                </Stack>

                {/* Visa */}
                <Stack gap="md">
                    <DocStatus
                        label="Visa / Work Permit" path={driver.visa_doc_path}
                        expiry={driver.visa_expiry} isDark={isDark}
                        onDelete={() => deleteDoc('visa')} />

                    <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 12 }}>
                        <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 8 }}>Upload Visa Document</Text>
                        <Stack gap="sm">
                            <Box>
                                <Text size="xs" style={{ color: textSec, marginBottom: 4 }}>Expiry Date</Text>
                                <Box style={{ background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '2px 4px' }}>
                                    <input type="date" value={visaExpiry}
                                        onChange={e => setVisaExpiry(e.target.value)}
                                        style={{ width: '100%', background: 'none', border: 'none', outline: 'none', padding: '6px 8px', fontSize: 13, color: textPri }} />
                                </Box>
                            </Box>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: 10, background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '8px 12px' }}>
                                <input ref={visRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                                    style={{ flex: 1, fontSize: 12, color: textSec, background: 'none', border: 'none', outline: 'none' }}
                                    onChange={e => setVisFile(e.target.files[0] || null)} />
                            </Box>
                            {visFile && (
                                <Text size="xs" style={{ color: '#60A5FA' }}>
                                    Selected: {visFile.name} ({(visFile.size / 1024).toFixed(0)} KB)
                                </Text>
                            )}
                            <motion.div whileTap={{ scale: 0.97 }}>
                                <Box component="button" type="button" onClick={uploadVisa}
                                    disabled={(!visFile && !visaExpiry) || busy.vis}
                                    style={{ ...btnBase, background: (visFile || visaExpiry) && !busy.vis ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : (isDark ? 'rgba(255,255,255,0.07)' : '#E2E8F0'), color: (visFile || visaExpiry) && !busy.vis ? '#fff' : (isDark ? '#475569' : '#94A3B8'), width: '100%', textAlign: 'center', opacity: busy.vis ? 0.6 : 1 }}>
                                    {busy.vis ? 'Saving…' : '↑ Save Visa Details'}
                                </Box>
                            </motion.div>
                        </Stack>
                    </Box>
                </Stack>
            </SimpleGrid>
        </Box>
    );
}
