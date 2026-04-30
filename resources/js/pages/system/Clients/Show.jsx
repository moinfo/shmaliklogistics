import { Head, Link, router, useForm } from '@inertiajs/react';
import { Box, Text, Group, Stack, Badge, SimpleGrid, Switch, PasswordInput, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };
const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));

function Card({ title, icon, children, isDark }) {
    const cardBg = isDark ? dk.card : '#fff';
    const border = isDark ? dk.border : '#E2E8F0';
    const divider = isDark ? dk.divider : '#E2E8F0';
    const textPri = isDark ? dk.textPri : '#1E293B';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    <Text style={{ fontSize: 16 }}>{icon}</Text>
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: 20 }}>{children}</Box>
        </Box>
    );
}

function Row({ label, value, isDark }) {
    return (
        <Group justify="space-between" py={6} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}>
            <Text size="sm" style={{ color: isDark ? dk.textSec : '#64748B' }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: isDark ? dk.textPri : '#1E293B' }}>{value ?? '—'}</Text>
        </Group>
    );
}

export default function ShowClient({ client, stats, statuses, portalActive }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const portal = useForm({ portal_active: client.portal_active ?? false, portal_password: '' });
    const savePortal = (e) => {
        e.preventDefault();
        portal.patch(`/system/clients/${client.id}/portal`);
    };
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const statusInfo = statuses[client.status] ?? {};

    const handleDelete = () => {
        if (confirm(`Delete client "${client.name}"? This cannot be undone.`)) {
            router.delete(`/system/clients/${client.id}`);
        }
    };

    return (
        <DashboardLayout title={`Client · ${client.name}`}>
            <Head title={client.name} />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Group gap={8}>
                        <Text fw={800} size="xl" style={{ color: textPri }}>{client.name}</Text>
                        <Badge size="sm" style={{ background: statusInfo.color + '22', color: statusInfo.color, border: `1px solid ${statusInfo.color}44` }}>
                            {statusInfo.label}
                        </Badge>
                    </Group>
                    {client.company_name && <Text size="sm" style={{ color: textSec }}>{client.company_name}</Text>}
                </Stack>
                <Group gap="sm">
                    <Box component={Link} href={`/system/billing/quotes/create?client_id=${client.id}`} style={{ padding: '8px 16px', borderRadius: 8, background: '#22C55E22', color: '#22C55E', textDecoration: 'none', fontWeight: 600, fontSize: 13, border: '1px solid #22C55E44' }}>
                        + New Quote
                    </Box>
                    <Box component={Link} href={`/system/clients/${client.id}/edit`} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                        Edit
                    </Box>
                    <Box component="button" onClick={handleDelete} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #EF444444', color: '#EF4444', background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        Delete
                    </Box>
                </Group>
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md" mb="xl">
                {[
                    { label: 'Quotes', value: stats.quotes, icon: '💬', color: '#60A5FA' },
                    { label: 'Invoices', value: stats.invoices, icon: '📄', color: '#A78BFA' },
                    { label: 'Total Billed (TZS)', value: `TZS ${fmt(stats.total_billed)}`, icon: '💰', color: '#22C55E' },
                ].map(s => (
                    <Box key={s.label} style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px' }}>
                        <Group gap={10}>
                            <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                            <div>
                                <Text size="lg" fw={800} style={{ color: s.color, lineHeight: 1 }}>{s.value}</Text>
                                <Text size="xs" style={{ color: textSec }}>{s.label}</Text>
                            </div>
                        </Group>
                    </Box>
                ))}
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Card title="Contact Details" icon="📞" isDark={isDark}>
                    <Row label="Phone" value={client.phone} isDark={isDark} />
                    <Row label="Alt Phone" value={client.phone_alt} isDark={isDark} />
                    <Row label="Email" value={client.email} isDark={isDark} />
                    <Row label="Address" value={client.address} isDark={isDark} />
                </Card>

                <Card title="Tax Information" icon="🧾" isDark={isDark}>
                    <Row label="TIN Number" value={client.tin_number} isDark={isDark} />
                    <Row label="VRN Number" value={client.vrn_number} isDark={isDark} />
                </Card>
            </SimpleGrid>

            {client.notes && (
                <Card title="Notes" icon="📝" isDark={isDark}>
                    <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap' }}>{client.notes}</Text>
                </Card>
            )}

            {/* Customer Portal Management */}
            <Card title="Customer Portal Access" icon="🌐" isDark={isDark}>
                <form onSubmit={savePortal}>
                    <Stack gap="md">
                        <Group justify="space-between" style={{ padding: '12px 16px', background: isDark ? '#07111F' : '#F8FAFC', borderRadius: 10, border: `1px solid ${isDark ? 'var(--c-border-color)' : '#E2E8F0'}` }}>
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
                                styles={{ label: { color: textSec, marginBottom: 6 }, input: { background: isDark ? '#07111F' : '#fff', border: `1px solid ${isDark ? 'var(--c-border-input)' : '#E2E8F0'}`, color: textPri }, innerInput: { color: textPri } }}
                            />
                        )}

                        {client.last_portal_login && (
                            <Text size="xs" style={{ color: textSec }}>
                                Last login: {new Date(client.last_portal_login).toLocaleString()}
                            </Text>
                        )}

                        <Group gap="sm">
                            <Button type="submit" loading={portal.processing} style={{ background: 'linear-gradient(135deg, #1565C0, #2196F3)', border: 'none', borderRadius: 8, fontWeight: 700 }}>
                                Save Portal Settings
                            </Button>
                            {client.portal_active && (
                                <Box
                                    component="a"
                                    href="/portal/login"
                                    target="_blank"
                                    style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${isDark ? 'rgba(33,150,243,0.3)' : '#BFDBFE'}`, color: '#60A5FA', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}
                                >
                                    Open Portal ↗
                                </Box>
                            )}
                        </Group>
                    </Stack>
                </form>
            </Card>

            <Group mt="md">
                <Box component={Link} href="/system/clients" style={{ color: textSec, textDecoration: 'none', fontSize: 13 }}>← Back to Clients</Box>
            </Group>
        </DashboardLayout>
    );
}
