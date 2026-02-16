'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Flex,
  IconButton,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import { Card, CardBody } from '@chakra-ui/card';
import { FiPlus, FiArrowLeft, FiEdit2, FiTrash2, FiAlertCircle, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { PiTreeStructure } from 'react-icons/pi';
import { EnhancedList, ListItemCard } from '@/app/components/ui';
import { Bird, Breeder } from '@/app/types';
import { fetchCurrentBreeder, fetchBirdsByBreeder } from '@/app/lib/api';
import { API_ENDPOINTS } from '@/app/lib/constants';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';

export default function BirdsContent() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breeder, setBreeder] = useState<Breeder | null>(null);
  const [birds, setBirds] = useState<Bird[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination
  const totalPages = Math.ceil(birds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBirds = birds.slice(startIndex, endIndex);

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Helper function to get parent band IDs
  const getParentBandId = (parentId: number | undefined): string | undefined => {
    if (!parentId) return undefined;
    const parentBird = birds.find((bird) => bird.id === parentId);
    return parentBird?.band_id;
  };

  useEffect(() => {
    const fetchBirdsForBreeder = async () => {
      try {
        setError(null);

        // Fetch the breeder for the current user
        const breederData = await fetchCurrentBreeder();
        setBreeder(breederData);
        const breederId = breederData.id;

        // Fetch birds for this breeder
        const birdsData = await fetchBirdsByBreeder(breederId);
        setBirds(birdsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        console.error('Error fetching breeder birds:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBirdsForBreeder();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) console.error('Logout failed');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <VStack gap={4}>
          <Box as="span" fontSize="3xl">⏳</Box>
          <Text color="gray.600">Loading birds...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      {/* Header Component */}
      <Header onLogout={handleLogout} />

      <Container maxW="7xl" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        <HStack justify="space-between" align="center" mb={{ base: 6, md: 8 }}>
          <HStack gap={4} align="center">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              _hover={{ bg: 'teal.50' }}
            >
              <FiArrowLeft style={{ marginRight: '8px' }} />
              Back
            </Button>
            <VStack align="flex-start" gap={0}>
              <Heading size={{ base: 'lg', md: '2xl' }} color="gray.800">
                {breeder ? `${breeder.first_name} ${breeder.last_name}'s Birds` : 'Birds'}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Manage and track your Spanish Timbrado birds
              </Text>
            </VStack>
          </HStack>
          <Button
            colorScheme="teal"
            size="md"
            onClick={() => router.push('/birds/create')}
          >
            <FiPlus style={{ marginRight: '8px' }} />
            Add Bird
          </Button>
        </HStack>

        {error ? (
          <Card borderLeft="4px" borderColor="red.500" bg="red.50">
            <CardBody>
              <HStack gap={4} align="flex-start">
                <Box color="red.500" pt={1}>
                  <FiAlertCircle size={24} />
                </Box>
                <VStack align="flex-start" gap={2}>
                  <Heading size="sm" color="red.600">
                    Error Loading Birds
                  </Heading>
                  <Text color="red.700" fontSize={{ base: 'sm', md: 'base' }}>
                    {error}
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Pagination Controls */}
            {birds.length > 0 && (
              <Card mb={4} bg="white" shadow="sm">
                <CardBody>
                  <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align={{ base: 'stretch', md: 'center' }}
                    gap={4}
                  >
                    {/* Items per page selector */}
                    <HStack gap={2}>
                      <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
                        Show:
                      </Text>
                      <Box>
                        <select
                          style={{
                            fontSize: '0.875rem',
                            paddingLeft: '0.75rem',
                            paddingRight: '0.75rem',
                            paddingTop: '0.25rem',
                            paddingBottom: '0.25rem',
                            borderRadius: '0.375rem',
                            borderWidth: '1px',
                            borderColor: '#CBD5E0',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                          }}
                          value={itemsPerPage}
                          onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </Box>
                      <Text fontSize="sm" color="gray.600">
                        per page
                      </Text>
                    </HStack>

                    {/* Page info and navigation */}
                    <HStack gap={2} justify={{ base: 'center', md: 'flex-end' }}>
                      <Text fontSize="sm" color="gray.600" whiteSpace="nowrap">
                        Page {currentPage} of {totalPages} ({birds.length} total)
                      </Text>

                      {/* Pagination buttons */}
                      <HStack gap={1}>
                        <IconButton
                          aria-label="First page"
                          size="sm"
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                        >
                          <FiChevronsLeft />
                        </IconButton>
                        <IconButton
                          aria-label="Previous page"
                          size="sm"
                          variant="outline"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          <FiChevronLeft />
                        </IconButton>
                        <IconButton
                          aria-label="Next page"
                          size="sm"
                          variant="outline"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          <FiChevronRight />
                        </IconButton>
                        <IconButton
                          aria-label="Last page"
                          size="sm"
                          variant="outline"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          <FiChevronsRight />
                        </IconButton>
                      </HStack>
                    </HStack>
                  </Flex>
                </CardBody>
              </Card>
            )}

            {/* Bird List */}
            <EnhancedList<Bird>
              items={currentBirds}
              variant="card"
              hoverable={true}
              spacing={4}
              emptyMessage="No birds yet. Click 'Add Bird' to add a new bird."
              renderItem={(bird) => {
                const fatherBandId = getParentBandId(bird.father_id);
                const motherBandId = getParentBandId(bird.mother_id);

                return (
                  <ListItemCard
                    title={bird.name || bird.band_id}
                    subtitle={`Band ID: ${bird.band_id}`}
                    metadata={[
                      {
                        label: 'Species',
                        value: 'Spanish Timbrado',
                      },
                      bird.sex && {
                        label: 'Sex',
                        value: bird.sex === 'M' ? 'Male' : bird.sex === 'F' ? 'Female' : bird.sex,
                      },
                      bird.dob && {
                        label: 'DOB',
                        value: new Date(bird.dob).toLocaleDateString(),
                      },
                      fatherBandId && {
                        label: 'Father',
                        value: fatherBandId as any,
                      },
                      motherBandId && {
                        label: 'Mother',
                        value: motherBandId as any,
                      },
                    ].filter(Boolean) as any}
                    actions={[
                      {
                        icon: <PiTreeStructure />,
                        colorScheme: "blue",
                        variant: 'outline',
                        onClick: () => router.push(`/birds/${bird.id}/family-tree`),
                      },
                      {
                        icon: <FiEdit2 />,
                        colorScheme: "teal",
                        variant: 'outline',
                        onClick: () => router.push(`/birds/${bird.id}/edit`),
                      },
                      {
                        icon: <FiTrash2 />,
                        colorScheme: 'red',
                        variant: 'outline',
                        onClick: () => router.push(`/birds/${bird.id}/delete`),
                      },
                    ]}
                  >
                    {/* Custom Band ID with clickable link */}
                    <Box mt={2} mb={2}>
                      <ChakraLink
                        as={Link}
                        href={`/birds/${bird.id}`}
                        color="teal.600"
                        fontWeight="medium"
                        fontSize="sm"
                        _hover={{ color: 'teal.700', textDecoration: 'underline' }}
                      >
                        View Details →
                      </ChakraLink>
                    </Box>

                    {/* Parent Links */}
                    {(fatherBandId || motherBandId) && (
                      <Box mt={2} fontSize="xs">
                        {fatherBandId && (
                          <Box mb={1}>
                            <Text as="span" color="gray.600">Father: </Text>
                            <ChakraLink
                              as={Link}
                              href={`/birds/${bird.father_id}`}
                              color="teal.600"
                              _hover={{ textDecoration: 'underline' }}
                            >
                              {fatherBandId}
                            </ChakraLink>
                          </Box>
                        )}
                        {motherBandId && (
                          <Box>
                            <Text as="span" color="gray.600">Mother: </Text>
                            <ChakraLink
                              as={Link}
                              href={`/birds/${bird.mother_id}`}
                              color="teal.600"
                              _hover={{ textDecoration: 'underline' }}
                            >
                              {motherBandId}
                            </ChakraLink>
                          </Box>
                        )}
                      </Box>
                    )}
                  </ListItemCard>
                );
              }}
            />
          </>
        )}
      </Container>

      {/* Professional Footer */}
      <Footer />
    </Box>
  );
}

