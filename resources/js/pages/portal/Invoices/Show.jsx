import PortalLayout from '../../../layouts/PortalLayout';
import { Box, Text, Group, Grid, Stack } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { printBillingDoc } from '../../../utils/billingPrint';

const statusColor = {
    draft: '#94A3B8', sent: '#2196F3', paid: '#22C55E',
    overdue: '#EF4444', partial: '#F59E0B', cancelled: '#475569',
};

const Field = ({ label, value }) => (
    <Box>
        <Text size="xs" style={{ color: '#475569', marginBottom: 3 }}>{label}</Text>
        <Text size="sm" fw={600} style={{ color: 'var(--c-text)' }}>{value || '—'}</Text>
    </Box>
);

export default function PortalInvoiceShow({ client, invoice, company }) {
    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));
    const sc = statusColor[invoice.status] || '#94A3B8';

    return (
        <PortalLayout title={`Invoice ${invoice.document_number}`}>
            <Box component={Link} href="/portal/invoices" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#60A5FA', textDecoration: 'none', fontSize: 14, marginBottom: 20 }}>
                ← Back to invoices
            </Box>

            {/* Header */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-strong)', borderRadius: 14, padding: '24px 28px', marginBottom: 20 }}>
                <Group justify="space-between" mb="lg">
                    <Box>
                        <Text fw={800} size="xl" style={{ color: 'var(--c-text)' }}>{invoice.document_number}</Text>
                        <Text size="sm" style={{ color: '#94A3B8', marginTop: 4 }}>Tax Invoice</Text>
                    </Box>
                    <Group gap="md">
                        <Box style={{ padding: '6px 18px', borderRadius: 20, background: `${sc}22`, border: `1px solid ${sc}55` }}>
                            <Text fw={700} style={{ color: sc, textTransform: 'capitalize' }}>{invoice.status}</Text>
                        </Box>
                        <Box
                            component="button"
                            onClick={() => printBillingDoc(invoice, company, 'invoice')}
                            style={{
                                background: 'linear-gradient(135deg, #1565C0, #2196F3)',
                                border: 'none', borderRadius: 10, padding: '8px 18px',
                                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                            }}
                        >
                            🖨 Download PDF
                        </Box>
                    </Group>
                </Group>

                <Grid gutter="lg">
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Issue Date" value={invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : null} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Due Date" value={invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : null} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Total Amount" value={`TZS ${fmt(invoice.total)}`} /></Grid.Col>
                    <Grid.Col span={{ base: 6, sm: 3 }}><Field label="Balance Due" value={invoice.balance_due > 0 ? `TZS ${fmt(invoice.balance_due)}` : 'Fully Paid'} /></Grid.Col>
                </Grid>
            </Box>

            {/* Line items */}
            <Box style={{ background: 'var(--c-card)', border: '1px solid var(--c-border-color)', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
                <Text fw={700} style={{ color: 'var(--c-text)', marginBottom: 16 }}>Items</Text>
                <Box style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--c-border-strong)' }}>
                                {['Description', 'Qty', 'Unit Price', 'Total'].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items?.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--c-border-row)' }}>
                                    <td style={{ padding: '12px', color: 'var(--c-text)', fontSize: 14 }}>{item.description}</td>
                                    <td style={{ padding: '12px', color: '#94A3B8', fontSize: 14 }}>{item.quantity} {item.unit}</td>
                                    <td style={{ padding: '12px', color: '#94A3B8', fontSize: 14 }}>TZS {fmt(item.unit_price)}</td>
                                    <td style={{ padding: '12px', color: 'var(--c-text)', fontSize: 14, fontWeight: 700 }}>TZS {fmt(item.total_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>

                {/* Totals */}
                <Box style={{ marginTop: 16, marginLeft: 'auto', maxWidth: 280 }}>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text size="sm" style={{ color: '#64748B' }}>Subtotal</Text>
                            <Text size="sm" style={{ color: 'var(--c-text)' }}>TZS {fmt(invoice.subtotal)}</Text>
                        </Group>
                        {invoice.tax_amount > 0 && (
                            <Group justify="space-between">
                                <Text size="sm" style={{ color: '#64748B' }}>Tax (18% VAT)</Text>
                                <Text size="sm" style={{ color: 'var(--c-text)' }}>TZS {fmt(invoice.tax_amount)}</Text>
                            </Group>
                        )}
                        <Box style={{ height: 1, background: 'var(--c-border-strong)', margin: '4px 0' }} />
                        <Group justify="space-between">
                            <Text fw={700} style={{ color: 'var(--c-text)' }}>Total</Text>
                            <Text fw={800} size="lg" style={{ color: '#2196F3' }}>TZS {fmt(invoice.total)}</Text>
                        </Group>
                        {invoice.amount_paid > 0 && (
                            <Group justify="space-between">
                                <Text size="sm" style={{ color: '#64748B' }}>Paid</Text>
                                <Text size="sm" style={{ color: '#22C55E' }}>TZS {fmt(invoice.amount_paid)}</Text>
                            </Group>
                        )}
                        {invoice.balance_due > 0 && (
                            <Group justify="space-between">
                                <Text fw={700} style={{ color: '#F59E0B' }}>Balance Due</Text>
                                <Text fw={800} style={{ color: '#F59E0B' }}>TZS {fmt(invoice.balance_due)}</Text>
                            </Group>
                        )}
                    </Stack>
                </Box>
            </Box>
        </PortalLayout>
    );
}
