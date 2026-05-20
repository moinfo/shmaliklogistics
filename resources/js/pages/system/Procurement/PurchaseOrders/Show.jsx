import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Stack, Modal, NumberInput } from '@mantine/core';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCan } from '../../../../lib/can';
import { useMantineColorScheme } from '@mantine/core';

function SectionCard({ title, icon, children, isDark, accentColors }) {
    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
            <Box style={{ height: 3, background: accentColors ?? 'linear-gradient(90deg, #C2410C, #EA580C)' }} />
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <Text size="md">{icon}</Text>}
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '16px 20px' }}>{children}</Box>
        </Box>
    );
}

export default function ShowPurchaseOrder({ order, statuses }) {
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

    const inputStyle = {
        input:  { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
        label:  { color: textSec, marginBottom: 4 },
        dropdown: { background: isDark ? '#1A0900' : '#fff', border: `1px solid ${cardBorder}` },
    };

    const [receiveOpen, setReceiveOpen] = useState(false);
    const [quantities,  setQuantities]  = useState(
        Object.fromEntries(order.items.map(i => [i.id, parseFloat(i.quantity) - parseFloat(i.received_qty)]))
    );
    const [submitting, setSubmitting] = useState(false);
    const can = useCan();

    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));
    const st  = statuses[order.status] || { label: order.status, color: '#94A3B8' };
    const canReceive = ['sent', 'partial'].includes(order.status);
    const canCancel  = ['draft', 'sent'].includes(order.status);
    const canSend    = order.status === 'draft';

    const updateStatus = (status) => {
        router.patch(`/system/procurement/orders/${order.id}/status`, { status }, { preserveScroll: true });
    };

    const submitReceive = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const items = order.items.map(i => ({ id: i.id, received_qty: quantities[i.id] ?? 0 }));
        router.post(`/system/procurement/orders/${order.id}/receive`, { items }, {
            onSuccess: () => { setReceiveOpen(false); setSubmitting(false); },
            onError:   () => setSubmitting(false),
            preserveScroll: true,
        });
    };

    const destroy = () => {
        if (confirm('Delete this purchase order?')) {
            router.delete(`/system/procurement/orders/${order.id}`);
        }
    };

    return (
        <DashboardLayout title={`PO — ${order.po_number}`}>

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
                            <Stack gap={2}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white" style={{ letterSpacing: 0.5 }}>{order.po_number}</Text>
                                    <Box style={{ background: st.color + '30', border: `1px solid ${st.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                        <Group gap={5} align="center">
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, boxShadow: `0 0 6px ${st.color}` }} />
                                            <Text size="xs" fw={700} style={{ color: '#fff' }}>{st.label}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Text size="sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{order.supplier?.name}</Text>
                            </Stack>
                        </Group>

                        <Group gap={8} wrap="wrap">
                            {can('procurement_orders.edit') && canSend && (
                                <Box component="button" onClick={() => updateStatus('sent')}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                                    📤 Mark Sent
                                </Box>
                            )}
                            {can('procurement_orders.edit') && canReceive && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Box component="button" onClick={() => setReceiveOpen(true)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                        ✅ Receive Goods
                                    </Box>
                                </motion.div>
                            )}
                            {can('procurement_orders.edit') && canCancel && (
                                <Box component="button" onClick={() => updateStatus('cancelled')}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', color: '#FCA5A5', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                    ✕ Cancel PO
                                </Box>
                            )}
                            {can('procurement_orders.delete') && order.status === 'draft' && (
                                <Box component="button" onClick={destroy}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                                    🗑️
                                </Box>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Info + Totals */}
            <Grid gutter="lg" mb="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <SectionCard title="Order Information" icon="📋" isDark={isDark} accentColors="linear-gradient(90deg, #0369A1, #0EA5E9)">
                            <Grid gutter="md">
                                {[
                                    ['Supplier',       order.supplier?.name],
                                    ['Contact',        order.supplier?.contact_name || '—'],
                                    ['Phone',          order.supplier?.phone || '—'],
                                    ['Order Date',     order.order_date    ? new Date(order.order_date).toLocaleDateString()    : '—'],
                                    ['Expected Date',  order.expected_date ? new Date(order.expected_date).toLocaleDateString() : '—'],
                                ].map(([l, v]) => (
                                    <Grid.Col key={l} span={6}>
                                        <Text size="xs" style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{l}</Text>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{v}</Text>
                                    </Grid.Col>
                                ))}
                                {order.notes && (
                                    <Grid.Col span={12}>
                                        <Text size="xs" style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Notes</Text>
                                        <Text size="sm" style={{ color: textSec }}>{order.notes}</Text>
                                    </Grid.Col>
                                )}
                            </Grid>
                        </SectionCard>
                    </motion.div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <SectionCard title="Totals" icon="💰" isDark={isDark} accentColors="linear-gradient(90deg, #065F46, #22C55E)">
                            <Stack gap={10}>
                                {[['Subtotal', order.subtotal], ['VAT (18%)', order.tax_amount]].map(([l, v]) => (
                                    <Group key={l} justify="space-between">
                                        <Text size="sm" style={{ color: textSec }}>{l}</Text>
                                        <Text size="sm" style={{ color: textSec }}>TZS {fmt(v)}</Text>
                                    </Group>
                                ))}
                                <Box style={{ borderTop: `1px solid ${divider}`, paddingTop: 12 }}>
                                    <Group justify="space-between">
                                        <Text fw={700} style={{ color: textPri }}>Total</Text>
                                        <Text fw={900} size="xl" style={{ color: '#22C55E' }}>TZS {fmt(order.total)}</Text>
                                    </Group>
                                </Box>
                            </Stack>
                        </SectionCard>
                    </motion.div>
                </Grid.Col>
            </Grid>

            {/* Line Items */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #5B21B6, #8B5CF6)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text size="md">📦</Text>
                        <Text fw={700} size="sm" style={{ color: textPri }}>Line Items</Text>
                        <Box style={{ marginLeft: 'auto', background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 20, padding: '2px 10px' }}>
                            <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</Text>
                        </Box>
                    </Box>
                    <Box style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: headBg, borderBottom: `1px solid ${divider}` }}>
                                    {['Description', 'Unit', 'Ordered', 'Received', 'Unit Price', 'Total'].map(h => (
                                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: textMut, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.9 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, i) => {
                                    const fullyReceived  = parseFloat(item.received_qty) >= parseFloat(item.quantity);
                                    const partlyReceived = parseFloat(item.received_qty) > 0 && !fullyReceived;
                                    return (
                                        <motion.tr key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                            style={{ borderBottom: `1px solid ${divider}`, transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = rowHov}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Text fw={600} size="sm" style={{ color: textPri }}>{item.description}</Text>
                                                {item.inventory_item && (
                                                    <Group gap={4} mt={2}>
                                                        <Text size="xs" style={{ color: '#EA580C' }}>→</Text>
                                                        <Text size="xs" style={{ color: textMut }}>{item.inventory_item.name}</Text>
                                                    </Group>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: textSec }}>{item.unit}</Text></td>
                                            <td style={{ padding: '12px 16px' }}><Text size="sm" fw={600} style={{ color: textPri }}>{item.quantity}</Text></td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <Text size="sm" fw={600} style={{ color: fullyReceived ? '#22C55E' : partlyReceived ? '#F59E0B' : textMut }}>
                                                    {item.received_qty}
                                                    {fullyReceived && ' ✓'}
                                                </Text>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: textSec }}>TZS {fmt(item.unit_price)}</Text></td>
                                            <td style={{ padding: '12px 16px' }}><Text size="sm" fw={700} style={{ color: textPri }}>TZS {fmt(item.total)}</Text></td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Box>
                </Box>
            </motion.div>

            {/* Receive Goods Modal */}
            <Modal opened={receiveOpen} onClose={() => setReceiveOpen(false)} size="lg"
                title={<Text fw={700} style={{ color: textPri }}>Receive Goods — {order.po_number}</Text>}
                styles={{ content: { background: cardBg, border: `1px solid ${cardBorder}` }, header: { background: cardBg, borderBottom: `1px solid ${divider}` } }}>
                <form onSubmit={submitReceive}>
                    <Text size="xs" style={{ color: textSec, marginBottom: 16 }}>Enter the quantity received for each item. Leave at 0 to skip.</Text>
                    <Stack gap="md">
                        {order.items.map(item => {
                            const remaining = parseFloat(item.quantity) - parseFloat(item.received_qty);
                            return (
                                <Box key={item.id} style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', border: `1px solid ${cardBorder}`, borderRadius: 10, padding: '14px 16px' }}>
                                    <Group justify="space-between" mb={10}>
                                        <Text fw={600} size="sm" style={{ color: textPri }}>{item.description}</Text>
                                        <Box style={{ background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 8, padding: '2px 10px' }}>
                                            <Text size="xs" fw={700} style={{ color: '#EA580C' }}>Remaining: {remaining} {item.unit}</Text>
                                        </Box>
                                    </Group>
                                    <NumberInput label="Qty Receiving"
                                        value={quantities[item.id] ?? 0}
                                        onChange={v => setQuantities(prev => ({ ...prev, [item.id]: v ?? 0 }))}
                                        min={0} max={remaining} step={1}
                                        styles={inputStyle} />
                                </Box>
                            );
                        })}
                    </Stack>
                    <Group justify="flex-end" mt="lg" gap="sm">
                        <Box component="button" type="button" onClick={() => setReceiveOpen(false)}
                            style={{ padding: '8px 18px', borderRadius: 8, background: 'transparent', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 13 }}>
                            Cancel
                        </Box>
                        <Box component="button" type="submit" disabled={submitting}
                            style={{ padding: '9px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#166534,#22C55E)', border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? 'Saving…' : 'Confirm Receipt'}
                        </Box>
                    </Group>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
