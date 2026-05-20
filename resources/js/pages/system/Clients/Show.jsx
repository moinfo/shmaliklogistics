import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Switch, PasswordInput, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useCan } from '../../../lib/can';

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));

function PersonAvatar({ name, size = 56 }) {
    const initials = (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['#2563EB', '#0284C7', '#0D9488', '#059669', '#7C3AED', '#DB2777', '#EA580C'];
    const color = colors[(name || '').charCodeAt(0) % colors.length];
    return (
        <Box style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Text fw={900} style={{ color, letterSpacing: 0.5, fontSize: size * 0.32 }}>{initials}</Text>
        </Box>
    );
}

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

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

export default function ShowClient({ client, stats, statuses, portalActive }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';

    const portal = useForm({ portal_active: client.portal_active ?? false, portal_password: '' });
    const savePortal = (e) => {
        e.preventDefault();
        portal.patch(`/system/clients/${client.id}/portal`);
    };

    const statusInfo = statuses[client.status] ?? {};
    const can = useCan();

    const handleDelete = () => {
        if (confirm(`Delete client "${client.name}"? This cannot be undone.`)) {
            router.delete(`/system/clients/${client.id}`);
        }
    };

    const statCards = [
        {
            icon: '💬', label: 'Quotes', value: String(stats.quotes),
            grad: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)',
            glow: '0 8px 28px rgba(37,99,235,0.4)',
        },
        {
            icon: '📄', label: 'Invoices', value: String(stats.invoices),
            grad: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 60%, #8B5CF6 100%)',
            glow: '0 8px 28px rgba(139,92,246,0.4)',
        },
        {
            icon: '💰', label: 'Total Billed', value: 'TZS', valueSub: ` ${fmt(stats.total_billed)}`,
            grad: 'linear-gradient(135deg, #065F46 0%, #047857 60%, #10B981 100%)',
            glow: '0 8px 28px rgba(16,185,129,0.4)',
        },
    ];

    return (
        <DashboardLayout title={`Client · ${client.name}`}>
            <Head title={client.name} />

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
                            <PersonAvatar name={client.name} size={52} />
                            <Stack gap={3}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white" style={{ letterSpacing: 0.3 }}>{client.name}</Text>
                                    {statusInfo.color && (
                                        <Box style={{ background: statusInfo.color + '30', border: `1px solid ${statusInfo.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                            <Group gap={5} align="center">
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, boxShadow: `0 0 6px ${statusInfo.color}` }} />
                                                <Text size="xs" fw={700} style={{ color: '#fff' }}>{statusInfo.label}</Text>
                                            </Group>
                                        </Box>
                                    )}
                                </Group>
                                {client.company_name && (
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{client.company_name}</Text>
                                )}
                            </Stack>
                        </Group>

                        <Group gap={8} wrap="wrap">
                            {can('billing_quotes.create') && (
                                <Box component={Link} href={`/system/billing/quotes/create?client_id=${client.id}`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                    ＋ New Quote
                                </Box>
                            )}
                            {can('clients.edit') && (
                                <Box component={Link} href={`/system/clients/${client.id}/edit`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                    ✏️ Edit
                                </Box>
                            )}
                            {can('clients.delete') && (
                                <Box component="button" onClick={handleDelete}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                    🗑️ Delete
                                </Box>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* ── Stat cards ── */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={12}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                    {s.icon}
                                </Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: s.valueSub ? '1.4rem' : '2rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>
                                {s.value}
                                {s.valueSub && <Text component="span" fw={500} style={{ fontSize: '0.85rem', opacity: 0.75 }}>{s.valueSub}</Text>}
                            </Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* ── Info cards ── */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Contact Details" icon="📞" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                        <InfoRow icon="📱" label="Phone"     value={client.phone}     isDark={isDark} />
                        <InfoRow icon="📞" label="Alt Phone" value={client.phone_alt} isDark={isDark} />
                        <InfoRow icon="✉️"  label="Email"     value={client.email}     isDark={isDark} />
                        <InfoRow icon="📍" label="Address"   value={client.address}   isDark={isDark} />
                    </SectionCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Tax Information" icon="🧾" isDark={isDark} accent={['#065F46', '#059669']}>
                        <InfoRow icon="🔢" label="TIN Number" value={client.tin_number} isDark={isDark} />
                        <InfoRow icon="📋" label="VRN Number" value={client.vrn_number} isDark={isDark} />
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            {/* Notes */}
            {client.notes && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Box mb="md">
                        <SectionCard title="Notes" icon="📝" isDark={isDark}>
                            <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{client.notes}</Text>
                        </SectionCard>
                    </Box>
                </motion.div>
            )}

            {/* Customer Portal */}
            {can('clients.edit') && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Box mb="md">
                        <SectionCard title="Customer Portal Access" icon="🌐" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                            <form onSubmit={savePortal}>
                                <Stack gap="md" style={{ paddingTop: 4 }}>
                                    <Group justify="space-between" style={{ padding: '12px 16px', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 10, border: `1px solid ${cardBorder}` }}>
                                        <Box>
                                            <Text fw={600} size="sm" style={{ color: textPri }}>Portal Access Enabled</Text>
                                            <Text size="xs" style={{ color: textSec }}>Client can log in to track shipments and invoices</Text>
                                        </Box>
                                        <Switch checked={portal.data.portal_active} onChange={e => portal.setData('portal_active', e.currentTarget.checked)} />
                                    </Group>

                                    {portal.data.portal_active && (
                                        <PasswordInput
                                            label="Set New Password"
                                            placeholder="Leave blank to keep current password"
                                            value={portal.data.portal_password}
                                            onChange={e => portal.setData('portal_password', e.target.value)}
                                            styles={{
                                                label: { color: textSec, marginBottom: 6 },
                                                input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#fff', border: `1px solid ${cardBorder}`, color: textPri },
                                                innerInput: { color: textPri },
                                            }}
                                        />
                                    )}

                                    {client.last_portal_login && (
                                        <Text size="xs" style={{ color: textSec }}>
                                            Last login: {new Date(client.last_portal_login).toLocaleString()}
                                        </Text>
                                    )}

                                    <Group gap="sm">
                                        <Button type="submit" loading={portal.processing}
                                            style={{ background: 'linear-gradient(135deg, #C2410C, #EA580C)', border: 'none', borderRadius: 10, fontWeight: 800 }}>
                                            Save Portal Settings
                                        </Button>
                                        {client.portal_active && (
                                            <Box component="a" href="/portal/login" target="_blank"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(234,88,12,0.3)' : 'rgba(234,88,12,0.25)'}`, color: '#EA580C', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                                                Open Portal ↗
                                            </Box>
                                        )}
                                    </Group>
                                </Stack>
                            </form>
                        </SectionCard>
                    </Box>
                </motion.div>
            )}

            <Box mt="xl">
                <Box component={Link} href="/system/clients"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Clients
                </Box>
            </Box>
        </DashboardLayout>
    );
}
