import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Tooltip, ActionIcon, TextInput, PasswordInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import DriverDocumentsCard from './DriverDocumentsCard';
import { useCan } from '../../../lib/can';
import { formatDate } from '../../../lib/date';

function SectionCard({ title, icon, children, isDark, accent, toolbar }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Group gap={8}>
                    {icon && <Text size="md">{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
                {toolbar}
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function InfoRow({ icon, label, value, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color: textPri, textAlign: 'right' }}>{value ?? '—'}</Text>
        </Box>
    );
}

function DocRow({ label, date, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    let display = '—';
    let color = textPri;
    if (date) {
        const days = Math.floor((new Date(date) - new Date()) / 86400000);
        display = new Date(date).toLocaleDateString('en-TZ', { day: '2-digit', month: 'short', year: 'numeric' });
        if (days < 0)        { display += ' (EXPIRED)';       color = '#EF4444'; }
        else if (days <= 30) { display += ` (${days}d left)`; color = '#F59E0B'; }
        else                 { color = '#22C55E'; }
    }
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8}>
                <Text size="sm">📅</Text>
                <Text size="sm" style={{ color: textSec }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color, textAlign: 'right' }}>{display}</Text>
        </Box>
    );
}

function DriverAvatar({ name, photoUrl, size = 96, onClick }) {
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    if (photoUrl) {
        return (
            <Box
                component="img"
                src={photoUrl}
                alt={name}
                onClick={onClick}
                title="Click to view full image"
                style={{
                    width: size, height: size, borderRadius: '50%',
                    objectFit: 'cover', objectPosition: 'center top',
                    flexShrink: 0,
                    border: `3px solid ${color}60`,
                    boxShadow: `0 6px 20px ${color}40`,
                    cursor: onClick ? 'zoom-in' : 'default',
                    transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { if (onClick) e.currentTarget.style.transform = 'scale(1)'; }}
            />
        );
    }
    const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `3px solid ${color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 20px ${color}40` }}>
            <Text c={color} fw={900} style={{ fontSize: size * 0.32, letterSpacing: 0.5 }}>{initials}</Text>
        </Box>
    );
}

function PhotoLightbox({ src, alt, onClose }) {
    if (!src) return null;
    return (
        <Box
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20, cursor: 'zoom-out',
                backdropFilter: 'blur(4px)',
            }}
        >
            <Box
                component="img"
                src={src}
                alt={alt}
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '90vw', maxHeight: '90vh',
                    borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    cursor: 'default',
                }}
            />
            <Box
                onClick={onClose}
                style={{
                    position: 'absolute', top: 20, right: 24,
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 22, fontWeight: 700, cursor: 'pointer',
                }}
            >×</Box>
        </Box>
    );
}

