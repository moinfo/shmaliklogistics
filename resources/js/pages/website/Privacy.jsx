import { Head } from '@inertiajs/react';
import { Box, Container, Title, Text, Stack, Badge, Group, Anchor, SimpleGrid } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import WebsiteLayout from '../../layouts/WebsiteLayout';
import { ScrollReveal } from '../../components/Animate';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Privacy() {
    const { T } = useLanguage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { hero, toc, intro, sections } = T.privacy;

    const card = isDark
        ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'none' }
        : { background: '#fff', border: '1px solid #F1E4DA', boxShadow: '0 6px 28px rgba(194,65,12,0.07)' };

    const textColor = isDark ? 'gray.4' : '#475569';
    const headColor = isDark ? 'white' : '#1E293B';

    return (
        <WebsiteLayout>
            <Head title={`${hero.title} ${hero.highlight} — Trans-Mas Logistics`} />

            {/* ── Hero ── */}
            <Box style={{ position: 'relative', overflow: 'hidden', background: isDark ? 'linear-gradient(135deg, #0A0400 0%, #C2410C 100%)' : 'linear-gradient(135deg, #7A2800 0%, #C2410C 55%, #EA580C 100%)' }}>
                <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
                <Box style={{ position: 'absolute', top: -120, right: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <Container size="lg" py={80} style={{ position: 'relative', zIndex: 1 }}>
                    <Stack align="center" gap="md">
                        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <Badge color="orange" variant="white" size="xl" radius="xl">{hero.badge}</Badge>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                            <Title order={1} c="white" ta="center" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 900 }}>
                                {hero.title}{' '}
                                <Text component="span" inherit style={{ color: '#FFD9B8' }}>{hero.highlight}</Text>
                            </Title>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                            <Text c="rgba(255,255,255,0.88)" ta="center" maw={620} size="lg" lh={1.7}>{hero.desc}</Text>
                        </motion.div>
                        <Badge variant="outline" color="gray.0" radius="xl" size="lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.45)' }}>{hero.updated}</Badge>
                    </Stack>
                </Container>
            </Box>

            {/* ── Body ── */}
            <Box py={60} style={{ background: isDark ? '#0A0400' : '#FFF8F3' }}>
                <Container size="lg">
                    <Box style={{ ...card, borderRadius: 20, padding: '26px 28px' }} mb={36}>
                        <Text c={textColor} size="md" lh={1.85}>{intro}</Text>
                    </Box>

                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing={36} style={{ alignItems: 'flex-start' }}>
                        {/* Contents */}
                        <Box visibleFrom="md" style={{ position: 'sticky', top: 96 }}>
                            <Box style={{ ...card, borderRadius: 20, padding: '22px 22px' }}>
                                <Group gap={8} mb={12}>
                                    <Box style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #EA580C, #C2410C)', borderRadius: 2 }} />
                                    <Text fw={800} size="sm" tt="uppercase" c={headColor} style={{ letterSpacing: 1.6 }}>{toc}</Text>
                                </Group>
                                <Stack gap={6}>
                                    {sections.map((s, i) => (
                                        <Anchor key={s.title} href={`#privacy-${i + 1}`}
                                            style={{ textDecoration: 'none', fontSize: 13.5, color: isDark ? '#94A3B8' : '#64748B', display: 'flex', gap: 8, lineHeight: 1.5 }}>
                                            <span style={{ color: '#EA580C', fontWeight: 800, minWidth: 20 }}>{i + 1}.</span>
                                            {s.title}
                                        </Anchor>
                                    ))}
                                </Stack>
                            </Box>
                        </Box>

                        {/* Sections */}
                        <Stack gap="lg" style={{ gridColumn: 'span 2' }}>
                            {sections.map((s, i) => (
                                <ScrollReveal key={s.title}>
                                    <Box id={`privacy-${i + 1}`} style={{ ...card, borderRadius: 20, padding: '28px 30px', scrollMarginTop: 96 }}>
                                        <Group gap={14} mb={14} wrap="nowrap" align="center">
                                            <Box style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #C2410C, #EA580C)', color: '#fff', fontWeight: 800, boxShadow: '0 6px 16px rgba(234,88,12,0.35)' }}>
                                                {i + 1}
                                            </Box>
                                            <Title order={3} c={headColor} style={{ fontSize: '1.25rem', fontWeight: 800 }}>{s.title}</Title>
                                        </Group>

                                        {s.paras?.map((p, k) => (
                                            <Text key={k} c={textColor} size="md" lh={1.85} mb={s.items || s.contact ? 10 : 0}>{p}</Text>
                                        ))}

                                        {s.items && (
                                            <Stack gap={10} mt={4}>
                                                {s.items.map((it) => (
                                                    <Group key={it} gap={12} align="flex-start" wrap="nowrap">
                                                        <Box style={{ width: 7, height: 7, borderRadius: '50%', background: '#EA580C', flexShrink: 0, marginTop: 11 }} />
                                                        <Text c={textColor} size="md" lh={1.8}>{it}</Text>
                                                    </Group>
                                                ))}
                                            </Stack>
                                        )}

                                        {s.after && <Text c={textColor} size="md" lh={1.85} mt={14}>{s.after}</Text>}

                                        {s.contact && (
                                            <Stack gap={10} mt={6}>
                                                {s.contact.map((c) => (
                                                    <Group key={c.text} gap={12} style={{ background: isDark ? 'rgba(234,88,12,0.08)' : '#FFF3EA', border: '1px solid rgba(234,88,12,0.18)', borderRadius: 12, padding: '10px 14px' }}>
                                                        <Text size="md">{c.icon}</Text>
                                                        <Text c={isDark ? 'gray.3' : '#7A2800'} size="sm" fw={600}>{c.text}</Text>
                                                    </Group>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </ScrollReveal>
                            ))}
                        </Stack>
                    </SimpleGrid>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}
