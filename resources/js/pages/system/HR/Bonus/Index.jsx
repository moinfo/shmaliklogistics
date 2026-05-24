import { Head, useForm, router } from '@inertiajs/react';
import { Box, Text, Group, Stack, Select, Modal, Badge } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';

const dk = { card: '#0F1E32', border: 'var(--c-border-color)', divider: 'rgba(255,255,255,0.06)', textPri: '#E2E8F0', textSec: 'var(--c-text-secondary)' };
function fmt(n) { return Number(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }

const STATUS_COLOR = { pending: '#F59E0B', applied: '#22C55E', waived: '#94A3B8' };

// ── Shared input helpers ────────────────────────────────────────────────────
function useTheme() {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    return {
        isDark,
        textPri: isDark ? dk.textPri : '#1E293B',
        textSec: isDark ? dk.textSec : '#64748B',
        cardBorder: isDark ? dk.border : '#E2E8F0',
        card: isDark ? dk.card : '#fff',
        rowHover: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
        divider: isDark ? dk.divider : '#F1F5F9',
    };
}

function TextInput({ label, value, onChange, error, placeholder = '', type = 'text', t }) {
    return (
        <Box mb="sm">
            <Text size="xs" fw={600} style={{ color: t.textSec, marginBottom: 4 }}>{label}</Text>
            <Box component="input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${error ? '#EF4444' : t.cardBorder}`, background: t.isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: t.textPri, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            {error && <Text size="xs" style={{ color: '#EF4444', marginTop: 3 }}>{error}</Text>}
        </Box>
    );
}

const selectStyles = (t) => ({
    input: { background: t.isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${t.cardBorder}`, color: t.textPri, borderRadius: 8 },
    label: { color: t.textSec, fontSize: 13, fontWeight: 600, marginBottom: 4 },
    dropdown: { background: t.isDark ? '#0F1E32' : '#fff', border: `1px solid ${t.cardBorder}` },
});

const btnPrimary = { padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 };
const btnCancel = (t) => ({ padding: '8px 16px', borderRadius: 8, border: `1px solid ${t.cardBorder}`, background: 'transparent', color: t.textSec, cursor: 'pointer', fontSize: 13 });

// ── Forms ────────────────────────────────────────────────────────────────────
function PolicyForm({ policy, departments, onClose, t }) {
    const isEdit = !!policy;
    const { data, setData, post, processing, errors } = useForm({
        department:  policy?.department ?? '',
        amount:      policy?.amount ?? '',
        description: policy?.description ?? '',
        is_active:   policy?.is_active ?? true,
    });
    const submit = (e) => { e.preventDefault(); post('/system/hr/bonus/policies', { onSuccess: onClose, preserveScroll: true }); };
    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: t.textPri, marginBottom: 14 }}>{isEdit ? 'Edit' : 'Add'} Department Bonus</Text>
            <Select label="Department *" data={departments.map(d => ({ value: d, label: d }))} value={data.department} onChange={v => setData('department', v ?? '')} disabled={isEdit} styles={selectStyles(t)} mb="sm" error={errors.department} />
            <TextInput label="Default Monthly Bonus (TZS) *" value={data.amount} onChange={v => setData('amount', v)} type="number" placeholder="e.g. 100000" error={errors.amount} t={t} />
            <TextInput label="Description" value={data.description} onChange={v => setData('description', v)} placeholder="Optional" t={t} />
            <Group justify="flex-end" gap="sm" mt="md">
                <Box component="button" type="button" onClick={onClose} style={btnCancel(t)}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={btnPrimary}>{processing ? 'Saving…' : 'Save'}</Box>
            </Group>
        </Box>
    );
}

function RuleForm({ rule, onClose, t }) {
    const isEdit = !!rule;
    const { data, setData, post, put, processing, errors } = useForm({
        name:           rule?.name ?? '',
        penalty_amount: rule?.penalty_amount ?? '',
        description:    rule?.description ?? '',
        is_active:      rule?.is_active ?? true,
    });
    const submit = (e) => {
        e.preventDefault();
        const opts = { onSuccess: onClose, preserveScroll: true };
        isEdit ? put(`/system/hr/bonus/rules/${rule.id}`, opts) : post('/system/hr/bonus/rules', opts);
    };
    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: t.textPri, marginBottom: 14 }}>{isEdit ? 'Edit' : 'Add'} Rule (Sheria)</Text>
            <TextInput label="Rule Name *" value={data.name} onChange={v => setData('name', v)} placeholder="e.g. Overspeeding" error={errors.name} t={t} />
            <TextInput label="Penalty (TZS) *" value={data.penalty_amount} onChange={v => setData('penalty_amount', v)} type="number" placeholder="e.g. 20000" error={errors.penalty_amount} t={t} />
            <TextInput label="Description" value={data.description} onChange={v => setData('description', v)} placeholder="What counts as breaking this rule?" t={t} />
            {isEdit && (
                <Group gap={8} mb="md">
                    <Box component="input" type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} id="rule_active" />
                    <Text component="label" htmlFor="rule_active" size="sm" style={{ color: t.textSec, cursor: 'pointer' }}>Active</Text>
                </Group>
            )}
            <Group justify="flex-end" gap="sm" mt="md">
                <Box component="button" type="button" onClick={onClose} style={btnCancel(t)}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={btnPrimary}>{processing ? 'Saving…' : isEdit ? 'Update' : 'Add'}</Box>
            </Group>
        </Box>
    );
}

function InfractionForm({ employees, rules, onClose, t }) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id:   '',
        bonus_rule_id: '',
        amount:        '',
        occurred_on:   new Date().toISOString().slice(0, 10),
        notes:         '',
    });
    // Picking a rule prefills the penalty amount (still editable).
    const pickRule = (v) => {
        setData('bonus_rule_id', v ?? '');
        const r = rules.find(x => String(x.id) === String(v));
        if (r) setData('amount', r.penalty_amount);
    };
    const submit = (e) => { e.preventDefault(); post('/system/hr/bonus/infractions', { onSuccess: onClose, preserveScroll: true }); };
    return (
        <Box component="form" onSubmit={submit} style={{ padding: 4 }}>
            <Text fw={700} style={{ color: t.textPri, marginBottom: 14 }}>Record Infraction (Kosa)</Text>
            <Select label="Employee *" data={employees.map(e => ({ value: String(e.id), label: `${e.name} (${e.employee_number})` }))} value={data.employee_id} onChange={v => setData('employee_id', v ?? '')} searchable styles={selectStyles(t)} mb="sm" error={errors.employee_id} />
            <Select label="Rule" data={rules.filter(r => r.is_active).map(r => ({ value: String(r.id), label: `${r.name} — TZS ${fmt(r.penalty_amount)}` }))} value={data.bonus_rule_id} onChange={pickRule} searchable clearable styles={selectStyles(t)} mb="sm" error={errors.bonus_rule_id} />
            <Group grow gap="md" mb="sm">
                <TextInput label="Penalty Amount (TZS) *" value={data.amount} onChange={v => setData('amount', v)} type="number" error={errors.amount} t={t} />
                <TextInput label="Date *" value={data.occurred_on} onChange={v => setData('occurred_on', v)} type="date" error={errors.occurred_on} t={t} />
            </Group>
            <TextInput label="Notes" value={data.notes} onChange={v => setData('notes', v)} placeholder="e.g. Fine ref / what happened" t={t} />
            <Group justify="flex-end" gap="sm" mt="md">
                <Box component="button" type="button" onClick={onClose} style={btnCancel(t)}>Cancel</Box>
                <Box component="button" type="submit" disabled={processing} style={btnPrimary}>{processing ? 'Saving…' : 'Record'}</Box>
            </Group>
        </Box>
    );
}

// ── Reusable section card ─────────────────────────────────────────────────────
function Section({ title, subtitle, action, children, t }) {
    return (
        <Box style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
            <Group justify="space-between" style={{ padding: '14px 18px', borderBottom: `1px solid ${t.isDark ? dk.divider : '#E2E8F0'}` }}>
                <Stack gap={1}>
                    <Text fw={700} size="sm" style={{ color: t.textPri }}>{title}</Text>
                    {subtitle && <Text size="xs" style={{ color: t.textSec }}>{subtitle}</Text>}
                </Stack>
                {action}
            </Group>
            <Box style={{ overflowX: 'auto' }}>{children}</Box>
        </Box>
    );
}

const th = (t) => ({ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: t.textSec, whiteSpace: 'nowrap' });
const tdBase = { padding: '12px 14px', fontSize: 13 };

export default function BonusIndex({ policies, rules, infractions, employees, departments, statuses }) {
    const t = useTheme();
    const can = useCan();
    const [modal, setModal] = useState(null); // { kind: 'policy'|'rule'|'infraction', item }

    const addBtn = (label, onClick, perm) => can(perm) && (
        <Box component="button" onClick={onClick} style={{ ...btnPrimary, padding: '8px 16px' }}>{label}</Box>
    );

    return (
        <DashboardLayout title="Performance Bonus">
            <Head title="Performance Bonus" />

            <Modal opened={!!modal} onClose={() => setModal(null)} withCloseButton={false}
                styles={{ content: { background: t.isDark ? '#0F1E32' : '#fff', border: `1px solid ${t.cardBorder}` } }}>
                {modal?.kind === 'policy' && <PolicyForm policy={modal.item} departments={departments} onClose={() => setModal(null)} t={t} />}
                {modal?.kind === 'rule' && <RuleForm rule={modal.item} onClose={() => setModal(null)} t={t} />}
                {modal?.kind === 'infraction' && <InfractionForm employees={employees} rules={rules} onClose={() => setModal(null)} t={t} />}
            </Modal>

            <Stack gap={2} mb="xl">
                <Text fw={800} size="xl" style={{ color: t.textPri }}>Performance Bonus</Text>
                <Text size="sm" style={{ color: t.textSec }}>Reward good work — penalties for broken rules shrink the bonus, never the salary</Text>
            </Stack>

            {/* ── Department bonus policies ── */}
            <Section t={t} title="Department Bonus" subtitle="Default monthly bonus per department (override on the employee record)"
                action={addBtn('+ Department', () => setModal({ kind: 'policy', item: null }), 'hr_bonus.edit')}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ borderBottom: `1px solid ${t.divider}` }}>
                        {['DEPARTMENT', 'MONTHLY BONUS', 'STATUS', 'DESCRIPTION', ''].map((h, i) => <th key={i} style={th(t)}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {policies.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: t.textSec }}>No department bonuses set.</td></tr>
                        ) : policies.map(p => (
                            <tr key={p.id} style={{ borderBottom: `1px solid ${t.divider}`, opacity: p.is_active ? 1 : 0.5 }}>
                                <td style={{ ...tdBase, color: t.textPri, fontWeight: 600 }}>{p.department}</td>
                                <td style={{ ...tdBase, color: '#22C55E', fontWeight: 700 }}>TZS {fmt(p.amount)}</td>
                                <td style={tdBase}><Badge size="sm" style={{ background: (p.is_active ? '#22C55E' : '#94A3B8') + '22', color: p.is_active ? '#22C55E' : '#94A3B8' }}>{p.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                <td style={{ ...tdBase, color: t.textSec }}>{p.description ?? '—'}</td>
                                <td style={{ ...tdBase, textAlign: 'right' }}>
                                    <Group gap={6} justify="flex-end">
                                        {can('hr_bonus.edit') && <Box component="button" onClick={() => setModal({ kind: 'policy', item: p })} style={{ padding: '5px 12px', borderRadius: 6, background: '#3B82F6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>✏️</Box>}
                                        {can('hr_bonus.delete') && <Box component="button" onClick={() => { if (confirm('Remove this department bonus?')) router.delete(`/system/hr/bonus/policies/${p.id}`, { preserveScroll: true }); }} style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>×</Box>}
                                    </Group>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* ── Rules / sheria ── */}
            <Section t={t} title="Rules (Sheria)" subtitle="Each broken rule deducts its penalty from the bonus"
                action={addBtn('+ Rule', () => setModal({ kind: 'rule', item: null }), 'hr_bonus.create')}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ borderBottom: `1px solid ${t.divider}` }}>
                        {['RULE', 'PENALTY', 'STATUS', 'DESCRIPTION', ''].map((h, i) => <th key={i} style={th(t)}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {rules.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: t.textSec }}>No rules yet. Add one, e.g. "Overspeeding — 20,000".</td></tr>
                        ) : rules.map(r => (
                            <tr key={r.id} style={{ borderBottom: `1px solid ${t.divider}`, opacity: r.is_active ? 1 : 0.5 }}>
                                <td style={{ ...tdBase, color: t.textPri, fontWeight: 600 }}>{r.name}</td>
                                <td style={{ ...tdBase, color: '#EF4444', fontWeight: 700 }}>− TZS {fmt(r.penalty_amount)}</td>
                                <td style={tdBase}><Badge size="sm" style={{ background: (r.is_active ? '#22C55E' : '#94A3B8') + '22', color: r.is_active ? '#22C55E' : '#94A3B8' }}>{r.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                <td style={{ ...tdBase, color: t.textSec }}>{r.description ?? '—'}</td>
                                <td style={{ ...tdBase, textAlign: 'right' }}>
                                    <Group gap={6} justify="flex-end">
                                        {can('hr_bonus.edit') && <Box component="button" onClick={() => setModal({ kind: 'rule', item: r })} style={{ padding: '5px 12px', borderRadius: 6, background: '#3B82F6', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>✏️</Box>}
                                        {can('hr_bonus.delete') && <Box component="button" onClick={() => { if (confirm('Delete this rule?')) router.delete(`/system/hr/bonus/rules/${r.id}`, { preserveScroll: true }); }} style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>×</Box>}
                                    </Group>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            {/* ── Infractions / makosa ── */}
            <Section t={t} title="Infractions (Makosa)" subtitle="Pending ones are deducted automatically when payroll runs for that month"
                action={addBtn('+ Record Infraction', () => setModal({ kind: 'infraction', item: null }), 'hr_bonus.create')}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ borderBottom: `1px solid ${t.divider}` }}>
                        {['DATE', 'EMPLOYEE', 'RULE', 'PENALTY', 'STATUS', 'NOTES', ''].map((h, i) => <th key={i} style={th(t)}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                        {infractions.length === 0 ? (
                            <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: t.textSec }}>No infractions recorded.</td></tr>
                        ) : infractions.map(inf => (
                            <tr key={inf.id} style={{ borderBottom: `1px solid ${t.divider}` }}>
                                <td style={{ ...tdBase, color: t.textSec, whiteSpace: 'nowrap' }}>{String(inf.occurred_on).slice(0, 10)}</td>
                                <td style={tdBase}>
                                    <Text fw={600} size="sm" style={{ color: t.textPri }}>{inf.employee?.name}</Text>
                                    <Text size="xs" style={{ color: t.textSec }}>{inf.employee?.employee_number}</Text>
                                </td>
                                <td style={{ ...tdBase, color: t.textPri }}>{inf.rule?.name ?? '—'}</td>
                                <td style={{ ...tdBase, color: '#EF4444', fontWeight: 700 }}>− TZS {fmt(inf.amount)}</td>
                                <td style={tdBase}><Badge size="sm" style={{ background: (STATUS_COLOR[inf.status] ?? '#94A3B8') + '22', color: STATUS_COLOR[inf.status] ?? '#94A3B8' }}>{inf.status}</Badge></td>
                                <td style={{ ...tdBase, color: t.textSec, maxWidth: 220 }}>{inf.notes ?? '—'}</td>
                                <td style={{ ...tdBase, textAlign: 'right' }}>
                                    <Group gap={6} justify="flex-end">
                                        {inf.status === 'pending' && can('hr_bonus.edit') && <Box component="button" onClick={() => { if (confirm('Waive this infraction? It will not be deducted.')) router.post(`/system/hr/bonus/infractions/${inf.id}/waive`, {}, { preserveScroll: true }); }} style={{ padding: '5px 12px', borderRadius: 6, background: 'transparent', border: `1px solid ${t.cardBorder}`, color: t.textSec, cursor: 'pointer', fontSize: 12 }}>Waive</Box>}
                                        {inf.status !== 'applied' && can('hr_bonus.delete') && <Box component="button" onClick={() => { if (confirm('Delete this infraction?')) router.delete(`/system/hr/bonus/infractions/${inf.id}`, { preserveScroll: true }); }} style={{ padding: '5px 12px', borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>×</Box>}
                                    </Group>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>
        </DashboardLayout>
    );
}