export default function ShowDriver({ driver, trips, statuses, licenseClasses, availableVehicles, vehicleStatuses, vehicleTypeIcons }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();
    const [assignVehicleId, setAssignVehicleId] = useState(driver.vehicle?.id ? String(driver.vehicle.id) : null);
    const can = useCan();

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const meta  = statuses[driver.status] ?? { label: driver.status, color: '#94A3B8' };
    const flash = props.flash ?? {};

    const vehicle = driver.vehicle;
    const vMeta   = vehicle ? (vehicleStatuses?.[vehicle.status] ?? { label: vehicle.status, color: '#94A3B8' }) : null;
    const vIcon   = vehicle ? (vehicleTypeIcons?.[vehicle.type] ?? '🚗') : null;

    const confirmDelete = () => {
        if (window.confirm(`Remove ${driver.name} from the system?`)) {
            router.delete(`/system/drivers/${driver.id}`);
        }
    };

    const doAssignVehicle = () => {
        router.patch(`/system/drivers/${driver.id}/vehicle`, { vehicle_id: assignVehicleId ?? null });
    };

    const [photoOpen, setPhotoOpen] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoUploading(true);
        const form = new FormData();
        form.append('photo', file);
        form.append('_method', 'POST');
        router.post(`/system/drivers/${driver.id}/photo`, form, {
            preserveScroll: true,
            forceFormData: true,
            onFinish: () => { setPhotoUploading(false); e.target.value = ''; },
        });
    };

    const [accountEmail, setAccountEmail] = useState(driver.email ?? '');
    const [accountPassword, setAccountPassword] = useState('');
    const [accountErrors, setAccountErrors] = useState({});
    const [accountProcessing, setAccountProcessing] = useState(false);

    const createAccount = () => {
        setAccountProcessing(true);
        router.post(`/system/drivers/${driver.id}/account`, { email: accountEmail, password: accountPassword }, {
            preserveScroll: true,
            onSuccess: () => { setAccountErrors({}); setAccountPassword(''); },
            onError:   (err) => { setAccountErrors(err); },
            onFinish:  () => { setAccountProcessing(false); },
        });
    };

    const revokeAccount = () => {
        if (!window.confirm(`Revoke ${driver.user?.email}'s login access? The user account will be deleted.`)) return;
        router.delete(`/system/drivers/${driver.id}/account`, { preserveScroll: true });
    };

    return (
        <DashboardLayout title={driver.name}>
            <Head title={driver.name} />

            {/* Flash */}
            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            {/* ── Hero header banner ── */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 240, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={14} align="center">
                            {/* Avatar with upload button */}
                            <Box style={{ position: 'relative', flexShrink: 0 }}>
                                <DriverAvatar
                                    name={driver.name}
                                    photoUrl={driver.photo_url}
                                    size={64}
                                    onClick={driver.photo_url ? () => setPhotoOpen(true) : undefined}
                                />
                                {can('drivers.edit') && (
                                    <Tooltip label="Upload photo" position="bottom">
                                        <Box
                                            component="label"
                                            htmlFor="driver-photo-input"
                                            style={{
                                                position: 'absolute', bottom: 2, right: 2,
                                                width: 22, height: 22, borderRadius: '50%',
                                                background: 'rgba(255,255,255,0.9)',
                                                border: '2px solid rgba(194,65,12,0.5)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: photoUploading ? 'wait' : 'pointer',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                            }}
                                        >
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                <polyline points="17 8 12 3 7 8"/>
                                                <line x1="12" y1="3" x2="12" y2="15"/>
                                            </svg>
                                        </Box>
                                    </Tooltip>
                                )}
                                <input
                                    id="driver-photo-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    style={{ display: 'none' }}
                                    onChange={handlePhotoUpload}
                                    disabled={photoUploading}
                                />
                            </Box>

                            <Stack gap={3}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white" style={{ letterSpacing: 0.3 }}>{driver.name}</Text>
                                    <Box style={{ background: meta.color + '30', border: `1px solid ${meta.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                        <Group gap={5} align="center">
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
                                            <Text size="xs" fw={700} style={{ color: '#fff' }}>{meta.label}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Text size="sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{driver.phone}</Text>
                            </Stack>
                        </Group>

                        <Group gap={8} wrap="wrap">
                            {can('drivers.edit') && (
                                <Select
                                    value={driver.status}
                                    onChange={s => router.patch(`/system/drivers/${driver.id}/status`, { status: s })}
                                    data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                                    size="sm"
                                    styles={{
                                        input: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 10, width: 150, backdropFilter: 'blur(8px)' },
                                        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` },
                                    }}
                                />
                            )}
                            {can('drivers.edit') && (
                                <Box component={Link} href={`/system/drivers/${driver.id}/edit`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                    ✏️ Edit
                                </Box>
                            )}
                            {can('drivers.delete') && (
                                <Tooltip label="Remove driver">
                                    <ActionIcon onClick={confirmDelete} size={38}
                                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, color: '#FCA5A5' }}>
                                        🗑️
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Personal + Licence cards ── */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Personal Details" icon="👤" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                        <InfoRow icon="🪪" label="Full Name"      value={driver.name}            isDark={isDark} />
                        <InfoRow icon="📱" label="Phone"          value={driver.phone}           isDark={isDark} />
                        <InfoRow icon="📞" label="Alt. Phone"     value={driver.phone_alt}       isDark={isDark} />
                        <InfoRow icon="✉️"  label="Email"          value={driver.email}           isDark={isDark} />
                        <InfoRow icon="🪪" label="National ID"    value={driver.national_id}     isDark={isDark} />
                        <InfoRow icon="📍" label="Address"        value={driver.address}         isDark={isDark} />
                        <InfoRow icon="🗺️" label="Birth Region"   value={driver.birth_region}   isDark={isDark} />
                        <InfoRow icon="📌" label="Birth District" value={driver.birth_district}  isDark={isDark} />
                    </SectionCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Licence & Emergency" icon="📋" isDark={isDark} accent={['#065F46', '#059669']}>
                        <InfoRow icon="🔢" label="Licence #" value={driver.license_number} isDark={isDark} />
                        <DocRow  label="Licence Expiry"      date={driver.license_expiry}  isDark={isDark} />

                        {/* Licence class badges */}
                        <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
                            <Group gap={8}>
                                <Text size="sm">🚗</Text>
                                <Text size="sm" style={{ color: textSec }}>Licence Classes</Text>
                            </Group>
                            {(driver.license_classes ?? []).length === 0 ? (
                                <Text size="sm" fw={600} style={{ color: textPri }}>—</Text>
                            ) : (
                                <Group gap={6} wrap="wrap" justify="flex-end">
                                    {(driver.license_classes ?? []).map(code => (
                                        <Tooltip key={code} label={licenseClasses?.[code] ?? code} withArrow position="top">
                                            <Box style={{ background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.3)', borderRadius: 6, padding: '3px 10px', color: '#EA580C', fontWeight: 800, fontSize: 13, cursor: 'default' }}>
                                                {code}
                                            </Box>
                                        </Tooltip>
                                    ))}
                                </Group>
                            )}
                        </Box>

                        <InfoRow icon="🆘" label="Emergency Name"  value={driver.emergency_contact_name}  isDark={isDark} />
                        <InfoRow icon="📞" label="Emergency Phone" value={driver.emergency_contact_phone} isDark={isDark} />
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            {/* ── Assigned Vehicle ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box mb="md">
                    <SectionCard title="Assigned Vehicle" icon="🚛" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                        {vehicle ? (
                            <Group gap="md" align="center" style={{ padding: '10px 0 14px', borderBottom: `1px solid ${divider}` }}>
                                <Box style={{ fontSize: '1.8rem', lineHeight: 1 }}>{vIcon}</Box>
                                <Stack gap={3} style={{ flex: 1 }}>
                                    <Group gap="sm">
                                        <Text fw={900} style={{ color: textPri, fontFamily: 'monospace', letterSpacing: 2, fontSize: 15 }}>{vehicle.plate}</Text>
                                        <Box style={{ background: vMeta.color + '1A', border: `1px solid ${vMeta.color}40`, borderRadius: 20, padding: '3px 10px' }}>
                                            <Text size="xs" fw={700} style={{ color: vMeta.color }}>{vMeta.label}</Text>
                                        </Box>
                                    </Group>
                                    <Text size="sm" style={{ color: textSec }}>{vehicle.make} {vehicle.model_name} · {vehicle.type}</Text>
                                </Stack>
                                <Box component={Link} href={`/system/fleet/${vehicle.id}`}
                                    style={{ padding: '7px 14px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                                    View →
                                </Box>
                            </Group>
                        ) : (
                            <Text size="sm" style={{ color: textMut, paddingTop: 10, paddingBottom: 4 }}>No vehicle currently assigned.</Text>
                        )}

                        {can('drivers.edit') && (
                            <Group align="flex-end" gap="sm" mt="md">
                                <Box style={{ flex: 1 }}>
                                    <Select
                                        label={vehicle ? 'Change Vehicle' : 'Assign Vehicle'}
                                        placeholder="Select a vehicle…"
                                        value={assignVehicleId}
                                        onChange={v => setAssignVehicleId(v)}
                                        clearable
                                        data={availableVehicles.map(v => ({ value: String(v.id), label: `${v.plate} — ${v.make} ${v.model_name}` }))}
                                        styles={{
                                            label:    { color: textSec, fontSize: 13, marginBottom: 4 },
                                            input:    { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
                                            dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` },
                                        }}
                                    />
                                </Box>
                                <motion.div whileTap={{ scale: 0.97 }}>
                                    <Box component="button" type="button" onClick={doAssignVehicle}
                                        style={{ padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', fontWeight: 800, fontSize: 14, boxShadow: '0 4px 12px rgba(194,65,12,0.35)', marginBottom: 1 }}>
                                        {vehicle ? 'Reassign' : 'Assign'}
                                    </Box>
                                </motion.div>
                            </Group>
                        )}
                    </SectionCard>
                </Box>
            </motion.div>

            {/* ── System Login Access ── */}
            {can('drivers.edit') && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Box mb="md">
                        <SectionCard title="System Login Access" icon="🔐" isDark={isDark} accent={['#7C2D12', '#F59E0B']}>
                            {driver.user ? (
                                <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ padding: '12px 0 4px' }}>
                                    <Group gap="md" align="center">
                                        <Box style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✓</Box>
                                        <Stack gap={2}>
                                            <Text size="sm" fw={700} style={{ color: textPri }}>{driver.user.email}</Text>
                                            <Text size="xs" style={{ color: textSec }}>Driver portal account · can sign in with the password set on creation</Text>
                                        </Stack>
                                    </Group>
                                    <Box component="button" type="button" onClick={revokeAccount}
                                        style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                        Revoke access
                                    </Box>
                                </Group>
                            ) : (
                                <Stack gap="md" style={{ padding: '10px 0 4px' }}>
                                    <Text size="sm" style={{ color: textSec }}>No login account. Create one so this driver can sign in to the system.</Text>
                                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                        <TextInput label="Email" type="email" value={accountEmail} onChange={e => setAccountEmail(e.target.value)} error={accountErrors.email}
                                            styles={{
                                                label: { color: textSec, fontSize: 13, marginBottom: 4 },
                                                input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
                                            }} />
                                        <PasswordInput label="Initial Password" value={accountPassword} onChange={e => setAccountPassword(e.target.value)} error={accountErrors.password}
                                            placeholder="Min 8 characters"
                                            styles={{
                                                label:      { color: textSec, fontSize: 13, marginBottom: 4 },
                                                input:      { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
                                                innerInput: { color: textPri },
                                            }} />
                                    </SimpleGrid>
                                    <Group justify="flex-end">
                                        <Box component="button" type="button" onClick={createAccount} disabled={accountProcessing}
                                            style={{ padding: '9px 22px', borderRadius: 10, border: 'none', cursor: accountProcessing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', fontWeight: 800, fontSize: 14, boxShadow: '0 4px 12px rgba(194,65,12,0.3)', opacity: accountProcessing ? 0.7 : 1 }}>
                                            {accountProcessing ? 'Creating…' : 'Create login account'}
                                        </Box>
                                    </Group>
                                </Stack>
                            )}
                        </SectionCard>
                    </Box>
                </motion.div>
            )}

            {/* ── Documents ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Box mb="md">
                    <DriverDocumentsCard driver={driver} />
                </Box>
            </motion.div>

            {/* ── Trip history ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <SectionCard title={`Recent Trips by ${driver.name}`} icon="🚛" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                    {trips.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Text size="2rem" style={{ marginBottom: 8 }}>🚛</Text>
                            <Text size="sm" style={{ color: textMut }}>No trips recorded for this driver yet.</Text>
                        </Box>
                    ) : (
                        <Box>
                            <Box style={{ display: 'grid', gridTemplateColumns: '130px 1fr 120px 130px', borderBottom: `1px solid ${divider}`, padding: '8px 0', background: headBg, margin: '0 -20px', paddingLeft: 20, paddingRight: 20 }}>
                                {['Trip #', 'Route', 'Date', 'Status'].map(h => (
                                    <Text key={h} size="10px" fw={800} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.9 }}>{h}</Text>
                                ))}
                            </Box>
                            {trips.map((t, i) => (
                                <motion.div key={t.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                    <Box
                                        style={{ display: 'grid', gridTemplateColumns: '130px 1fr 120px 130px', padding: '11px 0', borderBottom: `1px solid ${divider}`, cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFA'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        onClick={() => router.visit(`/system/trips/${t.id}`)}
                                    >
                                        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '3px 9px', width: 'fit-content', height: 'fit-content' }}>
                                            <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace' }}>{t.trip_number}</Text>
                                        </Box>
                                        <Group gap={5} align="center">
                                            <Text size="sm" fw={600} style={{ color: textPri }}>{t.route_from}</Text>
                                            <Text size="xs" style={{ color: '#EA580C', fontWeight: 900 }}>→</Text>
                                            <Text size="sm" fw={600} style={{ color: textPri }}>{t.route_to}</Text>
                                        </Group>
                                        <Text size="sm" style={{ color: textSec }}>{formatDate(t.departure_date)}</Text>
                                        <Text size="sm" style={{ color: textSec }}>{t.status}</Text>
                                    </Box>
                                </motion.div>
                            ))}
                        </Box>
                    )}
                </SectionCard>
            </motion.div>

            {/* Notes */}
            {driver.notes && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Box mt="md">
                        <SectionCard title="Notes" icon="📝" isDark={isDark}>
                            <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{driver.notes}</Text>
                        </SectionCard>
                    </Box>
                </motion.div>
            )}

            <Box mt="xl">
                <Box component={Link} href="/system/drivers"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Drivers
                </Box>
            </Box>

            {photoOpen && (
                <PhotoLightbox src={driver.photo_url} alt={driver.name} onClose={() => setPhotoOpen(false)} />
            )}
        </DashboardLayout>
    );
}
