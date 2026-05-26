import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

const dk = {
    card:    '#0F1E32',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n) || 0);
}

function DataRow({ label, value, isDark, mono = false }) {
    const textSec = isDark ? dk.textSec : '#64748B';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const divider = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${divider}` }}>
            <Text size="sm" style={{ color: textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: textPri, fontFamily: mono ? 'monospace' : undefined, textAlign: 'right' }}>{value ?? '—'}</Text>
        </Box>
    );
}

function Card({ title, children, isDark, accent }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function StatusPill({ status, statuses }) {
    const meta = statuses[status] ?? { label: status, color: '#94A3B8' };
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.color + '1A', border: `1px solid ${meta.color}40`, borderRadius: 20, padding: '3px 10px' }}>
            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
            <Text size="xs" fw={600} style={{ color: meta.color }}>{meta.label}</Text>
        </Box>
    );
}

export default function ShowTenant({ tenant, leases = [], statuses, types }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();
    const can = useCan();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const statusMeta = statuses[tenant.status] ?? { label: tenant.status, color: '#94A3B8' };
    const typeMeta   = types[tenant.type] ?? { label: tenant.type };
    const isCompany  = tenant.type === 'company';

    const [confirmDel, setConfirmDel] = useState(false);
    const confirmDelete = () => {
        router.delete(`/system/real-estate/tenants/${tenant.id}`);
    };

    const flash = props.flash ?? {};

    const leaseCols = '130px 1fr 140px 110px 110px 120px';

    return (
        <DashboardLayout title={tenant.name}>
            <Head title={tenant.name} />

            {/* Flash */}
            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            {/* Header */}
            <Group justify="space-between" mb="xl">
                <Stack gap={4}>
                    <Group gap="md">
                        <Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{tenant.code}</Text>
                        <Text fw={800} size="xl" style={{ color: textPri }}>{tenant.name}</Text>
                        <StatusPill status={tenant.status} statuses={statuses} />
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{typeMeta.label}{isCompany && tenant.company_name ? ` · ${tenant.company_name}` : ''}</Text>
                </Stack>
                <Group gap="sm">
                    {can('realestate_tenants.edit') && (
                        <Box
                            component={Link}
                            href={`/system/real-estate/tenants/${tenant.id}/edit`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                        >
                            ✏️ Edit
                        </Box>
                    )}
                    {can('realestate_tenants.delete') && (
                        confirmDel ? (
                            <Group gap={6}>
                                <Text size="xs" style={{ color: textSec }}>Delete?</Text>
                                <Box component="button" onClick={confirmDelete}
                                    style={{ padding: '7px 14px', borderRadius: 8, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Yes</Box>
                                <Box component="button" onClick={() => setConfirmDel(false)}
                                    style={{ padding: '7px 14px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', color: textSec, border: 'none', cursor: 'pointer', fontSize: 12 }}>No</Box>
                            </Group>
                        ) : (
                            <Tooltip label="Delete tenant">
                                <ActionIcon onClick={() => setConfirmDel(true)} size={36} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444' }}>🗑️</ActionIcon>
                            </Tooltip>
                        )
                    )}
                </Group>
            </Group>

            {/* Contact details */}
            <Box mb="md">
                <Card title="Contact & Details" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                    <DataRow label="Type"          value={typeMeta.label}              isDark={isDark} />
                    <DataRow label="Phone"         value={tenant.phone}                isDark={isDark} />
                    <DataRow label="Alternate Phone" value={tenant.phone_alt}          isDark={isDark} />
                    <DataRow label="Email"         value={tenant.email}                isDark={isDark} />
                    <DataRow label="National ID"   value={tenant.national_id}          isDark={isDark} mono />
                    {isCompany && (
                        <>
                            <DataRow label="Company Name" value={tenant.company_name}  isDark={isDark} />
                            <DataRow label="TIN"          value={tenant.tin}           isDark={isDark} mono />
                        </>
                    )}
                    <DataRow label="Address"       value={tenant.address}              isDark={isDark} />
                    <DataRow label="Emergency Contact" value={tenant.emergency_contact_name} isDark={isDark} />
                    <DataRow label="Emergency Phone"   value={tenant.emergency_contact_phone} isDark={isDark} />
                </Card>
            </Box>

            {/* Notes */}
            {tenant.notes && (
                <Box mb="md">
                    <Card title="Notes" isDark={isDark}>
                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{tenant.notes}</Text>
                    </Card>
                </Box>
            )}

            {/* Leases */}
            <Box mb="md">
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}>
                            <Text fw={700} size="sm" style={{ color: textPri }}>📄 Leases</Text>
                            {leases.length > 0 && (
                                <Box style={{ background: '#3B82F620', border: '1px solid #3B82F640', borderRadius: 12, padding: '1px 8px' }}>
                                    <Text size="xs" fw={700} style={{ color: '#3B82F6' }}>{leases.length}</Text>
                                </Box>
                            )}
                        </Group>
                    </Box>

                    {leases.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '36px 0' }}>
                            <Text style={{ fontSize: '2rem', marginBottom: 8 }}>📄</Text>
                            <Text size="sm" style={{ color: textMut }}>No leases for this tenant yet.</Text>
                        </Box>
                    ) : (
                        <Box style={{ overflowX: 'auto' }}>
                            <Box style={{ display: 'grid', gridTemplateColumns: leaseCols, padding: '10px 20px', borderBottom: `1px solid ${divider}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                                {['Lease #', 'Property / Unit', 'Rent', 'Start', 'End', 'Status'].map(h => (
                                    <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</Text>
                                ))}
                            </Box>
                            {leases.map((lease, i) => (
                                <Box
                                    key={lease.id}
                                    style={{ display: 'grid', gridTemplateColumns: leaseCols, padding: '12px 20px', borderBottom: i < leases.length - 1 ? `1px solid ${divider}` : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = isDark ? '#132436' : '#F8FAFC'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    onClick={() => router.visit(`/system/real-estate/leases/${lease.id}`)}
                                >
                                    <Box component={Link} href={`/system/real-estate/leases/${lease.id}`} onClick={e => e.stopPropagation()} style={{ textDecoration: 'none' }}>
                                        <Text size="sm" fw={700} style={{ color: '#3B82F6' }}>{lease.lease_number}</Text>
                                    </Box>
                                    <Text size="sm" style={{ color: textPri }}>{lease.property_label || '—'}</Text>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{lease.rent_currency || 'TZS'} {fmt(lease.rent_amount)}</Text>
                                    <Text size="sm" style={{ color: textSec }}>{formatDate(lease.start_date)}</Text>
                                    <Text size="sm" style={{ color: textSec }}>{lease.end_date ? formatDate(lease.end_date) : '—'}</Text>
                                    <LeaseStatusPill status={lease.status} />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Back link */}
            <Box mt="xl">
                <Box component={Link} href="/system/real-estate/tenants" style={{ color: textMut, textDecoration: 'none', fontSize: 13 }}>← Back to Tenants</Box>
            </Box>
        </DashboardLayout>
    );
}

const LEASE_STATUSES = {
    active:     { label: 'Active',     color: '#22C55E' },
    pending:    { label: 'Pending',    color: '#60A5FA' },
    expired:    { label: 'Expired',    color: '#F59E0B' },
    terminated: { label: 'Terminated', color: '#EF4444' },
};

function LeaseStatusPill({ status }) {
    return <StatusPill status={status} statuses={LEASE_STATUSES} />;
}