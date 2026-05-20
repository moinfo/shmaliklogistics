import { Head, Link, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { printBillingDoc } from '../../../../utils/billingPrint';
import SendDocModal from '../../../../components/SendDocModal';
import { useCan } from '../../../../lib/can';

const fmt = (n) => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function InfoRow({ icon, label, value, mono = false, isDark }) {
    const textSec = isDark ? '#94A3B8' : '#64748B';
    const textPri = isDark ? '#F1F5F9' : '#1E293B';
    const divider = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    return (
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
            <Group gap={8} style={{ minWidth: 0 }}>
                <Text size="sm">{icon}</Text>
                <Text size="sm" style={{ color: textSec, whiteSpace: 'nowrap' }}>{label}</Text>
            </Group>
            <Text size="sm" fw={600} style={{ color: textPri, fontFamily: mono ? 'monospace' : undefined, textAlign: 'right', wordBreak: 'break-all' }}>
                {value ?? '—'}
            </Text>
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

export default function ShowProforma({ proforma, statuses, company }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';

    const cardBg     = isDark ? '#1A0900' : '#ffffff';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : '#EAECF0';
    const cardShadow = isDark ? '0 2px 16px rgba(0,0,0,0.35)' : '0 1px 8px rgba(0,0,0,0.06)';
    const textPri    = isDark ? '#F1F5F9' : '#1E293B';
    const textSec    = isDark ? '#94A3B8' : '#64748B';
    const textMut    = isDark ? '#475569' : '#98A2B3';
    const divider    = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
    const headBg     = isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC';

    const statusInfo = statuses[proforma.status] ?? { label: proforma.status, color: '#94A3B8' };
    const cur        = proforma.currency ?? 'TZS';

    const [sendOpen, setSendOpen] = useState(false);
    const can = useCan();

    const handleDelete = () => {
        if (confirm(`Delete proforma ${proforma.document_number}?`)) router.delete(`/system/billing/proformas/${proforma.id}`);
    };

    const convertToInvoice = () => {
        router.post(`/system/billing/proformas/${proforma.id}/convert-to-invoice`);
    };

    return (
        <DashboardLayout title={`Proforma · ${proforma.document_number}`}>
            <Head title={proforma.document_number} />

            {/* Page header banner */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box mb={24} style={{
                    background: isDark
                        ? 'linear-gradient(135deg, #1E0800 0%, #3D1200 60%, #C2410C 100%)'
                        : 'linear-gradient(135deg, #C2410C 0%, #EA580C 60%, #F97316 100%)',
                    borderRadius: 18, padding: '20px 28px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 6px 32px rgba(194,65,12,0.3)',
                }}>
                    <Box style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                    <Box style={{ position: 'absolute', bottom: -20, right: 240, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                    <Group justify="space-between" align="center" wrap="wrap" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                        <Stack gap={6}>
                            <Group gap={10} align="center">
                                <Box style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                    📋
                                </Box>
                                <Stack gap={2}>
                                    <Group gap={10} align="center">
                                        <Text fw={900} size="xl" c="white" style={{ letterSpacing: 0.5 }}>{proforma.document_number}</Text>
                                        <Box style={{ background: statusInfo.color + '30', border: `1px solid ${statusInfo.color}60`, borderRadius: 20, padding: '3px 12px', backdropFilter: 'blur(4px)' }}>
                                            <Group gap={5} align="center">
                                                <Box style={{ width: 6, height: 6, borderRadius: '50%', background: statusInfo.color, boxShadow: `0 0 6px ${statusInfo.color}` }} />
                                                <Text size="xs" fw={700} style={{ color: '#fff' }}>{statusInfo.label}</Text>
                                            </Group>
                                        </Box>
                                    </Group>
                                    <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                        {proforma.client?.name}{proforma.client?.company_name ? ` — ${proforma.client.company_name}` : ''}
                                    </Text>
                                </Stack>
                            </Group>
                        </Stack>

                        <Group gap={8} wrap="wrap">
                            {can('billing_proformas.edit') && ['draft', 'sent', 'accepted'].includes(proforma.status) && (
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Box component="button" onClick={convertToInvoice}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                                        → Convert to Invoice
                                    </Box>
                                </motion.div>
                            )}
                            {can('billing_proformas.edit') && (
                                <Box component="button" onClick={() => setSendOpen(true)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                                    ✉ Send
                                </Box>
                            )}
                            <Box component="button" onClick={() => printBillingDoc(proforma, company, 'proforma')}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                                🖨 Print
                            </Box>
                            {can('billing_proformas.view') && (
                                <Box component="a" href={`/system/billing/proformas/${proforma.id}/pdf`} target="_blank"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, background: 'white', color: '#C2410C', fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                    ⬇ PDF
                                </Box>
                            )}
                            {can('billing_proformas.edit') && (
                                <Box component={Link} href={`/system/billing/proformas/${proforma.id}/edit`}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                                    ✏️ Edit
                                </Box>
                            )}
                            {can('billing_proformas.delete') && (
                                <Tooltip label="Delete proforma">
                                    <ActionIcon onClick={handleDelete} size={38}
                                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, color: '#FCA5A5' }}>
                                        🗑️
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                    </Group>
                </Box>
            </motion.div>

            {/* Converted from notice */}
            {proforma.converted_from && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <Box mb={16} style={{ background: isDark ? 'rgba(59,130,246,0.08)' : '#EFF6FF', border: `1px solid ${isDark ? 'rgba(59,130,246,0.2)' : '#BFDBFE'}`, borderRadius: 10, padding: '10px 16px' }}>
                        <Text size="sm" style={{ color: '#3B82F6' }}>
                            Converted from quote{' '}
                            <Box component={Link} href={`/system/billing/quotes/${proforma.converted_from.id}`} style={{ color: '#3B82F6', fontWeight: 700, textDecoration: 'none' }}>{proforma.converted_from.document_number}</Box>
                        </Text>
                    </Box>
                </motion.div>
            )}

            {/* Converted to invoice link */}
            {(proforma.conversions ?? []).length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <Box mb={16} style={{ background: isDark ? 'rgba(139,92,246,0.08)' : '#F5F3FF', border: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : '#DDD6FE'}`, borderRadius: 10, padding: '10px 16px' }}>
                        <Text size="sm" style={{ color: '#7C3AED' }}>
                            Converted to invoice:{' '}
                            <Box component={Link} href={`/system/billing/invoices/${proforma.conversions[0].id}`} style={{ color: '#7C3AED', fontWeight: 700, textDecoration: 'none' }}>{proforma.conversions[0].document_number}</Box>
                        </Text>
                    </Box>
                </motion.div>
            )}

            {/* Meta + Client cards */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard title="Proforma Details" icon="📋" isDark={isDark} accent={['#7C3AED', '#A78BFA']}>
                        <InfoRow icon="📅" label="Issue Date"   value={fmtDate(proforma.issue_date)}   isDark={isDark} />
                        <InfoRow icon="📆" label="Due Date"     value={fmtDate(proforma.due_date)}     isDark={isDark} />
                        <InfoRow icon="⏳" label="Valid Until"  value={fmtDate(proforma.valid_until)}  isDark={isDark} />
                        {proforma.trip && (
                            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${divider}`, gap: 12 }}>
                                <Group gap={8}>
                                    <Text size="sm">🚛</Text>
                                    <Text size="sm" style={{ color: textSec }}>Trip</Text>
                                </Group>
                                <Box component={Link} href={`/system/trips/${proforma.trip.id}`} style={{ color: '#EA580C', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>{proforma.trip.trip_number}</Box>
                            </Box>
                        )}
                    </SectionCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <SectionCard title="Bill To" icon="🏢" isDark={isDark} accent={['#0E4FA0', '#3B82F6']}>
                        <Box style={{ paddingTop: 8 }}>
                            <Text fw={800} size="sm" style={{ color: textPri, marginBottom: 4 }}>{proforma.client?.name}</Text>
                            {proforma.client?.company_name && <Text size="sm" style={{ color: textSec, marginBottom: 2 }}>{proforma.client.company_name}</Text>}
                            {proforma.client?.address && <Text size="sm" style={{ color: textSec, marginBottom: 2 }}>{proforma.client.address}</Text>}
                            {proforma.client?.tin_number && (
                                <Box style={{ display: 'inline-flex', background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderRadius: 6, padding: '2px 8px', marginTop: 4 }}>
                                    <Text size="xs" fw={600} style={{ color: textMut, fontFamily: 'monospace' }}>TIN: {proforma.client.tin_number}</Text>
                                </Box>
                            )}
                        </Box>
                    </SectionCard>
                </motion.div>
            </SimpleGrid>

            {/* Line Items */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Box mb="md" style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, overflow: 'hidden', boxShadow: cardShadow }}>
                    <Box style={{ height: 3, background: 'linear-gradient(90deg, #EA580C, #F97316)' }} />
                    <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Group gap={8}>
                            <Text size="md">📦</Text>
                            <Text fw={700} size="sm" style={{ color: textPri }}>Line Items</Text>
                        </Group>
                    </Box>

                    {/* Table head */}
                    <Box style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 130px 130px', background: headBg, borderBottom: `1px solid ${divider}`, padding: '10px 20px' }}>
                        {['Description', 'Qty', 'Unit', 'Unit Price', 'Total'].map((h, i) => (
                            <Text key={h} size="10px" fw={800} style={{ color: textMut, letterSpacing: 0.9, textTransform: 'uppercase', textAlign: i >= 3 ? 'right' : 'left' }}>{h}</Text>
                        ))}
                    </Box>

                    {(proforma.items ?? []).map((item, i) => (
                        <Box key={i} style={{
                            display: 'grid', gridTemplateColumns: '1fr 80px 80px 130px 130px',
                            padding: '12px 20px', borderBottom: `1px solid ${divider}`, alignItems: 'center',
                            transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFA'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <Text size="sm" style={{ color: textPri }}>{item.description}</Text>
                            <Text size="sm" style={{ color: textSec }}>{item.quantity}</Text>
                            <Text size="sm" style={{ color: textSec }}>{item.unit ?? '—'}</Text>
                            <Text size="sm" style={{ color: textSec, textAlign: 'right' }}>{cur} {fmt(item.unit_price)}</Text>
                            <Text size="sm" fw={700} style={{ color: textPri, textAlign: 'right' }}>{cur} {fmt(item.total)}</Text>
                        </Box>
                    ))}

                    {/* Totals */}
                    <Box style={{ padding: '16px 20px', borderTop: `1px solid ${divider}`, maxWidth: 360, marginLeft: 'auto' }}>
                        <Group justify="space-between" mb={6}>
                            <Text size="sm" style={{ color: textSec }}>Subtotal</Text>
                            <Text size="sm" style={{ color: textPri }}>{cur} {fmt(proforma.subtotal)}</Text>
                        </Group>
                        {Number(proforma.discount_amount) > 0 && (
                            <Group justify="space-between" mb={6}>
                                <Text size="sm" style={{ color: textSec }}>Discount</Text>
                                <Text size="sm" style={{ color: '#EF4444' }}>− {cur} {fmt(proforma.discount_amount)}</Text>
                            </Group>
                        )}
                        {Number(proforma.tax_rate) > 0 && (
                            <Group justify="space-between" mb={6}>
                                <Text size="sm" style={{ color: textSec }}>VAT ({proforma.tax_rate}%)</Text>
                                <Text size="sm" style={{ color: textPri }}>{cur} {fmt(proforma.tax_amount)}</Text>
                            </Group>
                        )}
                        <Box style={{ borderTop: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`, paddingTop: 10, marginTop: 6 }}>
                            <Group justify="space-between">
                                <Text fw={800} size="sm" style={{ color: textPri }}>Total</Text>
                                <Text fw={900} size="lg" style={{ color: '#22C55E' }}>{cur} {fmt(proforma.total)}</Text>
                            </Group>
                        </Box>
                    </Box>
                </Box>
            </motion.div>

            <Box mt="xl">
                <Box component={Link} href="/system/billing/proformas"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: textMut, textDecoration: 'none', fontSize: 13, padding: '7px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: cardBg, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EA580C'}
                    onMouseLeave={e => e.currentTarget.style.color = textMut}>
                    ← Back to Proformas
                </Box>
            </Box>

            <SendDocModal
                doc={proforma} docType="proforma" company={company}
                opened={sendOpen} onClose={() => setSendOpen(false)}
            />
        </DashboardLayout>
    );
}
