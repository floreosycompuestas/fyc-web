'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { Card, CardBody } from '@chakra-ui/card';
import { FiArrowLeft, FiAlertCircle, FiDownload } from 'react-icons/fi';
import Link from 'next/link';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

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

export default function FamilyTreePage() {
  const router = useRouter();
  const params = useParams();
  const birdId = params?.id as string;
  const treeRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [birdTree, setBirdTree] = useState<BirdNode | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    }
  };

  // Export family tree as PDF
  const handleExportPDF = async () => {
    if (!treeRef.current || !birdTree) return;

    setIsExportingPDF(true);
    setExportMessage({ type: 'info', message: 'Generating PDF... Please wait' });

    try {
      // Dynamically import libraries (client-side only)
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Capture the tree as an image
      console.log('Starting PDF export with html2canvas...');

      // Wait a moment for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(treeRef.current, {
        scale: 1.5,
        logging: false,
        windowWidth: treeRef.current.scrollWidth,
        windowHeight: treeRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          // Remove all box-shadows to avoid color parsing errors
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: any) => {
            if (el.style) {
              el.style.boxShadow = 'none';
              el.style.textShadow = 'none';
            }
          });

          // Also remove Chakra UI's shadow classes
          const elementsWithShadow = clonedDoc.querySelectorAll('[class*="shadow"]');
          elementsWithShadow.forEach((el: any) => {
            el.style.boxShadow = 'none';
          });
        },
      });

      console.log('Canvas created successfully:', canvas.width, 'x', canvas.height);

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Add the image to PDF
      const imgData = canvas.toDataURL('image/png');

      // If image is taller than one page, we might need to scale it down
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let finalWidth = pageWidth - 20; // Leave margins
      let finalHeight = (canvas.height * finalWidth) / canvas.width;

      // Scale down if image is too tall for the page
      if (finalHeight > pageHeight - 20) {
        finalHeight = pageHeight - 20;
        finalWidth = (canvas.width * finalHeight) / canvas.height;
      }

      // Center the image on the page
      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = 10;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

      // Add metadata
      pdf.setProperties({
        title: `Family Tree - ${birdTree.band_id}`,
        subject: 'Bird Family Tree',
        author: 'FYC - Find Your Canary',
        keywords: 'bird, family tree, pedigree',
        creator: 'FYC Application',
      });

      // Generate filename
      const filename = `FamilyTree_${birdTree.band_id.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

      // Save the PDF
      pdf.save(filename);

      setExportMessage({
        type: 'success',
        message: `✓ PDF Exported! Family tree saved as ${filename}`
      });

      // Clear success message after 5 seconds
      setTimeout(() => setExportMessage(null), 5000);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setExportMessage({
        type: 'error',
        message: `✗ Export Failed. ${err instanceof Error ? err.message : 'Please try again.'}`
      });

      // Clear error message after 5 seconds
      setTimeout(() => setExportMessage(null), 5000);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Recursively fetch bird and its ancestors
  const fetchBirdWithAncestors = async (id: number, depth: number = 0): Promise<BirdNode | null> => {
    // Limit recursion depth to avoid infinite loops and performance issues
    if (depth > 4) return null;

    try {
      const response = await fetch(`/api/birds/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const bird: Bird = await response.json();
      const birdNode: BirdNode = { ...bird };

      // Fetch father if exists
      if (bird.father_id) {
        birdNode.father = await fetchBirdWithAncestors(bird.father_id, depth + 1) || undefined;
      }

      // Fetch mother if exists
      if (bird.mother_id) {
        birdNode.mother = await fetchBirdWithAncestors(bird.mother_id, depth + 1) || undefined;
      }

      return birdNode;
    } catch (err) {
      console.error(`Error fetching bird ${id}:`, err);
      return null;
    }
  };

  useEffect(() => {
    const loadFamilyTree = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const tree = await fetchBirdWithAncestors(parseInt(birdId));
        if (!tree) {
          throw new Error('Failed to load bird family tree');
        }

        setBirdTree(tree);
      } catch (err) {
        console.error('Error loading family tree:', err);
        setError(err instanceof Error ? err.message : 'Failed to load family tree');
      } finally {
        setIsLoading(false);
      }
    };

    if (birdId) {
      loadFamilyTree();
    }
  }, [birdId]);

  // Render a bird card in the tree
  const renderBirdCard = (bird: BirdNode | undefined, generation: number, position: 'father' | 'mother' | 'root') => {
    if (!bird) {
      return (
        <Box
          p={4}
          bg="gray.100"
          borderRadius="lg"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="gray.300"
          minW={{ base: '200px', md: '250px' }}
          textAlign="center"
        >
          <Text fontSize="sm" color="gray.500">
            Unknown {position === 'father' ? 'Father' : position === 'mother' ? 'Mother' : 'Bird'}
          </Text>
        </Box>
      );
    }

    const bgColor = position === 'root'
      ? 'blue.50'
      : position === 'father'
      ? 'cyan.50'
      : 'pink.50';

    const borderColor = position === 'root'
      ? 'blue.500'
      : position === 'father'
      ? 'cyan.500'
      : 'pink.500';

    return (
      <Box
        p={4}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="2px"
        borderColor={borderColor}
        minW={{ base: '200px', md: '250px' }}
        boxShadow="md"
        transition="all 0.2s"
        _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
      >
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between">
            <Text fontSize="xs" fontWeight="600" color="gray.600" textTransform="uppercase">
              {position === 'root' ? 'Subject' : position === 'father' ? '♂ Father' : '♀ Mother'}
            </Text>
            {bird.sex && (
              <Text fontSize="xs" fontWeight="600" color={bird.sex === 'M' ? 'blue.600' : 'pink.600'}>
                {bird.sex === 'M' ? '♂' : '♀'}
              </Text>
            )}
          </HStack>

          <Link href={`/birds/${bird.id}`} style={{ textDecoration: 'none' }}>
            <Text
              fontWeight="700"
              fontSize="sm"
              color="blue.700"
              _hover={{ textDecoration: 'underline' }}
              cursor="pointer"
            >
              {bird.band_id}
            </Text>
          </Link>

          {bird.name && (
            <Text fontSize="xs" color="gray.700" fontWeight="500">
              {bird.name}
            </Text>
          )}

          {bird.dob && (
            <Text fontSize="xs" color="gray.600">
              Born: {new Date(bird.dob).toLocaleDateString()}
            </Text>
          )}

          <Text fontSize="xs" color="gray.500" fontStyle="italic">
            Generation: {generation}
          </Text>
        </VStack>
      </Box>
    );
  };

  // Render parents row
  const renderParentsRow = (bird: BirdNode | undefined, generation: number) => {
    if (!bird || (!bird.father && !bird.mother)) {
      return null;
    }

    return (
      <VStack gap={6} align="center">
        {/* Connection lines */}
        <Box position="relative" w="100%" h="40px">
          <Box
            position="absolute"
            top="0"
            left="50%"
            w="2px"
            h="20px"
            bg="gray.400"
            transform="translateX(-50%)"
          />
          <Box
            position="absolute"
            top="20px"
            left="25%"
            right="25%"
            h="2px"
            bg="gray.400"
          />
          {bird.father && (
            <Box
              position="absolute"
              top="20px"
              left="25%"
              w="2px"
              h="20px"
              bg="gray.400"
            />
          )}
          {bird.mother && (
            <Box
              position="absolute"
              top="20px"
              right="25%"
              w="2px"
              h="20px"
              bg="gray.400"
            />
          )}
        </Box>

        {/* Parents cards */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 6, md: 12 }}
          justify="center"
          align="center"
          w="100%"
        >
          <VStack gap={4}>
            {renderBirdCard(bird.father, generation + 1, 'father')}
            {bird.father && renderParentsRow(bird.father, generation + 1)}
          </VStack>

          <VStack gap={4}>
            {renderBirdCard(bird.mother, generation + 1, 'mother')}
            {bird.mother && renderParentsRow(bird.mother, generation + 1)}
          </VStack>
        </Flex>
      </VStack>
    );
  };

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Spinner size="xl" color="teal.500" />
          <Text color="gray.600">Loading family tree...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error || !birdTree) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        <Header onLogout={handleLogout} />
        <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
          <Card borderLeft="4px" borderColor="red.500" bg="red.50">
            <CardBody>
              <HStack gap={4} align="flex-start">
                <Box color="red.500" pt={1}>
                  <FiAlertCircle size={24} />
                </Box>
                <VStack align="flex-start" gap={2}>
                  <Heading size="sm" color="red.600">
                    Error Loading Family Tree
                  </Heading>
                  <Text color="red.700" fontSize={{ base: 'sm', md: 'base' }}>
                    {error || 'Family tree not found'}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => router.push('/birds')}
                  >
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

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Header onLogout={handleLogout} />

      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        {/* Header with actions */}
        <HStack justify="space-between" align="center" mb={{ base: 6, md: 8 }} flexWrap="wrap" gap={4}>
          <HStack gap={4} align="center">
            <Button
              variant="ghost"
              onClick={() => router.push(`/birds/${birdId}`)}
              _hover={{ bg: 'teal.50' }}
            >
              <FiArrowLeft style={{ marginRight: '8px' }} />
              Back to Bird Details
            </Button>
            <VStack align="flex-start" gap={0}>
              <Heading size={{ base: 'lg', md: '2xl' }} color="gray.800">
                Family Tree
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {birdTree.name || birdTree.band_id} - Ancestry Chart
              </Text>
            </VStack>
          </HStack>

          <HStack gap={2} flexWrap="wrap">
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              size={{ base: 'sm', md: 'md' }}
            >
              <FiDownload style={{ marginRight: '8px' }} />
              {isExportingPDF ? 'Generating...' : 'Export PDF'}
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => router.push('/birds')}
              size={{ base: 'sm', md: 'md' }}
            >
              All Birds
            </Button>
          </HStack>
        </HStack>

        {/* Export Notification Banner */}
        {exportMessage && (
          <Card
            mb={6}
            bg={exportMessage.type === 'success' ? 'green.50' : exportMessage.type === 'error' ? 'red.50' : 'blue.50'}
            borderLeft="4px"
            borderColor={exportMessage.type === 'success' ? 'green.500' : exportMessage.type === 'error' ? 'red.500' : 'blue.500'}
          >
            <CardBody>
              <Text
                color={exportMessage.type === 'success' ? 'green.800' : exportMessage.type === 'error' ? 'red.800' : 'blue.800'}
                fontWeight="600"
              >
                {exportMessage.message}
              </Text>
            </CardBody>
          </Card>
        )}

        {/* Info Box and Family Tree - Wrapped for PDF Export */}
        <Box
          ref={treeRef}
          bg="white"
          p={4}
          borderRadius="md"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Info Box */}
          <Card mb={8} bg="blue.50" borderLeft="4px" borderColor="blue.500">
            <CardBody>
              <VStack align="start" gap={2}>
                <Text fontWeight="600" color="blue.800">
                  📊 Family Tree Visualization
                </Text>
                <Text fontSize="sm" color="blue.700">
                  This chart shows the ancestral lineage up to 4 generations. Click on any band ID to view that bird's details.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Family Tree */}
          <Card boxShadow="xl" overflow="auto">
            <CardBody p={{ base: 6, md: 10 }}>
              <VStack gap={8} align="center">
                {/* Root Bird (Subject) */}
                <VStack gap={4}>
                  <Text fontSize="sm" fontWeight="600" color="gray.600" textTransform="uppercase">
                    Subject Bird
                  </Text>
                  {renderBirdCard(birdTree, 0, 'root')}
                </VStack>

                {/* Parents and Ancestors */}
                {renderParentsRow(birdTree, 0)}

                {/* No parents message */}
                {!birdTree.father && !birdTree.mother && (
                  <Box
                    p={6}
                    bg="gray.50"
                    borderRadius="lg"
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor="gray.300"
                    textAlign="center"
                  >
                    <Text fontSize="sm" color="gray.600">
                    No parent information available for this bird
                  </Text>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Legend */}
        <Card mt={6} bg="gray.50">
          <CardBody>
            <Heading size="sm" mb={4} color="gray.700">
              Legend
            </Heading>
            <Flex gap={6} flexWrap="wrap">
              <HStack>
                <Box w="20px" h="20px" bg="blue.50" borderWidth="2px" borderColor="blue.500" borderRadius="md" />
                <Text fontSize="sm" color="gray.700">Subject Bird</Text>
              </HStack>
              <HStack>
                <Box w="20px" h="20px" bg="cyan.50" borderWidth="2px" borderColor="cyan.500" borderRadius="md" />
                <Text fontSize="sm" color="gray.700">Male (Father)</Text>
              </HStack>
              <HStack>
                <Box w="20px" h="20px" bg="pink.50" borderWidth="2px" borderColor="pink.500" borderRadius="md" />
                <Text fontSize="sm" color="gray.700">Female (Mother)</Text>
              </HStack>
              <HStack>
                <Box w="20px" h="20px" bg="gray.100" borderWidth="2px" borderColor="gray.300" borderRadius="md" borderStyle="dashed" />
                <Text fontSize="sm" color="gray.700">Unknown</Text>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
        </Box>
        {/* End of PDF Export Content */}
      </Container>

      <Footer />
    </Box>
  );
}

