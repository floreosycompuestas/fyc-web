'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Box, Button, Container, VStack, HStack, Text, Heading, Spinner, Flex, Separator,
} from '@chakra-ui/react';
import { Card, CardBody } from '@chakra-ui/card';
import { FiArrowLeft, FiAlertCircle, FiDownload, FiUser, FiExternalLink, FiGitBranch } from 'react-icons/fi';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';
import type { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree';

// Dynamic import — D3 requires the DOM, cannot run on server
const Tree = dynamic(() => import('react-d3-tree').then(m => m.Tree), {
  ssr: false,
  loading: () => (
    <Flex align="center" justify="center" h="400px">
      <Spinner size="xl" color="teal.500" />
    </Flex>
  ),
});

interface Bird {
  id: number;
  band_id: string;
  name?: string;
  sex?: string;
  dob?: string;
  father_id?: number;
  mother_id?: number;
  breeder_id?: number;
  owner_id?: number;
}

interface BirdNode extends Bird {
  father?: BirdNode;
  mother?: BirdNode;
}

interface SelectedBird {
  id: string;
  bandId: string;
  displayName: string;
  sex: string;
  dob: string;
  isRoot: boolean;
}

/** Convert BirdNode hierarchy → react-d3-tree RawNodeDatum.
 *  Father/mother become "children" in the tree so the chart branches
 *  left-to-right: Subject → Parents → Grandparents → … */
function toBirdTreeData(bird: BirdNode, isRoot = false): RawNodeDatum {
  const ancestors: RawNodeDatum[] = [];
  if (bird.father) ancestors.push(toBirdTreeData(bird.father));
  if (bird.mother) ancestors.push(toBirdTreeData(bird.mother));
  return {
    name: bird.band_id,
    attributes: {
      id: String(bird.id),
      displayName: bird.name ?? '',
      sex: bird.sex ?? '',
      dob: bird.dob ? new Date(bird.dob).toLocaleDateString() : '',
      isRoot: isRoot ? 'true' : 'false',
    },
    children: ancestors.length > 0 ? ancestors : undefined,
  };
}

const MSG_COLORS = {
  success: { bg: 'green.50', border: 'green.500', text: 'green.800' },
  error:   { bg: 'red.50',   border: 'red.500',   text: 'red.800'   },
  info:    { bg: 'blue.50',  border: 'blue.500',  text: 'blue.800'  },
} as const;

export default function FamilyTreePage() {
  const router    = useRouter();
  const params    = useParams();
  const birdId    = params?.id as string;
  const canvasRef = useRef<HTMLDivElement>(null);

  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [birdTree,     setBirdTree]     = useState<BirdNode | null>(null);
  const [treeData,     setTreeData]     = useState<RawNodeDatum | null>(null);
  const [canvasH,      setCanvasH]      = useState(600);
  const [isExporting,  setIsExporting]  = useState(false);
  const [exportMsg,    setExportMsg]    = useState<{ type: keyof typeof MSG_COLORS; text: string } | null>(null);
  const [selectedBird, setSelectedBird] = useState<SelectedBird | null>(null);

  /* ── measure canvas height for centering the root node ── */
  useEffect(() => {
    const update = () => {
      if (canvasRef.current) setCanvasH(canvasRef.current.offsetHeight);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* ── auth ── */
  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }); } catch {}
    router.push('/login');
  };

  /* ── PDF export via html-to-image (no CSS color-function parsing errors) ── */
  const handleExportPDF = async () => {
    if (!canvasRef.current || !birdTree) return;
    setIsExporting(true);
    setExportMsg({ type: 'info', text: 'Generating PDF…' });
    try {
      const { toPng }  = await import('html-to-image');
      const { jsPDF }  = await import('jspdf');

      const dataUrl = await toPng(canvasRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>(res => { img.onload = () => res(); });

      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const m  = 10;
      let w = pw - m * 2;
      let h = (img.height * w) / img.width;
      if (h > ph - m * 2) { h = ph - m * 2; w = (img.width * h) / img.height; }
      pdf.addImage(dataUrl, 'PNG', (pw - w) / 2, m, w, h);
      pdf.setProperties({ title: `Family Tree – ${birdTree.band_id}` });

      const filename =
        `FamilyTree_${birdTree.band_id.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      setExportMsg({ type: 'success', text: `✓ Saved as ${filename}` });
    } catch (err) {
      setExportMsg({ type: 'error', text: `✗ Export failed: ${err instanceof Error ? err.message : 'Unknown error'}` });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportMsg(null), 6000);
    }
  };

  /* ── recursive bird fetch ── */
  const fetchWithAncestors = useCallback(async (id: number, depth = 0): Promise<BirdNode | null> => {
    if (depth > 4) return null;
    try {
      const res = await fetch(`/api/birds/${id}`, { credentials: 'include' });
      if (!res.ok) return null;
      const bird: Bird = await res.json();
      const node: BirdNode = { ...bird };
      if (bird.father_id) node.father = (await fetchWithAncestors(bird.father_id, depth + 1)) ?? undefined;
      if (bird.mother_id) node.mother = (await fetchWithAncestors(bird.mother_id, depth + 1)) ?? undefined;
      return node;
    } catch { return null; }
  }, []);

  useEffect(() => {
    if (!birdId) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const tree = await fetchWithAncestors(parseInt(birdId));
        if (!tree) throw new Error('Failed to load bird family tree');
        setBirdTree(tree);
        setTreeData(toBirdTreeData(tree, true));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load family tree');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [birdId, fetchWithAncestors]);

  /* ── custom SVG node ── */
  const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const renderNode = useCallback(({ nodeDatum }: CustomNodeElementProps) => {
    const sex    = nodeDatum.attributes?.sex as string;
    const isRoot = nodeDatum.attributes?.isRoot === 'true';
    const name   = nodeDatum.attributes?.displayName as string;
    const dob    = nodeDatum.attributes?.dob as string;
    const id     = nodeDatum.attributes?.id as string;
    const W = 248, H = 120;

    let bg: string, border: string, label: string;
    if (isRoot)        { bg = '#EBF8FF'; border = '#3182CE'; label = 'SUBJECT'; }
    else if (sex==='M'){ bg = '#E0F7FA'; border = '#00838F'; label = 'COCK';    }
    else if (sex==='F'){ bg = '#FCE4EC'; border = '#C2185B'; label = 'HEN';     }
    else               { bg = '#F7FAFC'; border = '#A0AEC0'; label = 'UNKNOWN'; }

    const badgeBg   = sex === 'M' ? '#0369A1' : sex === 'F' ? '#BE185D' : '#64748B';
    const BADGE_R   = 19;
    const badgeX    = W/2 - BADGE_R - 7;
    const badgeY    = -H/2 + BADGE_R + 7;
    const isSelected = selectedBird?.id === id;

    const handleSelect = () =>
      setSelectedBird({ id, bandId: nodeDatum.name, displayName: name, sex, dob, isRoot });

    return (
      <g style={{ cursor: 'pointer' }} onClick={handleSelect}>
        {/* Selection ring */}
        {isSelected && (
          <rect
            x={-W/2 - 5} y={-H/2 - 5} width={W + 10} height={H + 10} rx={16}
            fill="none" stroke="#3182CE" strokeWidth={3} strokeDasharray="6 3" opacity={0.8}
          />
        )}

        {/* Card */}
        <rect x={-W/2} y={-H/2} width={W} height={H} rx={12}
          fill={bg} stroke={isSelected ? '#2B6CB0' : border} strokeWidth={isSelected ? 3.5 : 2.5}
        />
        <rect x={-W/2+1} y={-H/2+1} width={W-2} height={H-2} rx={11}
          fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={2}
        />

        {/* ── Sex badge circle ── */}
        <circle cx={badgeX} cy={badgeY} r={BADGE_R} fill={badgeBg} />

        {sex === 'M' ? (
          /* Mars ♂ — circle + arrow pointing upper-right, drawn in white strokes */
          <g transform={`translate(${badgeX},${badgeY})`}
            stroke="white" strokeWidth="2.2" fill="none"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="-2" cy="4" r="7"/>
            <line x1="3" y1="-2" x2="10" y2="-9"/>
            <polyline points="6,-9 10,-9 10,-5"/>
          </g>
        ) : sex === 'F' ? (
          /* Venus ♀ — circle + vertical stem + crossbar, drawn in white strokes */
          <g transform={`translate(${badgeX},${badgeY})`}
            stroke="white" strokeWidth="2.2" fill="none"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="0" cy="-4" r="7"/>
            <line x1="0" y1="3" x2="0" y2="12"/>
            <line x1="-5" y1="8" x2="5" y2="8"/>
          </g>
        ) : (
          <text x={badgeX} y={badgeY} textAnchor="middle" dominantBaseline="central"
            fontSize="16" fill="white" fontFamily={FONT}>?</text>
        )}

        {/* Role label (left-aligned, leaves room for badge) */}
        <text
          x={-W/2 + 14} y={-H/2 + 20}
          textAnchor="start"
          fontSize="10" fontWeight="700" letterSpacing="1.4"
          fill={border}
          fontFamily={FONT}
        >
          {label}
        </text>

        {/* Divider */}
        <line
          x1={-W/2+12} y1={-H/2+30}
          x2={W/2-12}  y2={-H/2+30}
          stroke={border} strokeWidth={1} opacity={0.35}
        />

        {/* Band ID */}
        <text
          x={0} y={-H/2+56}
          textAnchor="middle"
          fontSize="15" fontWeight="700"
          fill="#1A365D"
          fontFamily={FONT}
        >
          {nodeDatum.name}
        </text>

        {/* Bird name */}
        {name ? (
          <text
            x={0} y={-H/2+76}
            textAnchor="middle"
            fontSize="12" fontWeight="500"
            fill="#4A5568"
            fontFamily={FONT}
          >
            {name}
          </text>
        ) : null}

        {/* DOB */}
        {dob ? (
          <text
            x={0} y={-H/2+96}
            textAnchor="middle"
            fontSize="11" fontWeight="400"
            fill="#718096"
            fontFamily={FONT}
          >
            Born: {dob}
          </text>
        ) : null}
      </g>
    );
  }, [selectedBird, setSelectedBird]);

  /* ── loading ── */
  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Spinner size="xl" color="teal.500" />
          <Text color="gray.600">Loading family tree…</Text>
        </VStack>
      </Flex>
    );
  }

  /* ── error ── */
  if (error || !birdTree || !treeData) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Header onLogout={handleLogout} />
        <Container maxW="7xl" px={6} py={12}>
          <Card borderLeft="4px" borderColor="red.500" bg="red.50">
            <CardBody>
              <HStack gap={4}>
                <Box color="red.500"><FiAlertCircle size={24} /></Box>
                <VStack align="start" gap={2}>
                  <Heading size="sm" color="red.600">Error Loading Family Tree</Heading>
                  <Text color="red.700">{error ?? 'Family tree not found'}</Text>
                  <Button size="sm" colorScheme="red" variant="outline" onClick={() => router.push('/birds')}>
                    Back to Birds List
                  </Button>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </Container>
        <Footer />
      </Box>
    );
  }

  /* ── main render ── */
  return (
    <Box h="100vh" bg="gray.50" display="flex" flexDirection="column" overflow="hidden">
      <Header onLogout={handleLogout} />

      <Container
        maxW="full" px={{ base: 4, md: 6 }} py={{ base: 6, md: 8 }}
        flex="1" display="flex" flexDirection="column" minH="0"
      >
        {/* Page header */}
        <HStack justify="space-between" align="center" mb={4} flexWrap="wrap" gap={4}>
          <HStack gap={3}>
            <Button variant="ghost" size="sm" onClick={() => router.push(`/birds/${birdId}`)} _hover={{ bg: 'teal.50' }}>
              <FiArrowLeft style={{ marginRight: '6px' }} /> Back
            </Button>
            <VStack align="start" gap={0}>
              <Heading size={{ base: 'md', md: 'lg' }} color="gray.800">Family Tree</Heading>
              <Text fontSize="sm" color="gray.500">
                {birdTree?.name || birdTree?.band_id} — Ancestry Chart
              </Text>
            </VStack>
          </HStack>
          <HStack gap={2}>
            <Button colorScheme="blue" variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
              <FiDownload style={{ marginRight: '6px' }} />
              {isExporting ? 'Generating…' : 'Export PDF'}
            </Button>
            <Button colorScheme="teal" size="sm" onClick={() => router.push('/birds')}>All Birds</Button>
          </HStack>
        </HStack>

        {/* Export message */}
        {exportMsg && (
          <Card mb={3} bg={MSG_COLORS[exportMsg.type].bg} borderLeft="4px" borderColor={MSG_COLORS[exportMsg.type].border}>
            <CardBody py={2}>
              <Text color={MSG_COLORS[exportMsg.type].text} fontWeight="600" fontSize="sm">{exportMsg.text}</Text>
            </CardBody>
          </Card>
        )}

        {/* Legend */}
        <HStack gap={4} mb={3} flexWrap="wrap" bg="white" px={4} py={2} borderRadius="lg" boxShadow="sm">
          <HStack gap={1}>
            <Box w="14px" h="14px" bg="#EBF8FF" border="2px solid #3182CE" borderRadius="3px" />
            <Text fontSize="xs" color="gray.600">Subject</Text>
          </HStack>
          <HStack gap={2} align="center">
            <svg width="22" height="22" viewBox="-11 -11 22 22" style={{ display: 'block' }}>
              <circle cx="0" cy="0" r="11" fill="#0369A1"/>
              <g stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="-1.5" cy="2.5" r="4.5"/>
                <line x1="2" y1="-1" x2="7" y2="-6"/>
                <polyline points="4,-6 7,-6 7,-3"/>
              </g>
            </svg>
            <Text fontSize="xs" color="gray.600">Cock (M)</Text>
          </HStack>
          <HStack gap={2} align="center">
            <svg width="22" height="22" viewBox="-11 -11 22 22" style={{ display: 'block' }}>
              <circle cx="0" cy="0" r="11" fill="#BE185D"/>
              <g stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="0" cy="-2.5" r="4.5"/>
                <line x1="0" y1="2" x2="0" y2="8"/>
                <line x1="-3.5" y1="5.5" x2="3.5" y2="5.5"/>
              </g>
            </svg>
            <Text fontSize="xs" color="gray.600">Hen (F)</Text>
          </HStack>
          <Text fontSize="xs" color="gray.400" ml="auto" display={{ base: 'none', md: 'block' }}>
            Click a node to view details · Scroll to zoom · Drag to pan
          </Text>
        </HStack>

        {/* Tree + Detail panel */}
        <HStack gap={3} flex="1" minH="0" align="stretch">

          {/* Tree canvas */}
          <Box
            ref={canvasRef}
            bg="white"
            borderRadius="xl"
            boxShadow="xl"
            overflow="hidden"
            flex="1"
            minH="500px"
            border="1px solid"
            borderColor="gray.200"
          >
            {treeData && (
              <Tree
                data={treeData}
                orientation="horizontal"
                translate={{ x: 160, y: Math.round(canvasH * 0.65) }}
                nodeSize={{ x: 290, y: 130 }}
                separation={{ siblings: 1.1, nonSiblings: 1.4 }}
                pathFunc="step"
                renderCustomNodeElement={renderNode}
                zoom={0.72}
                zoomable
                draggable
                pathClassFunc={() => 'ftree-link'}
              />
            )}
          </Box>

          {/* ── Bird detail panel ── */}
          <Box
            w={{ base: 'full', lg: '290px' }}
            display={{ base: 'none', lg: 'flex' }}
            flexDirection="column"
            flexShrink={0}
          >
            <Card h="full" boxShadow="xl" border="1px solid" borderColor="gray.200">
              <CardBody display="flex" flexDirection="column" gap={0} p={0}>
                {selectedBird ? (() => {
                  /* colours for the selected bird */
                  let panelBg: string, panelBorder: string, panelLabel: string;
                  if (selectedBird.isRoot)             { panelBg = '#EBF8FF'; panelBorder = '#3182CE'; panelLabel = 'SUBJECT'; }
                  else if (selectedBird.sex === 'M')   { panelBg = '#E0F7FA'; panelBorder = '#00838F'; panelLabel = 'COCK';    }
                  else if (selectedBird.sex === 'F')   { panelBg = '#FCE4EC'; panelBorder = '#C2185B'; panelLabel = 'HEN';     }
                  else                                 { panelBg = '#F7FAFC'; panelBorder = '#A0AEC0'; panelLabel = 'UNKNOWN'; }
                  const badgeBg = selectedBird.sex === 'M' ? '#0369A1' : selectedBird.sex === 'F' ? '#BE185D' : '#64748B';

                  return (
                    <>
                      {/* Coloured header strip */}
                      <Box bg={panelBg} px={4} py={3} borderBottom="2px solid" borderColor={panelBorder}
                        borderTopRadius="lg">
                        <HStack justify="space-between" align="center">
                          <Box px={2} py={0.5} bg={panelBorder} borderRadius="full">
                            <Text fontSize="9px" fontWeight="800" color="white" letterSpacing="1.2">
                              {panelLabel}
                            </Text>
                          </Box>
                          {/* Sex icon */}
                          <svg width="28" height="28" viewBox="-14 -14 28 28">
                            <circle cx="0" cy="0" r="14" fill={badgeBg}/>
                            {selectedBird.sex === 'M' ? (
                              <g stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="-2" cy="4" r="7"/>
                                <line x1="3" y1="-2" x2="10" y2="-9"/>
                                <polyline points="6,-9 10,-9 10,-5"/>
                              </g>
                            ) : selectedBird.sex === 'F' ? (
                              <g stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="0" cy="-4" r="7"/>
                                <line x1="0" y1="3" x2="0" y2="12"/>
                                <line x1="-5" y1="8" x2="5" y2="8"/>
                              </g>
                            ) : (
                              <text textAnchor="middle" dominantBaseline="central" fontSize="14" fill="white">?</text>
                            )}
                          </svg>
                        </HStack>
                        <Text mt={2} fontSize="xl" fontWeight="800" color={panelBorder} letterSpacing="0.5px">
                          {selectedBird.bandId}
                        </Text>
                        {selectedBird.displayName && (
                          <Text fontSize="sm" color="gray.600" mt={0.5}>{selectedBird.displayName}</Text>
                        )}
                      </Box>

                      {/* Details body */}
                      <VStack align="stretch" gap={0} flex="1" overflowY="auto">
                        {/* Sex row */}
                        <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
                          <Text fontSize="10px" fontWeight="700" color="gray.400" letterSpacing="1" mb={1}>SEX</Text>
                          <HStack gap={2}>
                            <Box w="8px" h="8px" borderRadius="full" bg={badgeBg} />
                            <Text fontSize="sm" fontWeight="600" color="gray.700">
                              {selectedBird.sex === 'M' ? 'Cock' : selectedBird.sex === 'F' ? 'Hen' : 'Unknown'}
                            </Text>
                          </HStack>
                        </Box>

                        {/* DOB row */}
                        <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
                          <Text fontSize="10px" fontWeight="700" color="gray.400" letterSpacing="1" mb={1}>DATE OF BIRTH</Text>
                          <Text fontSize="sm" color="gray.700">
                            {selectedBird.dob || <Text as="span" color="gray.400" fontStyle="italic">Not recorded</Text>}
                          </Text>
                        </Box>

                        {/* Spacer */}
                        <Box flex="1" />

                        <Separator />

                        {/* Action buttons */}
                        <VStack gap={2} px={4} py={4}>
                          <Button
                            w="full" size="sm" colorScheme="teal"
                            onClick={() => router.push(`/birds/${selectedBird.id}`)}
                          >
                            <FiUser style={{ marginRight: '6px' }} /> View Full Profile
                          </Button>
                          {!selectedBird.isRoot && (
                            <Button
                              w="full" size="sm" colorScheme="blue" variant="outline"
                              onClick={() => router.push(`/birds/${selectedBird.id}/family-tree`)}
                            >
                              <FiGitBranch style={{ marginRight: '6px' }} /> View Family Tree
                            </Button>
                          )}
                          <Button
                            w="full" size="sm" variant="ghost" colorScheme="gray"
                            onClick={() => router.push(`/birds/${selectedBird.id}/edit`)}
                          >
                            <FiExternalLink style={{ marginRight: '6px' }} /> Edit Bird
                          </Button>
                        </VStack>
                      </VStack>
                    </>
                  );
                })() : (
                  /* Empty state */
                  <Flex flex="1" align="center" justify="center" flexDirection="column" gap={3} p={6}>
                    <Box color="gray.300">
                      <FiUser size={40} />
                    </Box>
                    <Text fontSize="sm" color="gray.400" textAlign="center" fontWeight="500">
                      Click any node in the tree to view bird details here
                    </Text>
                  </Flex>
                )}
              </CardBody>
            </Card>
          </Box>

        </HStack>

        <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
          Showing up to 4 generations of ancestry
        </Text>
      </Container>

      <Footer />

      <style>{`
        .ftree-link { stroke: #CBD5E0 !important; stroke-width: 2px !important; fill: none !important; }
        .rd3t-svg text, .rd3t-node text, .rd3t-leaf-node text {
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `}</style>
    </Box>
  );
}
