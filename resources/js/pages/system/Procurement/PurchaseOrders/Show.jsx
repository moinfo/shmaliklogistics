import DashboardLayout from '../../../../layouts/DashboardLayout';
import { Box, Grid, Text, Group, Button, Modal, Stack, NumberInput, Badge } from '@mantine/core';
import { router } from '@inertiajs/react';
import { useState } from 'react';

const inp = { input: { background: 'var(--c-input)', border: '1px solid var(--c-border-input)', color: 'var(--c-text)' }, label: { color: '#94A3B8', marginBottom: 4 } };

export default function ShowPurchaseOrder({ order, statuses }) {
    const [receiveOpen, setReceiveOpen] = useState(false);
    const [quantities, setQuantities] = useState(
        Object.fromEntries(order.items.map(i => [i.id, parseFloat(i.quantity) - parseFloat(i.received_qty)]))
    );
    const [submitting, setSubmitting] = useState(false);

    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));
    const st = statuses[order.status] || { label: order.status, color: '#94A3B8' };
    const canReceive = ['sent', 'partial'].includes(order.status);
    const canCancel = ['draft', 'sent'].includes(order.status);
    const canSend = order.status === 'draft';

    const updateStatus = (status) => {
        router.patch(`/system/procurement/orders/${order.id}/status`, { status }, { preserveScroll: true });
    };

    const submitReceive = (e) => {
        e.preventDefault();
        setSubmitting(true);
        const items = order.items.map(i => ({
            id: i.id,
            received_qty: quantities[i.id] ?? 0,
        }));
        router.post(`/system/procurement/orders/${order.id}/receive`, { items }, {
            onSuccess: () => { setReceiveOpen(false); setSubmitting(false); },
            onError: () => setSubmitting(false),
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
            {/* Header */}
            <Group justify="space-between" mb="xl" wrap="wrap" gap="sm">
                <Group gap="md">
                    <Text fw={800} size="xl" style={{ color: 'var(--c-text)' }}>{order.po_number}</Text>
                    <Box style={{ padding: '3px 12px', borderRadius: 8, background: `${st.color}22`, border: `1px solid ${st.color}44` }}>
                        <Text size="sm" fw={700} style={{ color: st.color }}>{st.label}</Text>
                    </Box>
                </Group>
                <Group gap="sm" wrap="wrap">
                    {canSend && <Button onClick={() => updateStatus('sent')} size="sm" variant="outline" style={{ borderColor: '#2196F3', color: '#60A5FA' }}>Mark Sent</Button>}
                    {canReceive && <Button onClick={() => setReceiveOpen(true)} size="sm" style={{ background: 'linear-gradient(135deg, #166534, #22C55E)', border: 'none', borderRadius: 8 }}>Receive Goods</Button>}
                    {canCancel && <Button onClick={() => updateStatus('cancelled')} size="sm" variant="outline" style={{ borderColor: '#EF4444', color: '#EF4444' }}>Cancel PO</Button>}
                    {order.status === 'draft' && <Button onClick={destroy} size="sm" variant="subtle" style={{ color: '#475569' }}>Delete</Button>}
                </Group>
            </Group>

            <Grid gutter="lg">
                {/* Supplier + dates */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                        <Text fw={700} size="sm" style={{ color: '#60A5FA', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Order Information</Text>
                        <Grid gutter="md">
                            {[
                                ['Supplier', order.supplier?.name],
                                ['Contact', order.supplier?.contact_name || '—'],
                                ['Phone', order.supplier?.phone || '—'],
                                ['Order Date', order.order_date ? new Date(order.order_date).toLocaleDateString() : '—'],
                                ['Expected Date', order.expected_date ? new Date(order.expected_date).toLocaleDateString() : '—'],
                            ].map(([l, v]) => (
                                <Grid.Col key={l} span={6}>
                                    <Text size="xs" style={{ color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>{l}</Text>
                                    <Text fw={600} size="sm" style={{ color: 'var(--c-text)', marginTop: 2 }}>{v}</Text>
                                </Grid.Col>
                            ))}
                            {order.notes && (
                                <Grid.Col span={12}>
                                    <Text size="xs" style={{ color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes</Text>
                                    <Text size="sm" style={{ color: '#94A3B8', marginTop: 2 }}>{order.notes}</Text>
                                </Grid.Col>
                            )}
                        </Grid>
                    </Box>
                </Grid.Col>

                {/* Totals */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '24px' }}>
                        <Text fw={700} size="sm" style={{ color: '#60A5FA', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>Totals</Text>
                        <Stack gap={10}>
                            {[['Subtotal', order.subtotal], ['VAT (18%)', order.tax_amount]].map(([l, v]) => (
                                <Group key={l} justify="space-between">
                                    <Text size="sm" style={{ color: '#64748B' }}>{l}</Text>
                                    <Text size="sm" style={{ color: '#94A3B8' }}>TZS {fmt(v)}</Text>
                                </Group>
                            ))}
                            <Box style={{ borderTop: '1px solid var(--c-border-strong)', paddingTop: 10 }}>
                                <Group justify="space-between">
                                    <Text fw={700} style={{ color: 'var(--c-text)' }}>Total</Text>
                                    <Text fw={800} size="lg" style={{ color: '#2196F3' }}>TZS {fmt(order.total)}</Text>
                                </Group>
                            </Box>
                        </Stack>
                    </Box>
                </Grid.Col>
            </Grid>

            {/* Line items */}
            <Box mt="lg" style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <Box style={{ padding: '20px 24px', borderBottom: '1px solid var(--c-border-subtle)' }}>
                    <Text fw={700} size="sm" style={{ color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 0.8 }}>Line Items</Text>
                </Box>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--c-thead)', borderBottom: '1px solid var(--c-border-subtle)' }}>
                                {['Description', 'Unit', 'Ordered', 'Received', 'Unit Price', 'Total'].map(h => (
                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748B', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map(item => {
                                const fullyReceived = parseFloat(item.received_qty) >= parseFloat(item.quantity);
                                const partlyReceived = parseFloat(item.received_qty) > 0 && !fullyReceived;
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid var(--c-border-row)' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text fw={600} size="sm" style={{ color: 'var(--c-text)' }}>{item.description}</Text>
                                            {item.inventory_item && <Text size="xs" style={{ color: '#475569' }}>→ {item.inventory_item.name}</Text>}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#64748B' }}>{item.unit}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: 'var(--c-text)' }}>{item.quantity}</Text></td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <Text size="sm" fw={600} style={{ color: fullyReceived ? '#22C55E' : partlyReceived ? '#F59E0B' : '#475569' }}>
                                                {item.received_qty}
                                                {fullyReceived && ' ✓'}
                                            </Text>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" style={{ color: '#94A3B8' }}>TZS {fmt(item.unit_price)}</Text></td>
                                        <td style={{ padding: '12px 16px' }}><Text size="sm" fw={700} style={{ color: 'var(--c-text)' }}>TZS {fmt(item.total)}</Text></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>
            </Box>

            {/* Receive Goods Modal */}
            <Modal opened={receiveOpen} onClose={() => setReceiveOpen(false)} size="lg"
                title={<Text fw={700} style={{ color: 'var(--c-text)' }}>Receive Goods — {order.po_number}</Text>}
                styles={{ content: { background: 'var(--c-card)', border: '1px solid var(--c-border-input)' }, header: { background: 'var(--c-card)', borderBottom: '1px solid var(--c-border-subtle)' } }}>
                <form onSubmit={submitReceive}>
                    <Text size="xs" style={{ color: '#64748B', marginBottom: 16 }}>Enter the quantity received for each item. Leave at 0 to skip.</Text>
                    <Stack gap="md">
                        {order.items.map(item => {
                            const remaining = parseFloat(item.quantity) - parseFloat(item.received_qty);
                            return (
                                <Box key={item.id} style={{ background: 'var(--c-input)', border: '1px solid var(--c-border-subtle)', borderRadius: 8, padding: '12px 16px' }}>
                                    <Group justify="space-between" mb={8}>
                                        <Text fw={600} size="sm" style={{ color: 'var(--c-text)' }}>{item.description}</Text>
                                        <Text size="xs" style={{ color: '#475569' }}>Remaining: {remaining} {item.unit}</Text>
                                    </Group>
                                    <NumberInput
                                        label="Qty Receiving"
                                        value={quantities[item.id] ?? 0}
                                        onChange={v => setQuantities(prev => ({ ...prev, [item.id]: v ?? 0 }))}
                                        min={0} max={remaining} step={1}
                                        styles={inp} />
                                </Box>
                            );
                        })}
                    </Stack>
                    <Group justify="flex-end" mt="lg" gap="sm">
                        <Button variant="subtle" onClick={() => setReceiveOpen(false)} style={{ color: '#64748B' }}>Cancel</Button>
                        <Button type="submit" loading={submitting} style={{ background: 'linear-gradient(135deg, #166534, #22C55E)', border: 'none', borderRadius: 8 }}>
                            Confirm Receipt
                        </Button>
                    </Group>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
