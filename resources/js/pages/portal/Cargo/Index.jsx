import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Pagination } from '@mantine/core';
import { useState } from 'react';
import PortalLayout from '../../../layouts/PortalLayout';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function PortalCargoIndex({ cargos, statuses, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applySearch = () => {
        router.get('/portal/cargo', search ? { search } : {}, { preserveState: true, replace: true });
    };

    return (
        <PortalLayout title="Cargo Tracking">
            <Head title="Cargo Tracking" />

            <Box mb="lg">
                <Text fw={800} size="xl" style={{ color: 'var(--c-text)', marginBottom: 4 }}>📦 Cargo Tracking</Text>
                <Text size="sm" style={{ color: 'var(--c-text-muted)' }}>Track the real-time status of your shipments</Text>
            </Box>

            {/* Search */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
                <Group gap="md">
                    <input
                        type="text"
                        placeholder="Search by cargo number, description, origin or destination…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applySearch()}
                        style={{ flex: 1, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--c-border-input)', background: 'var(--c-input)', color: 'var(--c-text)', fontSize: 14, outline: 'none' }}
                    />
                    <button onClick={applySearch} style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--c-accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                        Search
                    </button>
                </Group>
            </Box>

            {cargos.data.length === 0 ? (
                <Box style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14 }}>
                    <Text style={{ fontSize: '2.5rem', marginBottom: 12 }}>📦</Text>
                    <Text fw={600} style={{ color: 'var(--c-text)' }}>No cargo found</Text>
                    <Text size="sm" style={{ color: 'var(--c-text-muted)', marginTop: 4 }}>
                        {search ? 'Try a different search term.' : 'No cargo registered for your account yet.'}
                    </Text>
                </Box>
            ) : (
                <Stack gap="sm">
                    {cargos.data.map(cargo => {
                        const statusMeta = statuses[cargo.status] ?? { label: cargo.status, color: '#94A3B8' };
                        return (
                            <Box key={cargo.id} component={Link} href={`/portal/cargo/${cargo.id}`}
                                style={{ display: 'block', textDecoration: 'none', background: 'var(--c-card)', border: '1px solid var(--c-border)', borderRadius: 14, padding: '18px 20px', transition: 'border-color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = statusMeta.color + '66'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--c-border)'}>
                                <Group justify="space-between" wrap="wrap" gap="sm">
                                    <Box>
                                        <Group gap={10} mb={6}>
                                            <Text fw={800} size="md" style={{ color: 'var(--c-text)', fontFamily: 'monospace' }}>{cargo.cargo_number}</Text>
                                            <Box style={{ background: statusMeta.color + '22', border: `1px solid ${statusMeta.color}44`, borderRadius: 20, padding: '2px 10px' }}>
                                                <Text size="xs" fw={700} style={{ color: statusMeta.color }}>{statusMeta.label}</Text>
                                            </Box>
                                        </Group>
                                        <Text size="sm" style={{ color: 'var(--c-text-muted)', marginBottom: 4 }}>{cargo.description}</Text>
                                        {(cargo.origin || cargo.destination) && (
                                            <Text size="sm" style={{ color: 'var(--c-text)' }}>
                                                {cargo.origin && <span>{cargo.origin}</span>}
                                                {cargo.origin && cargo.destination && <span style={{ color: 'var(--c-text-muted)' }}> → </span>}
                                                {cargo.destination && <span>{cargo.destination}</span>}
                                            </Text>
                                        )}
                                    </Box>
                                    <Stack gap={4} style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                                        <Text size="xs" style={{ color: 'var(--c-text-muted)' }}>{cargo.weight_kg} kg · {cargo.pieces} pcs</Text>
                                        {cargo.trip && (
                                            <Text size="xs" style={{ color: 'var(--c-accent)', fontWeight: 600 }}>
                                                Trip: {cargo.trip.trip_number} ({cargo.trip.route_from} → {cargo.trip.route_to})
                                            </Text>
                                        )}
                                        <Text size="xs" style={{ color: 'var(--c-text-muted)' }}>View details →</Text>
                                    </Stack>
                                </Group>
                            </Box>
                        );
                    })}
                </Stack>
            )}

            {cargos.last_page > 1 && (
                <Group justify="center" mt="xl">
                    <Pagination value={cargos.current_page} total={cargos.last_page} onChange={p => router.get('/portal/cargo', { ...filters, page: p })} size="sm" />
                </Group>
            )}
        </PortalLayout>
    );
}
