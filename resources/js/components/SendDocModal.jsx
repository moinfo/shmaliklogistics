import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Box, Text, Group } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

const dk = { card: '#0F1E32', border: 'rgba(33,150,243,0.12)', textPri: '#E2E8F0', textSec: '#94A3B8' };
const fmt = n => new Intl.NumberFormat('en-TZ').format(Math.round(Number(n) || 0));

function buildDefaultMessage(doc, company, tab) {
    const compName  = company?.company_name  ?? 'Your logistics provider';
    const compPhone = company?.company_phone ?? '';
    const compEmail = company?.company_email ?? '';
    const cur       = doc.currency ?? 'TZS';
    const labels    = { quote: 'Quotation', proforma: 'Proforma Invoice', invoice: 'Tax Invoice' };
    const label     = labels[doc.type] ?? 'Document';
    const dueStr    = doc.due_date ? new Date(doc.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

    if (tab === 'whatsapp') {
        return [
            `Dear ${doc.client?.name ?? 'Valued Customer'},`,
            '',
            `Please find below the details for your *${label}* from *${compName}*:`,
            '',
            `📄 *Document:* ${doc.document_number}`,
            `💰 *Amount:* ${cur} ${fmt(doc.total)}`,
            dueStr ? `📅 *Due Date:* ${dueStr}` : null,
            doc.type === 'invoice' && Number(doc.balance_due) > 0 ? `⚠️ *Balance Due:* ${cur} ${fmt(doc.balance_due)}` : null,
            '',
            'For any queries, please do not hesitate to contact us.',
            compPhone ? `📞 ${compPhone}` : null,
            compEmail ? `📧 ${compEmail}` : null,
            '',
            `Thank you for your business!\n— ${compName}`,
        ].filter(l => l !== null).join('\n');
    }

    return [
        `Dear ${doc.client?.name ?? 'Valued Customer'},`,
        '',
        `Please find your ${label.toLowerCase()} #${doc.document_number} from ${compName} attached to this email.`,
        '',
        `Amount: ${cur} ${fmt(doc.total)}`,
        dueStr ? `Due Date: ${dueStr}` : null,
        doc.type === 'invoice' && Number(doc.balance_due) > 0 ? `Balance Due: ${cur} ${fmt(doc.balance_due)}` : null,
        '',
        'Please do not hesitate to reach out if you have any questions.',
        '',
        `Kind regards,\n${compName}`,
        [compPhone, compEmail].filter(Boolean).join(' | ') || null,
    ].filter(l => l !== null).join('\n');
}

function buildSubject(doc, company) {
    const compName = company?.company_name ?? 'Us';
    const labels   = { quote: 'Quotation', proforma: 'Proforma Invoice', invoice: 'Tax Invoice' };
    return `${labels[doc.type] ?? 'Document'} ${doc.document_number} from ${compName}`;
}

export default function SendDocModal({ doc, docType, opened, onClose, company }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark     = colorScheme === 'dark';
    const textPri    = isDark ? dk.textPri : '#1E293B';
    const textSec    = isDark ? dk.textSec : '#64748B';
    const cardBg     = isDark ? dk.card : '#ffffff';
    const cardBorder = isDark ? dk.border : '#E2E8F0';
    const inputBg    = isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC';
    const overlayBg  = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)';

    const [tab, setTab] = useState('email');

    const sendUrl = `/system/billing/${docType}s/${doc.id}/send`;

    const emailForm = useForm({
        to:      doc.client?.email ?? '',
        subject: buildSubject(doc, company),
        message: buildDefaultMessage(doc, company, 'email'),
    });

    const [waPhone,   setWaPhone]   = useState(doc.client?.phone ?? '');
    const [waMessage, setWaMessage] = useState(buildDefaultMessage(doc, company, 'whatsapp'));

    const sendEmail = (e) => {
        e.preventDefault();
        emailForm.post(sendUrl, { onSuccess: onClose });
    };

    const openWhatsApp = () => {
        const raw   = waPhone.replace(/\s/g, '').replace(/^0/, '255').replace(/^\+/, '');
        const url   = `https://wa.me/${raw}?text=${encodeURIComponent(waMessage)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (!opened) return null;

    const inp = (label, value, onChange, type = 'text', placeholder = '') => (
        <Box mb="sm">
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box
                component="input"
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8, outline: 'none',
                    border: `1px solid ${cardBorder}`, background: inputBg,
                    color: textPri, fontSize: 13, boxSizing: 'border-box',
                }}
            />
        </Box>
    );

    const textarea = (label, value, onChange, rows = 5) => (
        <Box mb="sm">
            <Text size="xs" fw={600} style={{ color: textSec, marginBottom: 4 }}>{label}</Text>
            <Box
                component="textarea"
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={rows}
                style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8, outline: 'none',
                    border: `1px solid ${cardBorder}`, background: inputBg,
                    color: textPri, fontSize: 13, resize: 'vertical', boxSizing: 'border-box',
                    fontFamily: 'inherit', lineHeight: 1.7,
                }}
            />
        </Box>
    );

    return (
        <Box
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: overlayBg, backdropFilter: 'blur(2px)', padding: 16,
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <Box style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: 16, width: '100%', maxWidth: 540,
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            }}>
                {/* Modal header */}
                <Box style={{
                    padding: '18px 24px', borderBottom: `1px solid ${cardBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <Box>
                        <Text fw={800} size="sm" style={{ color: textPri }}>Send Document</Text>
                        <Text size="xs" style={{ color: textSec }}>{doc.document_number} &mdash; {doc.client?.name}</Text>
                    </Box>
                    <Box component="button" onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSec, fontSize: 18, lineHeight: 1, padding: 4 }}>
                        ✕
                    </Box>
                </Box>

                {/* Tabs */}
                <Box style={{ padding: '14px 24px 0', display: 'flex', gap: 8 }}>
                    {[
                        { key: 'email',     icon: '📧', label: 'Email' },
                        { key: 'whatsapp',  icon: '💬', label: 'WhatsApp' },
                    ].map(t => (
                        <Box
                            key={t.key}
                            component="button"
                            onClick={() => setTab(t.key)}
                            style={{
                                padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: 13,
                                background: tab === t.key
                                    ? (t.key === 'whatsapp' ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#1565C0,#2196F3)')
                                    : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                                color: tab === t.key ? '#fff' : textSec,
                            }}
                        >
                            {t.icon} {t.label}
                        </Box>
                    ))}
                </Box>

                {/* Body */}
                <Box style={{ padding: '16px 24px 20px' }}>
                    {tab === 'email' ? (
                        <form onSubmit={sendEmail}>
                            {inp('To *', emailForm.data.to, v => emailForm.setData('to', v), 'email', 'client@email.com')}
                            {emailForm.errors.to && <Text size="xs" style={{ color: '#EF4444', marginTop: -8, marginBottom: 8 }}>{emailForm.errors.to}</Text>}
                            {inp('Subject *', emailForm.data.subject, v => emailForm.setData('subject', v), 'text', 'Subject')}
                            {emailForm.errors.subject && <Text size="xs" style={{ color: '#EF4444', marginTop: -8, marginBottom: 8 }}>{emailForm.errors.subject}</Text>}
                            {textarea('Message', emailForm.data.message, v => emailForm.setData('message', v), 6)}
                            <Text size="xs" style={{ color: textSec, marginBottom: 14 }}>
                                A summary of the document will be included in the email body automatically.
                            </Text>
                            <Group justify="flex-end" gap="sm">
                                <Box component="button" type="button" onClick={onClose}
                                    style={{ padding: '8px 18px', borderRadius: 8, background: 'none', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 13 }}>
                                    Cancel
                                </Box>
                                <Box component="button" type="submit" disabled={emailForm.processing}
                                    style={{ padding: '8px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, opacity: emailForm.processing ? 0.7 : 1 }}>
                                    {emailForm.processing ? 'Sending…' : '📧 Send Email'}
                                </Box>
                            </Group>
                        </form>
                    ) : (
                        <Box>
                            {inp('WhatsApp Number *', waPhone, setWaPhone, 'tel', '+255 7XX XXX XXX')}
                            {textarea('Message', waMessage, setWaMessage, 7)}
                            <Text size="xs" style={{ color: textSec, marginBottom: 14 }}>
                                Opens WhatsApp with this pre-filled message. The recipient must be in your contacts or have WhatsApp.
                            </Text>
                            <Group justify="flex-end" gap="sm">
                                <Box component="button" onClick={onClose}
                                    style={{ padding: '8px 18px', borderRadius: 8, background: 'none', border: `1px solid ${cardBorder}`, color: textSec, cursor: 'pointer', fontSize: 13 }}>
                                    Cancel
                                </Box>
                                <Box component="button" onClick={openWhatsApp} disabled={!waPhone.trim()}
                                    style={{ padding: '8px 22px', borderRadius: 8, background: waPhone.trim() ? 'linear-gradient(135deg,#059669,#10B981)' : '#94A3B8', color: '#fff', border: 'none', cursor: waPhone.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 13 }}>
                                    💬 Open WhatsApp →
                                </Box>
                            </Group>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
