import { Head, Link } from '@inertiajs/react';
import { Box, Container, Title, Text, Stack, SimpleGrid, Badge, TextInput, Group } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import WebsiteLayout from '../../layouts/WebsiteLayout';

const block = (e) => e.preventDefault();

function matches(emp, q) {
    return emp.name.toLowerCase().includes(q) || emp.roles.some((r) => r.toLowerCase().includes(q));
}

function MemberCard({ emp, i, isDark }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, 10) * 0.05 }}
            whileHover={{ y: -8, scale: 1.025 }}
            style={{ cursor: 'pointer' }}
        >
            <Link href={`/team/${emp.slug}`} style={{ textDecoration: 'none' }}>
                <Box
                    style={{
                        borderRadius: 18,
                        overflow: 'hidden',
                        boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.12)',
                        border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                        background: isDark ? '#0d1f3c' : '#fff',
                        transition: 'box-shadow 0.25s',
                        position: 'relative',
                    }}
                >
                    {/* Full portrait card image */}
                    <Box style={{ width: '100%', aspectRatio: '0.63 / 1', overflow: 'hidden', background: '#0A1628', position: 'relative' }}>
                        <img
                            src={emp.image}
                            alt={emp.name}
                            draggable="false"
                            onContextMenu={block}
                            onDragStart={block}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', userSelect: 'none', WebkitUserDrag: 'none' }}
                        />
                        <div onContextMenu={block} onDragStart={block} style={{ position: 'absolute', inset: 0, zIndex: 1, WebkitTouchCallout: 'none' }} />
                    </Box>

                    {/* Role badge pinned at bottom */}
                    <Box
                        style={{
                            padding: '10px 12px 12px',
                            background: isDark ? 'linear-gradient(180deg, #0d1f3c 0%, #0a1628 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f5f8ff 100%)',
                            borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
                        }}
                    >
                        <Text fw={700} size="xs" c={isDark ? 'white' : 'dark.7'} lineClamp={1} style={{ letterSpacing: 0.1 }}>
                            {emp.name}
                        </Text>
                        <Text c="brand.3" size="xs" mt={3} fw={500} lineClamp={1} style={{ fontSize: 11 }}>
                            {emp.roles.join(' · ')}
                        </Text>
                    </Box>
                </Box>
            </Link>
        </motion.div>
    );
}

export default function Team({ groups }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [query, setQuery] = useState('');

    // Apply the search within each company group, dropping empty groups.
    const filteredGroups = useMemo(() => {
        const q = query.trim().toLowerCase();
        return groups
            .map((g) => ({ ...g, employees: q ? g.employees.filter((e) => matches(e, q)) : g.employees }))
            .filter((g) => g.employees.length > 0);
    }, [query, groups]);

    const resultCount = filteredGroups.reduce((n, g) => n + g.employees.length, 0);

    return (
        <WebsiteLayout>
            <Head title="Our Team — Trans-Mas Logistics" />

            {/* ── Hero ── */}
            <Box style={{ position: 'relative', overflow: 'hidden', minHeight: 300, display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #0A1628 0%, #0E4FA0 100%)' }}>
                <Box style={{ position: 'absolute', inset: 0, background: 'rgba(10,22,40,0.4)' }} />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }} py={72}>
                    <Stack align="center" gap="md">
                        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <Badge color="brand.2" variant="light" size="xl" radius="xl">Our People</Badge>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                            <Title order={1} c="white" ta="center" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900 }}>
                                Meet the{' '}
                                <Text component="span" style={{ color: '#ED8E8E', WebkitTextFillColor: '#ED8E8E' }} inherit>
                                    Team
                                </Text>
                            </Title>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                            <Text c="gray.3" ta="center" size="md" maw={480}>
                                Scan an NFC card or tap a member to connect.
                            </Text>
                        </motion.div>
                    </Stack>
                </Container>
            </Box>

            {/* ── Search ── */}
            <Box style={{ background: isDark ? '#080f1e' : '#f0f4f8' }} pt={40} pb={0}>
                <Container size="lg">
                    <TextInput
                        placeholder="Search by name or role…"
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        size="md"
                        radius="xl"
                        styles={{
                            input: {
                                background: isDark ? '#0d1f3c' : '#fff',
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                color: isDark ? '#fff' : '#111',
                                paddingLeft: 20,
                            },
                        }}
                        leftSection={<span style={{ paddingLeft: 4, color: '#888' }}>🔍</span>}
                    />
                    {query && (
                        <Text size="sm" c="dimmed" mt={8} pl={4}>
                            {resultCount} result{resultCount !== 1 ? 's' : ''} for "{query}"
                        </Text>
                    )}
                </Container>
            </Box>

            {/* ── Grouped grids (one section per company) ── */}
            <Box py={40} style={{ background: isDark ? '#080f1e' : '#f0f4f8' }}>
                <Container size="lg">
                    {filteredGroups.length === 0 && (
                        <Text c="dimmed" ta="center" py={40}>No team members match your search.</Text>
                    )}
                    <Stack gap={48}>
                        {filteredGroups.map((group) => (
                            <Box key={group.code}>
                                <Group justify="center" mb={24}>
                                    <Box style={{ height: 1, flex: 1, maxWidth: 80, background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }} />
                                    <Title order={2} ta="center" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, color: isDark ? '#fff' : '#0A1628' }}>
                                        {group.name}
                                    </Title>
                                    <Box style={{ height: 1, flex: 1, maxWidth: 80, background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }} />
                                </Group>
                                <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="lg">
                                    {group.employees.map((emp, i) => (
                                        <MemberCard key={emp.slug} emp={emp} i={i} isDark={isDark} />
                                    ))}
                                </SimpleGrid>
                            </Box>
                        ))}
                    </Stack>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}
