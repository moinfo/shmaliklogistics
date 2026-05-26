import { Head, Link, router, usePage } from '@inertiajs/react';
import { Box, Text, Group, Stack, SimpleGrid, Select, Tooltip, ActionIcon } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import { useCan } from '../../../../lib/can';
import { formatDate } from '../../../../lib/date';

const dk = {
    card:    '#0F1E32',
    border:  'var(--c-border-color)',
    divider: 'rgba(255,255,255,0.06)',
    textPri: '#E2E8F0',
    textSec: 'var(--c-text-secondary)',
    textMut: 'var(--c-text-muted)',
};

function fmt(n) {
    return new Intl.NumberFormat('en-TZ').format(Number(n) || 0);
}

function DataRow({ label, value, isDark, mono = false }) {
    const textSec = isDark ? dk.textSec : '#64748B';
    const textPri = isDark ? dk.textPri : '#1E293B';
    const divider = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${divider}` }}>
            <Text size="sm" style={{ color: textSec }}>{label}</Text>
            <Text size="sm" fw={600} style={{ color: textPri, fontFamily: mono ? 'monospace' : undefined }}>{value ?? '—'}</Text>
        </Box>
    );
}

function Card({ title, children, isDark, accent }) {
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const divider    = isDark ? dk.divider : '#E2E8F0';
    return (
        <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            {accent && <Box style={{ height: 3, background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />}
            <Box style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                <Text fw={700} size="sm" style={{ color: textPri }}>{title}</Text>
            </Box>
            <Box style={{ padding: '4px 20px 16px' }}>{children}</Box>
        </Box>
    );
}

function StatusPill({ status, statuses }) {
    const meta = statuses[status] ?? { label: status, color: '#94A3B8' };
    return (
        <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: meta.color + '1A', border: `1px solid ${meta.color}40`, borderRadius: 20, padding: '3px 10px' }}>
            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
            <Text size="xs" fw={600} style={{ color: meta.color }}>{meta.label}</Text>
        </Box>
    );
}

const today = () => new Date().toISOString().slice(0, 10);

export default function ShowProperty({
    property,
    units = [],
    expenses = [],
    expenseTotal = 0,
    leases = [],
    financials = {},
    types = {},
    statuses = {},
    unitTypes = {},
    unitStatuses = {},
    expenseCategories = {},
    currencies = [],
}) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { props } = usePage();
    const can = useCan();

    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const textMut    = isDark ? dk.textMut : 'var(--c-text-secondary)';
    const divider    = isDark ? dk.divider : '#E2E8F0';

    const meta     = statuses[property.status] ?? { label: property.status, color: '#94A3B8' };
    const typeMeta = types[property.type] ?? { label: property.type };
    const flash    = props.flash ?? {};

    const inputStyle = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', color: textPri, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' };
    const dropdownStyle = { background: isDark ? '#0F1E32' : '#fff', border: `1px solid ${cardBorder}` };

    const canEdit   = can('realestate_properties.edit');
    const canDelete = can('realestate_properties.delete');

    // ---- Header actions ----
    const handleStatusChange = (status) => {
        router.patch(`/system/real-estate/properties/${property.id}/status`, { status }, { preserveScroll: true });
    };
    const confirmDelete = () => {
        if (window.confirm(`Delete ${property.code}? This cannot be undone.`)) {
            router.delete(`/system/real-estate/properties/${property.id}`);
        }
    };

    // ---- Title deed upload ----
    const [deedFile, setDeedFile] = useState(null);
    const uploadDeed = (e) => {
        e.preventDefault();
        if (!deedFile) return;
        router.post(`/system/real-estate/properties/${property.id}/title-deed`, { file: deedFile }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setDeedFile(null),
        });
    };

    // ---- Units: add / edit ----
    const blankUnit = { unit_number: '', type: Object.keys(unitTypes)[0] ?? 'room', status: 'vacant', bedrooms: '', bathrooms: '', rent_amount: '', rent_currency: currencies[0] ?? 'TZS', default_billing_cycle: 'monthly', description: '' };
    const [showUnitForm, setShowUnitForm] = useState(false);
    const [unitForm, setUnitForm] = useState(blankUnit);
    const [editingUnitId, setEditingUnitId] = useState(null);

    const submitUnit = (e) => {
        e.preventDefault();
        if (editingUnitId) {
            router.put(`/system/real-estate/units/${editingUnitId}`, unitForm, {
                preserveScroll: true,
                onSuccess: () => { setShowUnitForm(false); setEditingUnitId(null); setUnitForm(blankUnit); },
            });
        } else {
            router.post(`/system/real-estate/properties/${property.id}/units`, unitForm, {
                preserveScroll: true,
                onSuccess: () => { setShowUnitForm(false); setUnitForm(blankUnit); },
            });
        }
    };
    const startEditUnit = (u) => {
        setEditingUnitId(u.id);
        setUnitForm({
            unit_number: u.unit_number ?? '',
            type: u.type ?? 'room',
            status: u.status ?? 'vacant',
            bedrooms: u.bedrooms ?? '',
            bathrooms: u.bathrooms ?? '',
            rent_amount: u.rent_amount ?? '',
            rent_currency: u.rent_currency ?? 'TZS',
            default_billing_cycle: u.default_billing_cycle ?? 'monthly',
            description: u.description ?? '',
        });
        setShowUnitForm(true);
    };
    const cancelUnit = () => { setShowUnitForm(false); setEditingUnitId(null); setUnitForm(blankUnit); };
    const deleteUnit = (unitId) => {
        if (window.confirm('Delete this unit? This cannot be undone.')) {
            router.delete(`/system/real-estate/units/${unitId}`, { preserveScroll: true });
        }
    };

    // ---- Expense quick-add ----
    const blankExp = { property_unit_id: '', category: Object.keys(expenseCategories)[0] ?? 'repair', description: '', amount: '', currency: currencies[0] ?? 'TZS', exchange_rate: '', expense_date: today(), vendor: '', receipt_number: '' };
    const [showExpForm, setShowExpForm] = useState(false);
    const [expForm, setExpForm] = useState(blankExp);
    const addExpense = (e) => {
        e.preventDefault();
        router.post('/system/real-estate/expenses', { ...expForm, property_id: property.id }, {
            preserveScroll: true,
            onSuccess: () => { setShowExpForm(false); setExpForm(blankExp); },
        });
    };

    return (
        <DashboardLayout title={property.code}>
            <Head title={property.code} />

            {/* Flash */}
            {flash.success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 16 }}>
                    <Text size="sm" style={{ color: '#22C55E' }}>✓ {flash.success}</Text>
                </motion.div>
            )}

            {/* Header */}
            <Group justify="space-between" mb="xl">
                <Stack gap={4}>
                    <Group gap="md">
                        <Text fw={800} size="xl" style={{ color: textPri }}>{property.code}</Text>
                        <StatusPill status={property.status} statuses={statuses} />
                    </Group>
                    <Text size="sm" style={{ color: textSec }}>{property.name} · {typeMeta.label}</Text>
                </Stack>
                <Group gap="sm">
                    {canEdit && (
                        <Select
                            value={property.status}
                            onChange={handleStatusChange}
                            data={Object.entries(statuses).map(([k, v]) => ({ value: k, label: v.label }))}
                            size="sm"
                            styles={{
                                input: { background: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', border: `1px solid ${cardBorder}`, color: textPri, borderRadius: 8, width: 170 },
                                dropdown: dropdownStyle,
                            }}
                        />
                    )}
                    {canEdit && (
                        <Box
                            component={Link}
                            href={`/system/real-estate/properties/${property.id}/edit`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: `1px solid ${cardBorder}`, color: textSec, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                        >
                            ✏️ Edit
                        </Box>
                    )}
                    {canDelete && (
                        <Tooltip label="Delete property">
                            <ActionIcon onClick={confirmDelete} size={36} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#EF4444' }}>🗑️</ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            </Group>

            {/* Details + Financials */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mb="md">
                <Card title="Property Details" isDark={isDark} accent={['#1565C0', '#2196F3']}>
                    <DataRow label="Code"      value={property.code}        isDark={isDark} />
                    <DataRow label="Name"      value={property.name}        isDark={isDark} />
                    <DataRow label="Type"      value={typeMeta.label}       isDark={isDark} />
                    <DataRow label="Status"    value={meta.label}           isDark={isDark} />
                    <DataRow label="Ownership" value={property.ownership}   isDark={isDark} />
                    <DataRow label="Address"   value={property.address}     isDark={isDark} />
                    <DataRow label="Region"    value={property.region}      isDark={isDark} />
                    <DataRow label="District"  value={property.district}    isDark={isDark} />
                    {property.description && (
                        <Box style={{ paddingTop: 10 }}>
                            <Text size="xs" style={{ color: textMut, marginBottom: 4 }}>Description</Text>
                            <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap' }}>{property.description}</Text>
                        </Box>
                    )}
                </Card>

                <Card title="Acquisition & Financials" isDark={isDark} accent={['#065F46', '#059669']}>
                    <DataRow label="Acquisition Date" value={formatDate(property.acquisition_date)} isDark={isDark} />
                    <DataRow label="Purchase Price"   value={`${property.purchase_currency ?? 'TZS'} ${fmt(financials.purchase_price ?? property.purchase_price)}`} isDark={isDark} />
                    <DataRow label="Market Value"     value={`TZS ${fmt(property.market_value)}`} isDark={isDark} />
                    <DataRow label="Renovation Total" value={`TZS ${fmt(financials.renovation_total)}`} isDark={isDark} />
                    <DataRow label="Total Invested"   value={`TZS ${fmt(financials.total_invested ?? property.total_invested)}`} isDark={isDark} />
                    <DataRow label="Annual Rent Roll" value={`TZS ${fmt(financials.annual_rent_roll)}`} isDark={isDark} />
                    <DataRow label="Expense Total"    value={`TZS ${fmt(financials.expense_total ?? expenseTotal)}`} isDark={isDark} />
                </Card>
            </SimpleGrid>

            {/* Title deed */}
            <Box mb="md">
                <Card title="📄 Title Deed" isDark={isDark}>
                    <Box style={{ paddingTop: 10 }}>
                        {property.title_deed_url ? (
                            <Group justify="space-between">
                                <Stack gap={2}>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>Title deed on file</Text>
                                    {property.title_deed_number && (
                                        <Text size="xs" style={{ color: textMut, fontFamily: 'monospace' }}>{property.title_deed_number}</Text>
                                    )}
                                </Stack>
                                <Box
                                    component="a"
                                    href={property.title_deed_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(33,150,243,0.08)', border: '1px solid rgba(33,150,243,0.25)', color: '#2196F3', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}
                                >
                                    📥 View / Download
                                </Box>
                            </Group>
                        ) : canEdit ? (
                            <form onSubmit={uploadDeed}>
                                <Text size="sm" style={{ color: textMut, marginBottom: 10 }}>No title deed uploaded yet.</Text>
                                <Group gap="sm" align="center">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => setDeedFile(e.target.files?.[0] ?? null)}
                                        style={{ ...inputStyle, width: 'auto', padding: '6px 10px' }}
                                    />
                                    <Box component="button" type="submit" disabled={!deedFile} style={{ padding: '8px 18px', borderRadius: 8, background: deedFile ? 'linear-gradient(135deg,#1565C0,#2196F3)' : (isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'), color: deedFile ? '#fff' : textMut, border: 'none', cursor: deedFile ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 13 }}>
                                        Upload
                                    </Box>
                                </Group>
                            </form>
                        ) : (
                            <Text size="sm" style={{ color: textMut }}>No title deed uploaded.</Text>
                        )}
                    </Box>
                </Card>
            </Box>

            {/* Units */}
            <Box mb="md">
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                    <Group justify="space-between" style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}>
                            <Text fw={700} size="sm" style={{ color: textPri }}>🏘️ Units</Text>
                            <Box style={{ background: '#3B82F620', border: '1px solid #3B82F640', borderRadius: 12, padding: '1px 8px' }}>
                                <Text size="xs" fw={700} style={{ color: '#3B82F6' }}>{units.length}</Text>
                            </Box>
                        </Group>
                        {canEdit && (
                            <Box component="button" type="button" onClick={() => (showUnitForm ? cancelUnit() : setShowUnitForm(true))}
                                style={{ padding: '5px 14px', borderRadius: 8, background: showUnitForm ? 'transparent' : 'linear-gradient(135deg,#1565C0,#2196F3)', color: showUnitForm ? textMut : '#fff', border: showUnitForm ? `1px solid ${cardBorder}` : 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                                {showUnitForm ? 'Cancel' : '＋ Add Unit'}
                            </Box>
                        )}
                    </Group>

                    {/* Add / edit unit form */}
                    {showUnitForm && canEdit && (
                        <Box style={{ padding: '16px 20px', borderBottom: `1px solid ${divider}`, background: isDark ? 'rgba(59,130,246,0.04)' : '#F8FBFF' }}>
                            <form onSubmit={submitUnit}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 10 }}>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Unit Number *</Text>
                                        <input type="text" placeholder="e.g. Apt A, Room 1" value={unitForm.unit_number} onChange={e => setUnitForm(p => ({ ...p, unit_number: e.target.value }))} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Type *</Text>
                                        <select value={unitForm.type} onChange={e => setUnitForm(p => ({ ...p, type: e.target.value }))} style={inputStyle} required>
                                            {Object.entries(unitTypes).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Status *</Text>
                                        <select value={unitForm.status} onChange={e => setUnitForm(p => ({ ...p, status: e.target.value }))} style={inputStyle} required>
                                            {Object.entries(unitStatuses).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Bedrooms</Text>
                                        <input type="number" min="0" placeholder="0" value={unitForm.bedrooms} onChange={e => setUnitForm(p => ({ ...p, bedrooms: e.target.value }))} style={inputStyle} />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Bathrooms</Text>
                                        <input type="number" min="0" placeholder="0" value={unitForm.bathrooms} onChange={e => setUnitForm(p => ({ ...p, bathrooms: e.target.value }))} style={inputStyle} />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Rent Amount</Text>
                                        <input type="number" step="0.01" min="0" placeholder="0.00" value={unitForm.rent_amount} onChange={e => setUnitForm(p => ({ ...p, rent_amount: e.target.value }))} style={inputStyle} />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Currency</Text>
                                        <select value={unitForm.rent_currency} onChange={e => setUnitForm(p => ({ ...p, rent_currency: e.target.value }))} style={inputStyle}>
                                            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Billing Cycle</Text>
                                        <select value={unitForm.default_billing_cycle} onChange={e => setUnitForm(p => ({ ...p, default_billing_cycle: e.target.value }))} style={inputStyle}>
                                            {['monthly', 'quarterly', 'semi_annual', 'annual'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Description</Text>
                                        <input type="text" placeholder="Optional" value={unitForm.description} onChange={e => setUnitForm(p => ({ ...p, description: e.target.value }))} style={inputStyle} />
                                    </div>
                                </div>
                                <button type="submit" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#065F46,#059669)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                    {editingUnitId ? 'Update Unit' : 'Save Unit'}
                                </button>
                            </form>
                        </Box>
                    )}

                    {/* Units table */}
                    {units.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '28px 0' }}>
                            <Text size="sm" style={{ color: textMut }}>No units yet. Add a unit to start tracking occupancy.</Text>
                        </Box>
                    ) : (
                        <Box style={{ overflowX: 'auto' }}>
                            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 130px 130px 90px 130px 1fr 90px', padding: '8px 20px', borderBottom: `1px solid ${divider}`, background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                                {['Unit', 'Type', 'Status', 'Beds/Bath', 'Rent', 'Active Lease', ''].map(h => (
                                    <Text key={h} size="10px" fw={700} style={{ color: textMut, textTransform: 'uppercase', letterSpacing: 0.7 }}>{h}</Text>
                                ))}
                            </Box>
                            {units.map((u, i) => {
                                const utMeta = unitTypes[u.type] ?? { label: u.type };
                                const isVacant = u.status === 'vacant';
                                return (
                                    <Box key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 130px 90px 130px 1fr 90px', padding: '12px 20px', borderBottom: i < units.length - 1 ? `1px solid ${divider}` : 'none', alignItems: 'center' }}>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{u.unit_number}</Text>
                                        <Text size="sm" style={{ color: textSec }}>{utMeta.label}</Text>
                                        <StatusPill status={u.status} statuses={unitStatuses} />
                                        <Text size="sm" style={{ color: textSec }}>{(u.bedrooms ?? '—')}/{(u.bathrooms ?? '—')}</Text>
                                        <Text size="sm" fw={600} style={{ color: textPri }}>{u.rent_currency ?? 'TZS'} {fmt(u.rent_amount)}</Text>
                                        <Box>
                                            {u.active_lease ? (
                                                <Stack gap={1}>
                                                    <Text size="sm" style={{ color: textPri }}>{u.active_lease.tenant_name}</Text>
                                                    <Box component={Link} href={`/system/real-estate/leases/${u.active_lease.id}`} style={{ color: '#3B82F6', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                                                        {u.active_lease.lease_number} →
                                                    </Box>
                                                </Stack>
                                            ) : isVacant ? (
                                                can('realestate_leases.create') ? (
                                                    <Box component={Link} href={`/system/real-estate/leases/create?unit_id=${u.id}`} style={{ color: '#22C55E', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                                                        ＋ New Lease
                                                    </Box>
                                                ) : (
                                                    <Text size="xs" style={{ color: textMut }}>Vacant</Text>
                                                )
                                            ) : (
                                                <Text size="xs" style={{ color: textMut }}>—</Text>
                                            )}
                                        </Box>
                                        <Group gap={4} justify="flex-end">
                                            {canEdit && (
                                                <Tooltip label="Edit unit">
                                                    <ActionIcon variant="subtle" size="sm" style={{ color: textMut }} onClick={() => startEditUnit(u)}>✏️</ActionIcon>
                                                </Tooltip>
                                            )}
                                            {canEdit && (
                                                <Tooltip label="Delete unit">
                                                    <ActionIcon variant="subtle" size="sm" style={{ color: '#EF4444' }} onClick={() => deleteUnit(u.id)}>🗑</ActionIcon>
                                                </Tooltip>
                                            )}
                                        </Group>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Active leases summary */}
            {leases.length > 0 && (
                <Box mb="md">
                    <Card title="📑 Active Leases" isDark={isDark}>
                        <Box style={{ paddingTop: 8 }}>
                            {leases.map((l, i) => (
                                <Group key={l.id} justify="space-between" style={{ padding: '10px 0', borderBottom: i < leases.length - 1 ? `1px solid ${divider}` : 'none' }}>
                                    <Group gap={10}>
                                        <Box component={Link} href={`/system/real-estate/leases/${l.id}`} style={{ color: '#3B82F6', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>{l.lease_number}</Box>
                                        <Text size="sm" style={{ color: textSec }}>{l.tenant_name}{l.unit_number ? ` · ${l.unit_number}` : ''}</Text>
                                    </Group>
                                    <Text size="sm" fw={600} style={{ color: textPri }}>{l.rent_currency ?? 'TZS'} {fmt(l.rent_amount)}</Text>
                                </Group>
                            ))}
                        </Box>
                    </Card>
                </Box>
            )}

            {/* Expenses */}
            <Box mb="md">
                <Box style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                    <Group justify="space-between" style={{ padding: '14px 20px', borderBottom: `1px solid ${divider}` }}>
                        <Group gap={8}>
                            <Text fw={700} size="sm" style={{ color: textPri }}>💸 Expenses</Text>
                            {Number(expenseTotal) > 0 && (
                                <Box style={{ background: '#EF444420', border: '1px solid #EF444440', borderRadius: 12, padding: '1px 8px' }}>
                                    <Text size="xs" fw={700} style={{ color: '#EF4444' }}>TZS {fmt(expenseTotal)} total</Text>
                                </Box>
                            )}
                        </Group>
                        {can('realestate_expenses.create') && (
                            <Box component="button" type="button" onClick={() => setShowExpForm(v => !v)}
                                style={{ padding: '5px 14px', borderRadius: 8, background: showExpForm ? 'transparent' : 'linear-gradient(135deg,#1565C0,#2196F3)', color: showExpForm ? textMut : '#fff', border: showExpForm ? `1px solid ${cardBorder}` : 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                                {showExpForm ? 'Cancel' : '＋ Add Expense'}
                            </Box>
                        )}
                    </Group>

                    {/* Quick-add expense form */}
                    {showExpForm && can('realestate_expenses.create') && (
                        <Box style={{ padding: '16px 20px', borderBottom: `1px solid ${divider}`, background: isDark ? 'rgba(59,130,246,0.04)' : '#F8FBFF' }}>
                            <form onSubmit={addExpense}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 10 }}>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Unit</Text>
                                        <select value={expForm.property_unit_id} onChange={e => setExpForm(p => ({ ...p, property_unit_id: e.target.value }))} style={inputStyle}>
                                            <option value="">— Whole property —</option>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.unit_number}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Category *</Text>
                                        <select value={expForm.category} onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))} style={inputStyle} required>
                                            {Object.entries(expenseCategories).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Description *</Text>
                                        <input type="text" placeholder="e.g. Repaint exterior walls" value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Amount *</Text>
                                        <input type="number" step="0.01" min="0" placeholder="0.00" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Currency</Text>
                                        <select value={expForm.currency} onChange={e => setExpForm(p => ({ ...p, currency: e.target.value }))} style={inputStyle}>
                                            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    {expForm.currency !== 'TZS' && (
                                        <div>
                                            <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Rate (TZS/1) *</Text>
                                            <input type="number" step="0.01" min="0" placeholder="0.00" value={expForm.exchange_rate} onChange={e => setExpForm(p => ({ ...p, exchange_rate: e.target.value }))} style={inputStyle} required />
                                        </div>
                                    )}
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Date *</Text>
                                        <input type="date" value={expForm.expense_date} onChange={e => setExpForm(p => ({ ...p, expense_date: e.target.value }))} style={inputStyle} required />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Vendor</Text>
                                        <input type="text" placeholder="Optional" value={expForm.vendor} onChange={e => setExpForm(p => ({ ...p, vendor: e.target.value }))} style={inputStyle} />
                                    </div>
                                    <div>
                                        <Text size="xs" fw={600} style={{ color: textMut, marginBottom: 3 }}>Receipt #</Text>
                                        <input type="text" placeholder="Optional" value={expForm.receipt_number} onChange={e => setExpForm(p => ({ ...p, receipt_number: e.target.value }))} style={inputStyle} />
                                    </div>
                                </div>
                                <button type="submit" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#065F46,#059669)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                    Save Expense
                                </button>
                            </form>
                        </Box>
                    )}

                    {/* Expenses list */}
                    {expenses.length === 0 ? (
                        <Box style={{ textAlign: 'center', padding: '28px 0' }}>
                            <Text size="sm" style={{ color: textMut }}>No expenses recorded for this property yet.</Text>
                        </Box>
                    ) : (
                        <Box>
                            {expenses.map((exp, i) => {
                                const cat = expenseCategories[exp.category] ?? { icon: '📦', label: exp.category };
                                return (
                                    <Group key={exp.id} justify="space-between" style={{ padding: '12px 20px', borderBottom: i < expenses.length - 1 ? `1px solid ${divider}` : 'none' }}>
                                        <Group gap={10}>
                                            <Text size="md">{cat.icon}</Text>
                                            <Box>
                                                <Text size="sm" fw={600} style={{ color: textPri }}>{exp.description}</Text>
                                                <Text size="xs" style={{ color: textMut }}>{cat.label} · {formatDate(exp.expense_date)}{exp.vendor ? ` · ${exp.vendor}` : ''}</Text>
                                            </Box>
                                        </Group>
                                        <Text fw={700} size="sm" style={{ color: '#EF4444' }}>TZS {fmt(exp.amount_tzs)}</Text>
                                    </Group>
                                );
                            })}
                            <Group justify="flex-end" style={{ padding: '12px 20px', borderTop: `1px solid ${divider}` }}>
                                <Text size="sm" fw={800} style={{ color: textPri }}>Total: <span style={{ color: '#EF4444' }}>TZS {fmt(expenseTotal)}</span></Text>
                            </Group>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Notes */}
            {property.notes && (
                <Box mb="md">
                    <Card title="📝 Notes" isDark={isDark}>
                        <Text size="sm" style={{ color: textSec, whiteSpace: 'pre-wrap', paddingTop: 8 }}>{property.notes}</Text>
                    </Card>
                </Box>
            )}

            {/* Back link */}
            <Box mt="xl">
                <Box component={Link} href="/system/real-estate/properties" style={{ color: textMut, textDecoration: 'none', fontSize: 13 }}>← Back to Properties</Box>
            </Box>
        </DashboardLayout>
    );
}