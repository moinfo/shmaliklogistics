import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Select, ActionIcon, Pagination } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../layouts/DashboardLayout';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: '#94A3B8', textMut: '#475569' };

const MIME_ICONS = {
    'application/pdf': '📄',
    'image/jpeg': '🖼️', 'image/jpg': '🖼️', 'image/png': '🖼️',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
};

function mimeIcon(mime) { return MIME_ICONS[mime] ?? '📎'; }
function fileSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function StatCard({ label, value, icon, isDark }) {
    return (
        <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${isDark ? dk.border : '#E2E8F0'}`, borderRadius: 12, padding: '16px 20px' }}>
            <Group gap={10}>
                <Text style={{ fontSize: 22 }}>{icon}</Text>
                <div>
                    <Text size="xl" fw={800} style={{ color: isDark ? dk.textPri : '#1E293B', lineHeight: 1 }}>{value}</Text>
                    <Text size="xs" style={{ color: isDark ? dk.textSec : '#64748B' }}>{label}</Text>
                </div>
            </Group>
        </Box>
    );
}

const TYPE_LABELS = { trip: 'Trip', vehicle: 'Vehicle', driver: 'Driver' };

function resolveType(doc) {
    if (!doc.documentable_type) return '—';
    const lower = doc.documentable_type.toLowerCase();
    if (lower.includes('trip')) return 'Trip';
    if (lower.includes('vehicle')) return 'Vehicle';
    if (lower.includes('driver')) return 'Driver';
    return doc.documentable_type;
}

export default function DocumentsIndex({ documents, stats, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const textSec = isDark ? dk.textSec : '#64748B';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const rowHover = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType]     = useState(filters.type ?? '');

    const applyFilters = (overrides = {}) => {
        router.get('/system/documents', { search, type, ...overrides }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (!confirm('Delete this document? The file will be permanently removed.')) return;
        router.delete(`/system/documents/${id}`, { preserveScroll: true });
    };

    return (
        <DashboardLayout title="Documents">
            <Head title="Documents" />

            <Group justify="space-between" mb="xl" align="flex-start">
                <Stack gap={2}>
                    <Text fw={800} size="xl" style={{ color: textPri }}>Documents</Text>
                    <Text size="sm" style={{ color: textSec }}>Files attached to trips, vehicles and drivers</Text>
                </Stack>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component={Link} href="/system/documents/create" style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)' }}>
                        + Upload Document
                    </Box>
                </motion.div>
            </Group>

            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                <StatCard label="Total Files" value={stats.total} icon="📁" isDark={isDark} />
                <StatCard label="Trip Docs" value={stats.trips} icon="🗺️" isDark={isDark} />
                <StatCard label="Vehicle Docs" value={stats.vehicles} icon="🚛" isDark={isDark} />
                <StatCard label="Driver Docs" value={stats.drivers} icon="👤" isDark={isDark} />
            </SimpleGrid>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <Group gap="md">
                    <TextInput
                        placeholder="Search title, filename…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters({ search })}
                        style={{ flex: 1 }}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 } }}
                    />
                    <Select
                        placeholder="All types"
                        value={type}
                        onChange={v => { setType(v ?? ''); applyFilters({ type: v ?? '' }); }}
                        data={[{ value: '', label: 'All types' }, { value: 'trip', label: '🗺️ Trip' }, { value: 'vehicle', label: '🚛 Vehicle' }, { value: 'driver', label: '👤 Driver' }]}
                        styles={{ input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 }, dropdown: { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` } }}
                        style={{ width: 160 }}
                        clearable
                    />
                    <Box component="button" onClick={() => applyFilters({ search })} style={{ padding: '8px 18px', borderRadius: 8, background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        Search
                    </Box>
                </Group>
            </Box>

            <Box style={{ background: isDark ? dk.card : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                                {['File', 'Title', 'Linked To', 'Size', 'Uploaded', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: textSec, whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {documents.data.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: textSec }}>No documents found.</td></tr>
                            ) : documents.data.map(doc => (
                                <tr key={doc.id} style={{ borderBottom: `1px solid ${isDark ? dk.divider : '#F1F5F9'}` }}
                                    onMouseEnter={e => e.currentTarget.style.background = rowHover}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text style={{ fontSize: 24 }}>{mimeIcon(doc.mime_type)}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{doc.title}</Text>
                                        <Text size="xs" style={{ color: textSec }}>{doc.file_name}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="sm" style={{ color: textSec }}>{resolveType(doc)}</Text>
                                        {doc.notes && <Text size="xs" style={{ color: isDark ? dk.textMut : '#94A3B8' }}>{doc.notes}</Text>}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="xs" style={{ color: textSec }}>{fileSize(doc.file_size)}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <Text size="xs" style={{ color: textSec, whiteSpace: 'nowrap' }}>{doc.created_at?.split('T')[0] ?? '—'}</Text>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                        <Group gap={6} justify="flex-end">
                                            <ActionIcon component="a" href={`/system/documents/${doc.id}/download`} variant="subtle" size="sm" style={{ color: '#3B82F6' }} title="Download">⬇️</ActionIcon>
                                            <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => handleDelete(doc.id)} title="Delete">🗑️</ActionIcon>
                                        </Group>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
                {documents.last_page > 1 && (
                    <Box style={{ padding: '16px 20px', borderTop: `1px solid ${isDark ? dk.divider : '#E2E8F0'}` }}>
                        <Pagination total={documents.last_page} value={documents.current_page} onChange={p => router.get('/system/documents', { ...filters, page: p })} size="sm" />
                    </Box>
                )}
            </Box>
        </DashboardLayout>
    );
}
