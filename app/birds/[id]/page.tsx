'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { Card, CardBody } from '@chakra-ui/card';
import { FiArrowLeft, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';
import { API_ENDPOINTS } from '@/app/lib/constants';

interface Bird {
  id: number;
  band_id: string;
  name?: string;
  dob?: string;
  sex?: string;
  father_id?: number;
  mother_id?: number;
  breeder_id: number;
  owner_id?: number;
  created_at?: string;
  updated_at?: string;
}

export default function BirdDetailPage() {
  const router = useRouter();
  const params = useParams();
  const birdId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bird, setBird] = useState<Bird | null>(null);
  const [fatherBird, setFatherBird] = useState<Bird | null>(null);
  const [motherBird, setMotherBird] = useState<Bird | null>(null);

  useEffect(() => {
    const fetchBirdDetails = async () => {
      try {
        setError(null);

        // Fetch the bird details
        const response = await fetch(`/api/birds/${birdId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bird details');
        }

        const birdData = await response.json();
        setBird(birdData);

        // Fetch father bird if father_id exists
        if (birdData.father_id) {
          try {
            const fatherResponse = await fetch(`/api/birds/${birdData.father_id}`, {
              credentials: 'include',
            });
            if (fatherResponse.ok) {
              const fatherData = await fatherResponse.json();
              setFatherBird(fatherData);
            }
          } catch (err) {
            console.error('Error fetching father bird:', err);
          }
        }

        // Fetch mother bird if mother_id exists
        if (birdData.mother_id) {
          try {
            const motherResponse = await fetch(`/api/birds/${birdData.mother_id}`, {
              credentials: 'include',
            });
            if (motherResponse.ok) {
              const motherData = await motherResponse.json();
              setMotherBird(motherData);
            }
          } catch (err) {
            console.error('Error fetching mother bird:', err);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        console.error('Error fetching bird details:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (birdId) {
      fetchBirdDetails();
    }
  }, [birdId]);

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
          <Spinner size="xl" color="teal.500" />
          <Text color="gray.600">Loading bird details...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error || !bird) {
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
                    Error Loading Bird
                  </Heading>
                  <Text color="red.700" fontSize={{ base: 'sm', md: 'base' }}>
                    {error || 'Bird not found'}
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
              onClick={() => router.push('/birds')}
              _hover={{ bg: 'teal.50' }}
            >
              <FiArrowLeft style={{ marginRight: '8px' }} />
              Back to Birds
            </Button>
            <VStack align="flex-start" gap={0}>
              <Heading size={{ base: 'lg', md: '2xl' }} color="gray.800">
                {bird.name || bird.band_id}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Bird Details
              </Text>
            </VStack>
          </HStack>

          <HStack gap={2} flexWrap="wrap">
            <Button
              colorScheme="blue"
              variant="outline"
              size="md"
              onClick={() => router.push(`/birds/${bird.id}/family-tree`)}
            >
              🌳 Family Tree
            </Button>
            <Button
              colorScheme="teal"
              variant="outline"
              size="md"
              onClick={() => router.push(`/birds/${bird.id}/edit`)}
            >
              <FiEdit2 style={{ marginRight: '8px' }} />
              Edit
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              size="md"
              onClick={() => router.push(`/birds/${bird.id}/delete`)}
            >
              <FiTrash2 style={{ marginRight: '8px' }} />
              Delete
            </Button>
          </HStack>
        </HStack>

        {/* Bird Details Card */}
        <Card bg="white" shadow="md">
          <CardBody>
            <VStack align="stretch" gap={6}>
              {/* Basic Information */}
              <Box>
                <Heading size="md" color="teal.600" mb={4}>
                  Basic Information
                </Heading>
                <VStack align="stretch" gap={3}>
                  <Flex justify="space-between" py={2} borderBottom="1px" borderColor="gray.200">
                    <Text fontWeight="semibold" color="gray.600">Band ID:</Text>
                    <Text color="gray.800" fontWeight="medium">{bird.band_id}</Text>
                  </Flex>
                  {bird.name && (
                    <Flex justify="space-between" py={2} borderBottom="1px" borderColor="gray.200">
                      <Text fontWeight="semibold" color="gray.600">Name:</Text>
                      <Text color="gray.800">{bird.name}</Text>
                    </Flex>
                  )}
                  <Flex justify="space-between" py={2} borderBottom="1px" borderColor="gray.200">
                    <Text fontWeight="semibold" color="gray.600">Species:</Text>
                    <Text color="gray.800">Spanish Timbrado</Text>
                  </Flex>
                  {bird.sex && (
                    <Flex justify="space-between" py={2} borderBottom="1px" borderColor="gray.200">
                      <Text fontWeight="semibold" color="gray.600">Sex:</Text>
                      <Text color="gray.800">
                        {bird.sex === 'M' ? 'Male' : bird.sex === 'F' ? 'Female' : bird.sex}
                      </Text>
                    </Flex>
                  )}
                  {bird.dob && (
                    <Flex justify="space-between" py={2} borderBottom="1px" borderColor="gray.200">
                      <Text fontWeight="semibold" color="gray.600">Date of Birth:</Text>
                      <Text color="gray.800">{new Date(bird.dob).toLocaleDateString()}</Text>
                    </Flex>
                  )}
                </VStack>
              </Box>

              {/* Parent Information */}
              {(fatherBird || motherBird) && (
                <Box>
                  <Heading size="md" color="teal.600" mb={4}>
                    Parent Information
                  </Heading>
                  <VStack align="stretch" gap={4}>
                    {fatherBird && (
                      <Box p={3} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                        <Text fontWeight="semibold" color="gray.700" mb={2} fontSize="sm">
                          Father
                        </Text>
                        <VStack align="stretch" gap={2}>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="sm" color="gray.600">Band ID:</Text>
                            <Button
                              variant="ghost"
                              colorScheme="teal"
                              size="sm"
                              onClick={() => router.push(`/birds/${fatherBird.id}`)}
                              fontWeight="medium"
                            >
                              {fatherBird.band_id}
                            </Button>
                          </Flex>
                          {fatherBird.name && (
                            <Flex justify="space-between">
                              <Text fontSize="sm" color="gray.600">Name:</Text>
                              <Text fontSize="sm" color="gray.800">{fatherBird.name}</Text>
                            </Flex>
                          )}
                          {fatherBird.sex && (
                            <Flex justify="space-between">
                              <Text fontSize="sm" color="gray.600">Sex:</Text>
                              <Text fontSize="sm" color="gray.800">
                                {fatherBird.sex === 'M' ? 'Male' : fatherBird.sex === 'F' ? 'Female' : fatherBird.sex}
                              </Text>
                            </Flex>
                          )}
                          {fatherBird.dob && (
                            <Flex justify="space-between">
                              <Text fontSize="sm" color="gray.600">DOB:</Text>
                              <Text fontSize="sm" color="gray.800">
                                {new Date(fatherBird.dob).toLocaleDateString()}
                              </Text>
                            </Flex>
                          )}
                        </VStack>
                      </Box>
                    )}
                    {motherBird && (
                      <Box p={3} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
                        <Text fontWeight="semibold" color="gray.700" mb={2} fontSize="sm">
                          Mother
                        </Text>
                        <VStack align="stretch" gap={2}>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="sm" color="gray.600">Band ID:</Text>
                            <Button
                              variant="ghost"
                              colorScheme="teal"
                              size="sm"
                              onClick={() => router.push(`/birds/${motherBird.id}`)}
                              fontWeight="medium"
                            >
                              {motherBird.band_id}
                            </Button>
                          </Flex>
                          {motherBird.name && (
                            <Flex justify="space-between">
                              <Text fontSize="sm" color="gray.600">Name:</Text>
                              <Text fontSize="sm" color="gray.800">{motherBird.name}</Text>
                            </Flex>
                          )}
                          {motherBird.sex && (
                            <Flex justify="space-between">
                              <Text fontSize="sm" color="gray.600">Sex:</Text>
                              <Text fontSize="sm" color="gray.800">
                                {motherBird.sex === 'M' ? 'Male' : motherBird.sex === 'F' ? 'Female' : motherBird.sex}
                              </Text>
                            </Flex>
                          )}
                          {motherBird.dob && (
                            <Flex justify="space-between">
                              <Text fontSize="sm" color="gray.600">DOB:</Text>
                              <Text fontSize="sm" color="gray.800">
                                {new Date(motherBird.dob).toLocaleDateString()}
                              </Text>
                            </Flex>
                          )}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Metadata */}
              <Box>
                <Heading size="md" color="teal.600" mb={4}>
                  Record Information
                </Heading>
                <VStack align="stretch" gap={3}>
                  {bird.created_at && (
                    <Flex justify="space-between" py={2} borderBottom="1px" borderColor="gray.200">
                      <Text fontWeight="semibold" color="gray.600">Created:</Text>
                      <Text color="gray.800" fontSize="sm">
                        {new Date(bird.created_at).toLocaleString()}
                      </Text>
                    </Flex>
                  )}
                  {bird.updated_at && (
                    <Flex justify="space-between" py={2} borderBottom="1px" borderColor="gray.200">
                      <Text fontWeight="semibold" color="gray.600">Last Updated:</Text>
                      <Text color="gray.800" fontSize="sm">
                        {new Date(bird.updated_at).toLocaleString()}
                      </Text>
                    </Flex>
                  )}
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Container>

      <Footer />
    </Box>
  );
}
