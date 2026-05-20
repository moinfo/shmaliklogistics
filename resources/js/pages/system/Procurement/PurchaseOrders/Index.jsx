import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Text, Group, Stack, Select, SimpleGrid } from '@mantine/core';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCan } from '../../../../lib/can';
import { useMantineColorScheme } from '@mantine/core';

function CardWave() {
    return (
        <svg viewBox="0 0 200 60" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', opacity: 0.12, pointerEvents: 'none' }} preserveAspectRatio="none">
            <path d="M0,30 C40,10 80,50 120,30 C160,10 180,40 200,30 L200,60 L0,60 Z" fill="white" />
        </svg>
    );
}

export default function PurchaseOrdersIndex({ orders, suppliers, statuses, stats, filters }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';
    const rowHov     = isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA';

    const [status,     setStatus]     = useState(filters.status || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');
    const can = useCan();
    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));

    const apply = (key, val) => {
        const p = { status, supplier_id: supplierId };
        p[key] = val;
        if (key === 'status')      setStatus(val);
        if (key === 'supplier_id') setSupplierId(val);
        const params = {};
        if (p.status)      params.status      = p.status;
        if (p.supplier_id) params.supplier_id = p.supplier_id;
        router.get('/system/procurement/orders', params, { preserveState: true, replace: true });
    };

    const inputStyles = {
        input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`, color: textPri, borderRadius: 10 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}`, borderRadius: 12 },
    };

    const statCards = [
        { icon: '📋', label: 'Total POs',  value: String(stats.total),            grad: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', glow: '0 8px 28px rgba(37,99,235,0.4)' },
        { icon: '📝', label: 'Drafts',     value: String(stats.draft),            grad: 'linear-gradient(135deg,#374151,#6B7280)', glow: '0 8px 28px rgba(107,114,128,0.3)' },
        { icon: '⏳', label: 'Pending',    value: String(stats.pending),          grad: 'linear-gradient(135deg,#78350F,#F59E0B)', glow: '0 8px 28px rgba(245,158,11,0.4)' },
        { icon: '✅', label: 'Received',   value: String(stats.received),         grad: 'linear-gradient(135deg,#065F46,#22C55E)', glow: '0 8px 28px rgba(34,197,94,0.4)' },
        { icon: '💰', label: 'Spend YTD', value: `TZS ${fmt(stats.spend_ytd)}`,   grad: 'linear-gradient(135deg,#C2410C,#EA580C)', glow: '0 8px 28px rgba(194,65,12,0.4)' },
    ];

    return (
        <DashboardLayout title="Purchase Orders">

            {/* Page Header Banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)' : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🛒</Box>
                            <Stack gap={1}>
                                <Text fw={900} size="lg" c="white">Purchase Orders</Text>
                                <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Manage supplier orders and goods receipt</Text>
                            </Stack>
                        </Group>
                        {can('procurement_orders.create') && (
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                <Box component={Link} href="/system/procurement/orders/create"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                    + New PO
                                </Box>
                            </motion.div>
                        )}
                    </Group>
                </Box>
            </motion.div>

            {/* Stat Cards */}
            <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="md" mb={24}>
                {statCards.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                        <Box style={{ background: s.grad, borderRadius: 16, padding: '18px 20px', boxShadow: s.glow, position: 'relative', overflow: 'hidden', minHeight: 110 }}>
                            <CardWave />
                            <Box style={{ position: 'absolute', top: -24, right: -24, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
                            <Group justify="space-between" align="flex-start" mb={10}>
                                <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{s.icon}</Box>
                            </Group>
                            <Text fw={900} c="white" style={{ fontSize: '1.3rem', lineHeight: 1, position: 'relative', zIndex: 1 }}>{s.value}</Text>
                            <Text size="xs" c="white" mt={4} style={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>{s.label}</Text>
                        </Box>
                    </motion.div>
                ))}
            </SimpleGrid>

            {/* Filters */}
            <Box mb={16} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: '14px 18px', boxShadow: cardShadow }}>
                <Group gap="sm" wrap="wrap">
                    <Select placeholder="All statuses" value={status} onChange={v => apply('status', v || '')}
                        data={[{ value: '', label: 'All' }, ...Object.entries(statuses).map(([v, s]) => ({ value: v, label: s.label }))]}
                        style={{ width: 160 }} styles={inputStyles} />
                    <Select placeholder="All suppliers" value={supplierId} onChange={v => apply('supplier_id', v || '')}
                        data={[{ value: '', label: 'All Suppliers' }, ...suppliers.map(s => ({ value: String(s.id), label: s.name }))]}
                        style={{ width: 200 }} styles={inputStyles} />
                </Group>
            </Box>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #C2410C, #EA580C)' }} />

                    {/* Toolbar */}
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Group gap={8}>
                            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                            <Text size="sm" fw={700} style={{ color: textPri }}>All Purchase Orders</Text>
                        </Group>
                        <Text size="xs" style={{ color: textMut }}>
                            {orders.data.length > 0 ? `${orders.from ?? 1}–${orders.to ?? orders.data.length} of ${orders.total ?? orders.data.length}` : '0 results'}
                        </Text>
                    </Box>

                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                    {['PO Number', 'Supplier', 'Order Date', 'Expected', 'Total', 'Status', ''].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: textMut, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.9, whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.map((o, i) => {
                                    const st = statuses[o.status] || { label: o.status, color: '#94A3B8' };
                                    return (
                                        <motion.tr key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                            style={{ borderBottom: `1px solid ${divider}`, transition: 'background 0.15s, border-left 0.15s', borderLeft: '3px solid transparent', cursor: can('procurement_orders.view') ? 'pointer' : 'default' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = rowHov; e.currentTarget.style.borderLeft = `3px solid ${st.color}`; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}
                                            onClick={() => can('procurement_orders.view') && router.visit(`/system/procurement/orders/${o.id}`)}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '4px 10px' }}>
                                                    <Text size="xs" fw={800} style={{ color: '#EA580C', fontFamily: 'monospace', letterSpacing: 0.4 }}>{o.po_number}</Text>
                                                </Box>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}><Text fw={600} size="sm" style={{ color: textPri }}>{o.supplier?.name}</Text></td>
                                            <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: textSec }}>{o.order_date ? new Date(o.order_date).toLocaleDateString() : '—'}</Text></td>
                                            <td style={{ padding: '14px 16px' }}><Text size="sm" style={{ color: textMut }}>{o.expected_date ? new Date(o.expected_date).toLocaleDateString() : '—'}</Text></td>
                                            <td style={{ padding: '14px 16px' }}><Text fw={700} size="sm" style={{ color: textPri }}>TZS {fmt(o.total)}</Text></td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: `${st.color}18`, border: `1px solid ${st.color}35` }}>
                                                    <Box style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, boxShadow: `0 0 5px ${st.color}` }} />
                                                    <Text size="xs" fw={700} style={{ color: st.color }}>{st.label}</Text>
                                                </Box>
                                            </td>
                                            <td style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
                                                {can('procurement_orders.view') && (
                                                    <Box component={Link} href={`/system/procurement/orders/${o.id}`}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', color: '#EA580C', textDecoration: 'none', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                        View →
                                                    </Box>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {orders.data.length === 0 && (
                            <Box style={{ textAlign: 'center', padding: '72px 0' }}>
                                <Box style={{ width: 80, height: 80, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.1)' : '#FFF7F0', border: '2px dashed rgba(234,88,12,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', margin: '0 auto 20px' }}>🛒</Box>
                                <Text fw={800} size="md" style={{ color: textPri, marginBottom: 6 }}>No purchase orders yet</Text>
                                <Text size="sm" style={{ color: textMut }}>Create your first purchase order to get started</Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            </motion.div>
        </DashboardLayout>
    );
}
