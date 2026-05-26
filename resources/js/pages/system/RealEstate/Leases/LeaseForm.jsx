import { Link } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import DatePicker from '../../../../components/DatePicker';

const dk = {
    card:    '#0F1E32',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

function Section({ title, icon, children, isDark }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Group gap={8}>
                    {icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
                    <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
                </Group>
            </Box>
            <Box style={{ padding: '20px' }}>{children}</Box>
        </Box>
    );
}

export default function LeaseForm({
    data, setData, errors, processing, onSubmit, backHref, submitLabel = 'Save Lease',
    units = [], tenants = [], billingCycles = {}, currencies = [], statuses = {},
}) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';

    const inputStyles = {
        label: { color: textSec, marginBottom: 4, fontSize: 13 },
        input: { background: inputBg, border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8 },
    };
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };
    const numStyles = { ...inputStyles, section: { color: textSec } };

    // Unit options — include current value as fallback if not present
    const unitData = (() => {
        const opts = units.map(u => ({ value: String(u.value), label: u.label }));
        if (data.property_unit_id && !opts.find(o => o.value === String(data.property_unit_id))) {
            opts.unshift({ value: String(data.property_unit_id), label: `Unit #${data.property_unit_id}` });
        }
        return opts;
    })();

    const tenantData = (() => {
        const opts = tenants.map(t => ({ value: String(t.value), label: t.label }));
        if (data.tenant_id && !opts.find(o => o.value === String(data.tenant_id))) {
            opts.unshift({ value: String(data.tenant_id), label: `Tenant #${data.tenant_id}` });
        }
        return opts;
    })();

    const billingData = Object.entries(billingCycles).map(([k, v]) => ({ value: k, label: v.label }));
    const currencyData = currencies.map(c => ({ value: c, label: c }));
    const statusData = Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }));

    // When a unit is selected, prefill rent_amount / rent_currency / billing_cycle from its option if available
    const handleUnitChange = (val) => {
        const unit = units.find(u => String(u.value) === String(val));
        const next = { ...data, property_unit_id: val ?? '' };
        if (unit) {
            if (unit.rent_amount != null && unit.rent_amount !== '') next.rent_amount = unit.rent_amount;
            if (unit.rent_currency) next.rent_currency = unit.rent_currency;
            if (unit.default_billing_cycle) next.billing_cycle = unit.default_billing_cycle;
            else if (unit.billing_cycle) next.billing_cycle = unit.billing_cycle;
        }
        setData(next);
    };

    return (
        <form onSubmit={onSubmit}>
            <Section title="Lease Parties" icon="🏠" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Select
                        label="Property / Unit"
                        placeholder="Select unit…"
                        required
                        searchable
                        value={data.property_unit_id ? String(data.property_unit_id) : null}
                        onChange={handleUnitChange}
                        data={unitData}
                        error={errors.property_unit_id}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                        nothingFoundMessage="No matching units"
                    />
                    <Select
                        label="Tenant"
                        placeholder="Select tenant…"
                        required
                        searchable
                        value={data.tenant_id ? String(data.tenant_id) : null}
                        onChange={v => setData('tenant_id', v ?? '')}
                        data={tenantData}
                        error={errors.tenant_id}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                        nothingFoundMessage="No matching tenants"
                    />
                </SimpleGrid>
            </Section>

            <Section title="Term & Billing" icon="📅" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <DatePicker label="Start Date" required value={data.start_date} onChange={v => setData('start_date', v)} error={errors.start_date} styles={inputStyles} />
                    <DatePicker label="End Date" value={data.end_date ?? ''} onChange={v => setData('end_date', v)} error={errors.end_date} styles={inputStyles} />
                    <Select
                        label="Billing Cycle"
                        required
                        value={data.billing_cycle}
                        onChange={v => setData('billing_cycle', v ?? 'monthly')}
                        data={billingData}
                        error={errors.billing_cycle}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <NumberInput
                        label="Payment Day (1–28)"
                        placeholder="e.g. 1"
                        min={1}
                        max={28}
                        value={data.payment_day ?? ''}
                        onChange={v => setData('payment_day', v)}
                        error={errors.payment_day}
                        styles={numStyles}
                    />
                </SimpleGrid>
            </Section>

            <Section title="Rent & Deposit" icon="💰" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                    <NumberInput
                        label="Rent Amount"
                        placeholder="500,000"
                        min={0}
                        required
                        value={data.rent_amount}
                        onChange={v => setData('rent_amount', v)}
                        error={errors.rent_amount}
                        styles={numStyles}
                        thousandSeparator=","
                    />
                    <Select
                        label="Currency"
                        required
                        value={data.rent_currency}
                        onChange={v => setData('rent_currency', v ?? 'TZS')}
                        data={currencyData}
                        error={errors.rent_currency}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                    <NumberInput
                        label="Deposit Amount"
                        placeholder="0"
                        min={0}
                        value={data.deposit_amount ?? 0}
                        onChange={v => setData('deposit_amount', v)}
                        error={errors.deposit_amount}
                        styles={numStyles}
                        thousandSeparator=","
                    />
                </SimpleGrid>
            </Section>

            <Section title="Status & Terms" icon="📝" isDark={isDark}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="md">
                    <Select
                        label="Status"
                        required
                        value={data.status}
                        onChange={v => setData('status', v ?? 'active')}
                        data={statusData}
                        error={errors.status}
                        styles={{ ...inputStyles, dropdown: dropdownStyle }}
                    />
                </SimpleGrid>
                <Textarea
                    label="Terms"
                    placeholder="Lease terms and conditions…"
                    minRows={3}
                    value={data.terms ?? ''}
                    onChange={e => setData('terms', e.target.value)}
                    error={errors.terms}
                    styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                    mb="md"
                />
                <Textarea
                    label="Notes"
                    placeholder="Internal notes…"
                    minRows={3}
                    value={data.notes ?? ''}
                    onChange={e => setData('notes', e.target.value)}
                    error={errors.notes}
                    styles={{ label: inputStyles.label, input: { ...inputStyles.input, resize: 'vertical' } }}
                />
            </Section>

            {units.length === 0 && (
                <Text size="xs" style={{ color: '#F59E0B', marginBottom: 12 }}>
                    ⚠ No available units found. Add a property unit before creating a lease.
                </Text>
            )}
            {tenants.length === 0 && (
                <Text size="xs" style={{ color: '#F59E0B', marginBottom: 12 }}>
                    ⚠ No tenants found.{' '}
                    <Box component="a" href="/system/real-estate/tenants/create" style={{ color: '#3B82F6', textDecoration: 'underline' }}>Register a tenant →</Box>
                </Text>
            )}

            <Group justify="flex-end" gap="md">
                <Box component={Link} href={backHref} style={{ padding: '10px 20px', borderRadius: 10, border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                    Cancel
                </Box>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Box component="button" type="submit" disabled={processing} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #1565C0, #2196F3)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 16px rgba(33,150,243,0.35)', opacity: processing ? 0.7 : 1 }}>
                        {processing ? 'Saving…' : submitLabel}
                    </Box>
                </motion.div>
            </Group>
        </form>
    );
}