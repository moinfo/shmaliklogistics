import PortalLayout from '../../../layouts/PortalLayout';
import { Box, Text, Group, Grid, Stack } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { printBillingDoc } from '../../../utils/billingPrint';

const invoiceStatusColor = {
    draft: '#94A3B8', sent: '#2196F3', paid: '#22C55E',
    overdue: '#EF4444', partial: '#F59E0B', cancelled: '#64748B',
};

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

function InfoRow({ label, value, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: textPri, textAlign: 'right' }}>{value ?? '—'}</Text>
        </Box>
    );
}

export default function PortalInvoiceShow({ client, invoice, company }) {
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

    const fmt = (n) => new Intl.NumberFormat().format(Math.round(n ?? 0));
    const sc = invoiceStatusColor[invoice.status] || '#94A3B8';
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <PortalLayout title="">
            {/* Back */}
            <Box component={Link} href="/portal/invoices" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#EA580C', textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 20, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg }}>
                ← Back to Invoices
            </Box>

            {/* Hero header banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 200, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Group gap={10}>
                            <Box style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📄</Box>
                            <Stack gap={2}>
                                <Group gap={10} align="center">
                                    <Text fw={900} size="xl" c="white" style={{ letterSpacing: 0.5 }}>{invoice.document_number}</Text>
                                    <Box style={{ background: sc + '30', border: `1px solid ${sc}60`, borderRadius: 20, padding: '3px 12px' }}>
                                        <Group gap={5} align="center">
                                            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: sc, boxShadow: `0 0 6px ${sc}` }} />
                                            <Text size="xs" fw={700} c="white" style={{ textTransform: 'capitalize' }}>{invoice.status}</Text>
                                        </Group>
                                    </Box>
                                </Group>
                                <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Tax Invoice · Issued {fmtDate(invoice.issue_date)}</Text>
                            </Stack>
                        </Group>
                        <Group gap={8}>
                            <Box
                                component="button"
                                onClick={() => printBillingDoc(invoice, company, 'invoice')}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
                            >
                                🖨 Download PDF
                            </Box>
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Invoice meta + Financial Summary */}
            <Grid gutter="md" mb="md">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <SectionCard title="Invoice Details" icon="📋" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                            <InfoRow label="Invoice Number" value={invoice.document_number} isDark={isDark} />
                            <InfoRow label="Issue Date" value={fmtDate(invoice.issue_date)} isDark={isDark} />
                            <InfoRow label="Due Date" value={fmtDate(invoice.due_date)} isDark={isDark} />
                            <InfoRow label="Type" value="Tax Invoice" isDark={isDark} />
                        </SectionCard>
                    </motion.div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <SectionCard title="Financial Summary" icon="💰" isDark={isDark} accent={['#065F46', '#10B981']}>
                            <InfoRow label="Subtotal" value={`TZS ${fmt(invoice.subtotal)}`} isDark={isDark} />
                            {invoice.tax_amount > 0 && (
                                <InfoRow label="Tax (18% VAT)" value={`TZS ${fmt(invoice.tax_amount)}`} isDark={isDark} />
                            )}
                            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
                                <Text size="sm" fw={700} style={{ color: textPri }}>Total</Text>
                                <Text size="lg" fw={900} style={{ color: '#2196F3' }}>TZS {fmt(invoice.total)}</Text>
                            </Box>
                            {invoice.amount_paid > 0 && (
                                <InfoRow label="Amount Paid" value={`TZS ${fmt(invoice.amount_paid)}`} isDark={isDark} />
                            )}
                            {invoice.balance_due > 0 ? (
                                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', gap: 12 }}>
                                    <Text size="sm" fw={700} style={{ color: '#F59E0B' }}>Balance Due</Text>
                                    <Text size="md" fw={900} style={{ color: '#F59E0B' }}>TZS {fmt(invoice.balance_due)}</Text>
                                </Box>
                            ) : (
                                <Box style={{ padding: '10px 0' }}>
                                    <Group gap={6}>
                                        <Text size="sm" fw={700} style={{ color: '#22C55E' }}>✓ Fully Paid</Text>
                                    </Group>
                                </Box>
                            )}
                        </SectionCard>
                    </motion.div>
                </Grid.Col>
            </Grid>

            {/* Line Items */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #6D28D9, #8B5CF6)' }} />
                    {/* Toolbar */}
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Group gap={8}>
                            <Box style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, #EA580C, #F97316)', boxShadow: '0 0 6px rgba(234,88,12,0.5)' }} />
                            <Text size="sm" fw={700} style={{ color: textPri }}>Invoice Items</Text>
                            {invoice.items?.length > 0 && (
                                <Box style={{ background: isDark ? 'rgba(234,88,12,0.12)' : '#FFF7F0', border: '1px solid rgba(234,88,12,0.2)', borderRadius: 12, padding: '1px 8px' }}>
                                    <Text size="xs" fw={700} style={{ color: '#EA580C' }}>{invoice.items.length}</Text>
                                </Box>
                            )}
                        </Group>
                    </Box>

                    {/* Head */}
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 140px', gap: 0, background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                        {['Description', 'Qty', 'Unit Price', 'Total'].map(h => (
                            <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase' }}>{h}</Text>
                        ))}
                    </Box>

                    {invoice.items?.map((item, i) => (
                        <Box
                            key={i}
                            style={{
                                display: 'grid', gridTemplateColumns: '1fr 100px 140px 140px', gap: 0,
                                padding: '13px 20px', borderBottom: i < invoice.items.length - 1 ? `1px solid ${divider}` : 'none',
                                alignItems: 'center', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = rowHov}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Text size="sm" style={{ color: textPri }}>{item.description}</Text>
                            <Text size="sm" style={{ color: textSec }}>{item.quantity} {item.unit}</Text>
                            <Text size="sm" style={{ color: textSec }}>TZS {fmt(item.unit_price)}</Text>
                            <Text size="sm" fw={700} style={{ color: textPri }}>TZS {fmt(item.total_price)}</Text>
                        </Box>
                    ))}

                    {/* Totals footer */}
                    <Box style={{ padding: '16px 20px', borderTop: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, background: headBg }}>
                        <Stack gap="xs" style={{ marginLeft: 'auto', maxWidth: 300 }}>
                            <Group justify="space-between">
                                <Text size="sm" style={{ color: textSec }}>Subtotal</Text>
                                <Text size="sm" style={{ color: textPri }}>TZS {fmt(invoice.subtotal)}</Text>
                            </Group>
                            {invoice.tax_amount > 0 && (
                                <Group justify="space-between">
                                    <Text size="sm" style={{ color: textSec }}>Tax (18% VAT)</Text>
                                    <Text size="sm" style={{ color: textPri }}>TZS {fmt(invoice.tax_amount)}</Text>
                                </Group>
                            )}
                            <Box style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }} />
                            <Group justify="space-between">
                                <Text fw={700} style={{ color: textPri }}>Total</Text>
                                <Text fw={900} size="lg" style={{ color: '#2196F3' }}>TZS {fmt(invoice.total)}</Text>
                            </Group>
                            {invoice.amount_paid > 0 && (
                                <Group justify="space-between">
                                    <Text size="sm" style={{ color: textSec }}>Paid</Text>
                                    <Text size="sm" style={{ color: '#22C55E', fontWeight: 700 }}>TZS {fmt(invoice.amount_paid)}</Text>
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
            </motion.div>
        </PortalLayout>
    );
}
